import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

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
        const { data: funcExists, error: funcError } = await supabase.rpc('clear_pending_balances', {
            p_days_threshold: 0
        }).select('*').limit(1);

        if (funcError && funcError.code === '42883') {
            console.log('   ❌ Function does not exist yet');
            console.log('   Need to create the function first');
            return;
        }

        // 4. Try to clear pending balances (with 0 days threshold for testing)
        console.log('\n4. Attempting to clear pending balances (0 days threshold)...');
        const { data: cleared, error: clearError } = await supabase.rpc('clear_pending_balances', {
            p_days_threshold: 0
        });

        if (clearError) {
            console.error('   ❌ Error clearing pending:', clearError.message);
            console.log('   Trying alternative approach...');

            // Try direct SQL approach
            await directClearPending();
        } else {
            console.log('   ✅ Clear function executed');
            if (cleared && cleared.length > 0) {
                console.log(`   Cleared ${cleared.length} merchants`);
                cleared.forEach(c => {
                    console.log(`     Merchant ${c.merchant_id.substring(0, 8)}...: Rp ${c.amount_cleared?.toLocaleString('id-ID')}`);
                });
            } else {
                console.log('   No balances cleared (maybe already cleared or threshold too high)');
            }
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

async function directClearPending() {
    console.log('\n   Using direct SQL approach...');

    // Direct SQL to move all pending to available (for testing)
    // WARNING: This bypasses the clearing period logic
    const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
            UPDATE public.wallets
            SET 
                available_balance = available_balance + pending_balance,
                pending_balance = 0,
                updated_at = NOW()
            WHERE pending_balance > 0
            RETURNING merchant_id, pending_balance as amount_cleared;
        `
    });

    if (error) {
        console.error('   Direct SQL error:', error.message);
        console.log('\n   Alternative: Manual SQL to run in Supabase:');
        console.log(`
            UPDATE public.wallets
            SET 
                available_balance = available_balance + pending_balance,
                pending_balance = 0,
                updated_at = NOW()
            WHERE pending_balance > 0;
            
            SELECT merchant_id, pending_balance as old_pending 
            FROM public.wallets 
            WHERE pending_balance > 0;
        `);
    } else {
        console.log('   ✅ Direct SQL executed');
        if (data && data.length > 0) {
            console.log(`   Cleared ${data.length} wallets`);
        }
    }
}

// Execute
checkAndClearPending().catch(console.error);