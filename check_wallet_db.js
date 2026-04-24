import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY
);

async function checkWalletSchema() {
    console.log('=== Wallet/Payout Schema Check ===\n');

    try {
        // 1. Check orders table for net_amount
        console.log('1. Checking orders table...');
        const { data: sampleOrder, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .limit(1)
            .single()
            .catch(() => ({ data: null, error: 'No orders or single() failed' }));

        if (orderError) {
            console.log(`   ⚠️  Could not fetch order sample: ${orderError.message || orderError}`);
            // Try without single()
            const { data: orders } = await supabase
                .from('orders')
                .select('*')
                .limit(1);

            if (orders && orders.length > 0) {
                const order = orders[0];
                const hasNetAmount = 'net_amount' in order;
                console.log(`   ${hasNetAmount ? '✅' : '❌'} net_amount column exists: ${hasNetAmount}`);
                console.log(`   Order status: ${order.status}, amount: ${order.amount}, net: ${order.net_amount || 'N/A'}`);
            } else {
                console.log('   No orders found in database');
            }
        } else if (sampleOrder) {
            const hasNetAmount = 'net_amount' in sampleOrder;
            console.log(`   ${hasNetAmount ? '✅' : '❌'} net_amount column exists: ${hasNetAmount}`);
            console.log(`   Order status: ${sampleOrder.status}, amount: ${sampleOrder.amount}, net: ${sampleOrder.net_amount || 'N/A'}`);
        }

        // 2. Check wallets table
        console.log('\n2. Checking wallets table...');
        const { data: wallets, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .limit(2);

        if (walletError) {
            console.log(`   ❌ Error accessing wallets: ${walletError.message}`);
        } else if (wallets && wallets.length > 0) {
            console.log(`   ✅ Wallets table exists with ${wallets.length} record(s)`);
            wallets.forEach((wallet, i) => {
                console.log(`   [${i + 1}] Merchant: ${wallet.merchant_id?.slice(0, 8)}..., Available: ${wallet.available_balance}, Pending: ${wallet.pending_balance}`);
            });
        } else {
            console.log('   ⚠️  Wallets table exists but is empty');
        }

        // 3. Check platform_configs
        console.log('\n3. Checking platform_configs table...');
        const { data: configs, error: configError } = await supabase
            .from('platform_configs')
            .select('*')
            .limit(1);

        if (configError) {
            console.log(`   ❌ platform_configs error: ${configError.message}`);
            console.log('   ⚠️  This table may not exist. API will use default values.');
        } else if (configs && configs.length > 0) {
            const config = configs[0];
            console.log(`   ✅ platform_configs exists with config ID: ${config.id}`);
            console.log(`     payout_fee: ${config.payout_fee || 'NOT SET'}`);
            console.log(`     min_withdrawal: ${config.min_withdrawal || 'NOT SET'}`);
        } else {
            console.log('   ⚠️  platform_configs table exists but is empty');
        }

        // 4. Check trigger by trying to find the function
        console.log('\n4. Checking for order status trigger...');
        // We'll check information_schema.triggers via a direct query
        // First check if we can query pg_catalog
        const { data: triggerCheck, error: triggerError } = await supabase.rpc('check_trigger_exists', {
            table_name: 'orders'
        }).catch(async () => {
            // Fallback: try to query information_schema via raw SQL if we have admin
            console.log('   ⚠️  RPC not available, trying alternative check...');
            return { data: null, error: 'RPC not configured' };
        });

        if (triggerError) {
            console.log('   ⚠️  Cannot check trigger directly. Need to run SQL manually:');
            console.log(`   SQL: SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'orders';`);
        }

        // 5. Test order-wallet relationship
        console.log('\n5. Testing order-wallet relationship...');
        // Get a merchant with both wallet and orders
        const { data: merchantWithOrders } = await supabase
            .from('orders')
            .select('merchant_id, status, amount, net_amount')
            .limit(5);

        if (merchantWithOrders && merchantWithOrders.length > 0) {
            const merchantIds = [...new Set(merchantWithOrders.map(o => o.merchant_id))];
            console.log(`   Found ${merchantWithOrders.length} orders from ${merchantIds.length} merchant(s)`);

            // Check wallet for first merchant
            const testMerchant = merchantIds[0];
            if (testMerchant) {
                const { data: merchantWallet } = await supabase
                    .from('wallets')
                    .select('*')
                    .eq('merchant_id', testMerchant)
                    .single()
                    .catch(() => ({ data: null }));

                if (merchantWallet) {
                    console.log(`   Merchant ${testMerchant.slice(0, 8)}... wallet:`);
                    console.log(`     Available: ${merchantWallet.available_balance}`);
                    console.log(`     Pending: ${merchantWallet.pending_balance}`);

                    // Get their orders
                    const { data: merchantOrders } = await supabase
                        .from('orders')
                        .select('id, status, amount, net_amount, created_at')
                        .eq('merchant_id', testMerchant)
                        .order('created_at', { ascending: false })
                        .limit(3);

                    if (merchantOrders && merchantOrders.length > 0) {
                        console.log(`   Recent orders:`);
                        merchantOrders.forEach((order, i) => {
                            console.log(`     [${i + 1}] ${order.id.slice(0, 8)}... - ${order.status} - Amount: ${order.amount}, Net: ${order.net_amount || 'N/A'}`);
                        });

                        // Calculate what pending balance should be based on successful orders
                        const successOrders = merchantOrders.filter(o => o.status === 'success' || o.status === 'paid');
                        const totalPending = successOrders.reduce((sum, o) => sum + (o.net_amount || Math.floor(o.amount * 0.95)), 0);
                        console.log(`   Expected pending (based on ${successOrders.length} success orders): ~${totalPending}`);
                    }
                }
            }
        }

        console.log('\n=== Summary ===');
        console.log('Based on this check, the main implementation is in place but may need:');
        console.log('1. net_amount column in orders table (for accurate fee calculations)');
        console.log('2. Trigger for automatic balance updates (handle_order_status_change)');
        console.log('3. platform_configs table with payout_fee and min_withdrawal values');
        console.log('\nRecommendation: Run the wallet_payout_fix.sql script to ensure all schema elements exist.');

    } catch (error) {
        console.error('Unexpected error during check:', error);
    }
}

checkWalletSchema().catch(console.error);