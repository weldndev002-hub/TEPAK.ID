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

async function diagnoseWalletIssue() {
    console.log('=== WALLET SYNCHRONIZATION DIAGNOSIS ===\n');

    try {
        // 1. Check if trigger exists
        console.log('1. Checking for handle_order_status_change trigger...');
        const { data: triggerCheck, error: triggerError } = await supabase.rpc(
            'pg_get_functiondef',
            { oid: 'public.handle_order_status_change' }
        ).single();

        if (triggerError) {
            console.log(`   ⚠️  Cannot check trigger directly (RPC may not exist)`);
            console.log(`   Error: ${triggerError.message}`);

            // Alternative: Check if function exists via query
            const { data: funcCheck } = await supabase
                .from('pg_proc')
                .select('proname')
                .eq('proname', 'handle_order_status_change')
                .limit(1);

            console.log(`   ${funcCheck?.length ? '✅' : '❌'} Function exists in pg_proc: ${funcCheck?.length || 0}`);
        } else {
            console.log(`   ✅ Trigger function exists`);
        }

        // 2. Check order statuses and net_amount calculations
        console.log('\n2. Analyzing orders and wallet mismatches...');

        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, invoice_id, merchant_id, status, amount, net_amount, created_at')
            .in('status', ['success', 'paid'])
            .order('created_at', { ascending: false })
            .limit(20);

        if (ordersError) {
            console.log(`   ❌ Error fetching orders: ${ordersError.message}`);
            return;
        }

        console.log(`   Found ${orders.length} successful/paid orders`);

        // Group by merchant
        const merchantOrders = {};
        for (const order of orders) {
            if (!merchantOrders[order.merchant_id]) {
                merchantOrders[order.merchant_id] = [];
            }
            merchantOrders[order.merchant_id].push(order);
        }

        // 3. Check each merchant's wallet balance
        console.log('\n3. Comparing expected vs actual wallet balances...');

        for (const [merchantId, merchantOrdersList] of Object.entries(merchantOrders)) {
            const expectedPending = merchantOrdersList.reduce((sum, order) => sum + (order.net_amount || 0), 0);

            const { data: wallet, error: walletError } = await supabase
                .from('wallets')
                .select('available_balance, pending_balance')
                .eq('merchant_id', merchantId)
                .single();

            if (walletError) {
                console.log(`   ❌ Error fetching wallet for merchant ${merchantId.slice(0, 8)}...: ${walletError.message}`);
                continue;
            }

            const discrepancy = expectedPending - wallet.pending_balance;

            console.log(`   Merchant ${merchantId.slice(0, 8)}...:`);
            console.log(`     Orders: ${merchantOrdersList.length} successful`);
            console.log(`     Expected pending: Rp ${expectedPending.toLocaleString('id-ID')}`);
            console.log(`     Actual pending: Rp ${wallet.pending_balance.toLocaleString('id-ID')}`);
            console.log(`     Discrepancy: Rp ${discrepancy.toLocaleString('id-ID')} (${discrepancy > 0 ? 'UNDER' : 'OVER'}-credited)`);

            if (Math.abs(discrepancy) > 100) {
                console.log(`     ⚠️  SIGNIFICANT DISCREPANCY DETECTED!`);

                // Check if orders have proper status transitions
                console.log(`     Checking order status history...`);
                for (const order of merchantOrdersList.slice(0, 3)) {
                    console.log(`       Order ${order.invoice_id}: status=${order.status}, amount=${order.amount}, net=${order.net_amount}`);
                }
            }
            console.log();
        }

        // 4. Test trigger manually with a sample update
        console.log('\n4. Testing trigger functionality...');

        // Find an order that's still pending
        const { data: pendingOrder } = await supabase
            .from('orders')
            .select('id, invoice_id, merchant_id, status, net_amount')
            .eq('status', 'pending')
            .limit(1)
            .single();

        if (pendingOrder) {
            console.log(`   Found pending order ${pendingOrder.invoice_id}`);
            console.log(`   Current status: ${pendingOrder.status}`);
            console.log(`   Net amount: ${pendingOrder.net_amount}`);
            console.log(`   Merchant: ${pendingOrder.merchant_id?.slice(0, 8)}...`);

            // Check current wallet balance before test
            const { data: beforeWallet } = await supabase
                .from('wallets')
                .select('pending_balance')
                .eq('merchant_id', pendingOrder.merchant_id)
                .single();

            console.log(`   Before - Pending balance: ${beforeWallet?.pending_balance || 0}`);

            // Note: We won't actually update for safety, just show what would happen
            console.log(`   [TEST] If we update order status to 'success':`);
            console.log(`     Expected pending balance increase: +${pendingOrder.net_amount}`);
            console.log(`     New pending balance: ${(beforeWallet?.pending_balance || 0) + (pendingOrder.net_amount || 0)}`);
        } else {
            console.log(`   No pending orders found for testing`);
        }

        // 5. Check platform_configs for proper fees
        console.log('\n5. Checking platform configuration...');

        const { data: config } = await supabase
            .from('platform_configs')
            .select('payout_fee, min_withdrawal, pg_fee, platform_fee_percent')
            .limit(1)
            .single();

        if (config) {
            console.log(`   ✅ Platform config found:`);
            console.log(`     Payout fee: ${config.payout_fee || 'NOT SET (default: 5000)'}`);
            console.log(`     Min withdrawal: ${config.min_withdrawal || 'NOT SET (default: 50000)'}`);
            console.log(`     PG fee: ${config.pg_fee || 'NOT SET (default: 2000)'}`);
            console.log(`     Platform fee %: ${config.platform_fee_percent || 'NOT SET (default: 5)'}`);
        } else {
            console.log(`   ⚠️  No platform config found, using defaults`);
        }

    } catch (error) {
        console.error('Diagnosis failed:', error);
    }
}

diagnoseWalletIssue();