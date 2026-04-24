const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndClearPending() {
    console.log('🔍 Checking wallet balances and clearing pending...\n');

    try {
        // 1. Check current wallet balances
        console.log('1. Current wallet balances:');
        const { data: wallets, error: walletsError } = await supabase
            .from('wallets')
            .select('merchant_id, pending_balance, available_balance, updated_at')
            .order('pending_balance', { ascending: false })
            .limit(10);

        if (walletsError) {
            console.error('Error fetching wallets:', walletsError.message);
            return;
        }

        wallets.forEach(w => {
            console.log(`   Merchant ${w.merchant_id.substring(0, 8)}...`);
            console.log(`     Pending: Rp ${w.pending_balance?.toLocaleString('id-ID') || 0}`);
            console.log(`     Available: Rp ${w.available_balance?.toLocaleString('id-ID') || 0}`);
            console.log(`     Total: Rp ${(w.pending_balance + w.available_balance)?.toLocaleString('id-ID') || 0}`);
        });

        // 2. Check orders status
        console.log('\n2. Checking successful orders:');
        const { data: successfulOrders, error: ordersError } = await supabase
            .from('orders')
            .select('id, merchant_id, net_amount, updated_at, status')
            .in('status', ['success', 'paid'])
            .order('updated_at', { ascending: true })
            .limit(5);

        if (ordersError) {
            console.error('Error fetching orders:', ordersError.message);
        } else {
            console.log(`   Found ${successfulOrders.length} successful orders`);
            if (successfulOrders.length > 0) {
                const oldest = successfulOrders[0];
                const newest = successfulOrders[successfulOrders.length - 1];
                console.log(`   Oldest: ${oldest.updated_at} (${oldest.id.substring(0, 8)}...)`);
                console.log(`   Newest: ${newest.updated_at} (${newest.id.substring(0, 8)}...)`);
            }
        }

        // 3. Check if clear_pending_balances function exists
        console.log('\n3. Checking clear_pending_balances function...');
        try {
            const { data: funcExists, error: funcError } = await supabase.rpc('clear_pending_balances', {
                p_days_threshold: 0
            });

            if (funcError) {
                if (funcError.code === '42883') {
                    console.log('   ❌ Function does not exist yet');
                    console.log('   Need to create the function first');

                    // Create the function
                    console.log('   Creating function...');
                    await createClearFunction();
                } else {
                    console.error('   Error calling function:', funcError.message);
                }
            } else {
                console.log('   ✅ Function exists and can be called');
            }
        } catch (e) {
            console.log('   Function check failed:', e.message);
        }

        // 4. Try to clear pending balances (with 0 days threshold for testing)
        console.log('\n4. Attempting to clear pending balances...');
        try {
            const { data: cleared, error: clearError } = await supabase.rpc('clear_pending_balances', {
                p_days_threshold: 0  // 0 days means clear all
            });

            if (clearError) {
                console.error('   ❌ Error clearing pending:', clearError.message);
                console.log('   Trying alternative approach...');

                // Try simplified clearing
                await simpleClearPending();
            } else {
                console.log('   ✅ Clear function executed');
                if (cleared && cleared.length > 0) {
                    console.log(`   Cleared ${cleared.length} merchants`);
                    cleared.forEach(c => {
                        console.log(`     Merchant ${c.merchant_id?.substring(0, 8) || 'unknown'}...: Rp ${c.amount_cleared?.toLocaleString('id-ID') || 0}`);
                    });
                } else {
                    console.log('   No balances cleared (maybe already cleared or threshold too high)');
                }
            }
        } catch (e) {
            console.error('   Exception:', e.message);
            await simpleClearPending();
        }

        // 5. Check balances again after clearing
        console.log('\n5. Final wallet balances:');
        const { data: finalWallets } = await supabase
            .from('wallets')
            .select('merchant_id, pending_balance, available_balance')
            .order('available_balance', { ascending: false })
            .limit(5);

        finalWallets.forEach(w => {
            console.log(`   Merchant ${w.merchant_id.substring(0, 8)}...`);
            console.log(`     Pending: Rp ${w.pending_balance?.toLocaleString('id-ID')}`);
            console.log(`     Available: Rp ${w.available_balance?.toLocaleString('id-ID')}`);
        });

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

async function createClearFunction() {
    const sql = `
        CREATE OR REPLACE FUNCTION public.clear_pending_balances(
            p_days_threshold INTEGER DEFAULT 7
        )
        RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
        DECLARE
            rec RECORD;
        BEGIN
            FOR rec IN 
                SELECT DISTINCT o.merchant_id, 
                       SUM(o.net_amount) as total_to_clear
                FROM public.orders o
                WHERE o.status IN ('success', 'paid')
                  AND o.updated_at < NOW() - (p_days_threshold || ' days')::INTERVAL
                GROUP BY o.merchant_id
            LOOP
                -- Move from pending to available
                UPDATE public.wallets
                SET 
                    pending_balance = GREATEST(pending_balance - rec.total_to_clear, 0),
                    available_balance = available_balance + rec.total_to_clear,
                    updated_at = NOW()
                WHERE merchant_id = rec.merchant_id
                RETURNING wallets.merchant_id, rec.total_to_clear INTO merchant_id, amount_cleared;
                
                RAISE NOTICE '[Wallet] Cleared % from pending to available for merchant %', 
                    rec.total_to_clear, rec.merchant_id;
            END LOOP;
            
            RETURN;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    console.log('   Running SQL to create function...');
    // Note: Need service role to run raw SQL
    // For now just show the SQL
    console.log('   Copy and run this in Supabase SQL Editor:');
    console.log(sql);
}

async function simpleClearPending() {
    console.log('\n   Using simple clearing logic...');

    // Get all wallets with pending balance
    const { data: walletsWithPending } = await supabase
        .from('wallets')
        .select('merchant_id, pending_balance')
        .gt('pending_balance', 0);

    if (!walletsWithPending || walletsWithPending.length === 0) {
        console.log('   No wallets with pending balance found');
        return;
    }

    console.log(`   Found ${walletsWithPending.length} wallets with pending balance`);

    // Update each wallet
    for (const wallet of walletsWithPending) {
        const { error } = await supabase
            .from('wallets')
            .update({
                available_balance: wallet.pending_balance,
                pending_balance: 0,
                updated_at: new Date().toISOString()
            })
            .eq('merchant_id', wallet.merchant_id);

        if (error) {
            console.error(`   Error updating wallet ${wallet.merchant_id.substring(0, 8)}...:`, error.message);
        } else {
            console.log(`   ✅ Cleared Rp ${wallet.pending_balance?.toLocaleString('id-ID')} for merchant ${wallet.merchant_id.substring(0, 8)}...`);
        }
    }
}

// Execute
checkAndClearPending().catch(console.error);