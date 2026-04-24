const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWalletSchema() {
    console.log('=== Checking Wallet/Payout Schema ===\n');

    try {
        // 1. Check if orders table has net_amount column
        console.log('1. Checking orders table columns...');
        const { data: orderCols, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .limit(1);

        if (orderError) {
            console.log('   ❌ Error accessing orders table:', orderError.message);
        } else if (orderCols && orderCols.length > 0) {
            const sampleOrder = orderCols[0];
            const hasNetAmount = 'net_amount' in sampleOrder;
            console.log(`   ${hasNetAmount ? '✅' : '❌'} net_amount column exists: ${hasNetAmount}`);
            if (!hasNetAmount) {
                console.log('   Available columns:', Object.keys(sampleOrder).join(', '));
            }
        }

        // 2. Check if trigger exists
        console.log('\n2. Checking for order status change trigger...');
        // We'll check by looking for the function in pg_proc
        const { data: funcData, error: funcError } = await supabase.rpc('get_function_info', {
            func_name: 'handle_order_status_change'
        }).catch(() => ({ data: null, error: true }));

        if (funcError) {
            // Try a different approach - check if we can call the function
            console.log('   ⚠️  Cannot check function via RPC, trying direct query...');
        }

        // 3. Check platform_configs table
        console.log('\n3. Checking platform_configs table...');
        const { data: configData, error: configError } = await supabase
            .from('platform_configs')
            .select('*')
            .limit(1);

        if (configError) {
            console.log(`   ❌ platform_configs table error: ${configError.message}`);
        } else if (configData && configData.length > 0) {
            console.log(`   ✅ platform_configs table exists with ${configData.length} row(s)`);
            const config = configData[0];
            console.log(`     - payout_fee: ${config.payout_fee || 'NOT SET'}`);
            console.log(`     - min_withdrawal: ${config.min_withdrawal || 'NOT SET'}`);
        } else {
            console.log('   ⚠️  platform_configs table exists but is empty');
        }

        // 4. Check wallets table structure
        console.log('\n4. Checking wallets table...');
        const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('*')
            .limit(1);

        if (walletError) {
            console.log(`   ❌ wallets table error: ${walletError.message}`);
        } else if (walletData && walletData.length > 0) {
            const wallet = walletData[0];
            console.log(`   ✅ wallets table exists with sample data`);
            console.log(`     - merchant_id: ${wallet.merchant_id}`);
            console.log(`     - available_balance: ${wallet.available_balance}`);
            console.log(`     - pending_balance: ${wallet.pending_balance}`);
        } else {
            console.log('   ⚠️  wallets table exists but is empty');
        }

        // 5. Check if test order flow works
        console.log('\n5. Testing order status impact on wallet...');
        // Find a user with a wallet
        const { data: testWallet } = await supabase
            .from('wallets')
            .select('merchant_id, available_balance, pending_balance')
            .limit(1)
            .single()
            .catch(() => ({ data: null }));

        if (testWallet) {
            console.log(`   Found test wallet for merchant: ${testWallet.merchant_id}`);
            console.log(`   Available: ${testWallet.available_balance}, Pending: ${testWallet.pending_balance}`);

            // Check if this merchant has any orders
            const { data: merchantOrders } = await supabase
                .from('orders')
                .select('id, status, net_amount, amount')
                .eq('merchant_id', testWallet.merchant_id)
                .limit(3);

            if (merchantOrders && merchantOrders.length > 0) {
                console.log(`   Found ${merchantOrders.length} order(s) for this merchant`);
                merchantOrders.forEach((order, i) => {
                    console.log(`     Order ${i + 1}: ${order.id.slice(0, 8)}... - Status: ${order.status}, Amount: ${order.amount}, Net: ${order.net_amount || 'N/A'}`);
                });
            } else {
                console.log('   No orders found for this merchant');
            }
        } else {
            console.log('   No wallets found to test');
        }

    } catch (error) {
        console.error('Unexpected error:', error.message);
    }
}

// Check if we have credentials
if (!supabaseUrl.includes('your-project') && !supabaseKey.includes('your-service')) {
    checkWalletSchema();
} else {
    console.log('❌ Missing Supabase credentials. Please set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    console.log('To check manually, run these SQL queries:');
    console.log(`
  1. Check net_amount column:
     SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'orders' AND column_name = 'net_amount';
     
  2. Check trigger:
     SELECT trigger_name FROM information_schema.triggers 
     WHERE event_object_table = 'orders';
     
  3. Check platform_configs:
     SELECT * FROM platform_configs LIMIT 1;
     
  4. Check wallets:
     SELECT * FROM wallets LIMIT 1;
  `);
}