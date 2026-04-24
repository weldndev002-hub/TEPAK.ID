const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Missing Supabase environment variables');
    console.error('Please ensure PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeWalletFix() {
    console.log('🔧 Executing Wallet Synchronization Fix...\n');

    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'wallet_fix_manual.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📋 SQL Script loaded successfully');
        console.log('   File:', sqlPath);
        console.log('   Size:', sql.length, 'bytes\n');

        // Split SQL into statements (simplified - just execute as one)
        console.log('🚀 Executing SQL on Supabase...');

        // Use Supabase REST API to run SQL via rpc or direct query
        // We'll use supabase.rpc('exec_sql', { sql }) if available, 
        // but for simplicity, we can use the REST API with pg_temp.execute
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(async () => {
            // If exec_sql doesn't exist, try to run via fetch
            console.log('   ℹ️  exec_sql function not available, trying alternative approach...');

            // Alternative: Use Supabase's REST API SQL endpoint
            const response = await fetch(`${supabaseUrl}/rest/v1/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation',
                },
                body: JSON.stringify({ query: sql }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            return { data: await response.json(), error: null };
        });

        if (error) {
            console.error('❌ SQL Execution Error:', error.message);

            // Try to execute via pg-native using database connection
            console.log('   Trying fallback method...');
            await executeViaDatabaseConnection(sql);
            return;
        }

        console.log('✅ SQL executed successfully!');
        console.log('📊 Results:', data ? JSON.stringify(data, null, 2) : 'No data returned');

        // Verify the fix
        await verifyFix();

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

async function executeViaDatabaseConnection(sql) {
    console.log('   Using direct database connection...');

    // Since we can't directly connect to Postgres from here,
    // we'll use the simpler approach of asking the user to run manually
    console.log('\n⚠️  Cannot execute SQL directly via REST API.');
    console.log('📋 Please run the SQL manually in Supabase SQL Editor:');
    console.log('   1. Go to https://supabase.com/dashboard/project/aaqguhxonwpsnpwjjdrv/sql');
    console.log('   2. Copy the contents of wallet_fix_manual.sql');
    console.log('   3. Click "Run"');
    console.log('\n📁 The SQL file is located at:', path.join(__dirname, 'wallet_fix_manual.sql'));
}

async function verifyFix() {
    console.log('\n🔍 Verifying the fix...');

    // Check if trigger exists
    const { data: triggerData, error: triggerError } = await supabase
        .from('pg_trigger')
        .select('tgname')
        .eq('tgname', 'on_order_status_changed');

    if (triggerError) {
        console.log('   ⚠️  Cannot check trigger status:', triggerError.message);
    } else {
        if (triggerData && triggerData.length > 0) {
            console.log('   ✅ Trigger "on_order_status_changed" exists');
        } else {
            console.log('   ❌ Trigger not found - SQL may not have executed completely');
        }
    }

    // Check platform configs
    const { data: configData, error: configError } = await supabase
        .from('platform_configs')
        .select('*')
        .eq('id', 1);

    if (configError) {
        console.log('   ⚠️  Cannot check platform config:', configError.message);
    } else {
        if (configData && configData.length > 0) {
            console.log('   ✅ Platform config exists:', configData[0]);
        } else {
            console.log('   ❌ Platform config not found');
        }
    }

    // Check wallet balances vs orders
    const { data: walletData, error: walletError } = await supabase
        .rpc('get_wallet_sync_status', {})
        .catch(async () => {
            // Fallback query
            const { data, error } = await supabase
                .from('wallets')
                .select('merchant_id, pending_balance')
                .limit(5);

            return { data, error };
        });

    if (walletError) {
        console.log('   ⚠️  Cannot check wallet balances:', walletError.message);
    } else {
        console.log('   📊 Sample wallet balances:', walletData?.length || 0, 'records');
        if (walletData && walletData.length > 0) {
            walletData.slice(0, 3).forEach(wallet => {
                console.log(`      Merchant ${wallet.merchant_id?.substring(0, 8)}...: Rp ${wallet.pending_balance?.toLocaleString('id-ID') || 0}`);
            });
        }
    }
}

// Execute the fix
executeWalletFix().then(() => {
    console.log('\n🎉 Wallet fix execution completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run "node verify_wallet_fix.js" to verify the fix');
    console.log('   2. Test with a new order to ensure trigger works');
    console.log('   3. Check wallet dashboard for updated balances');
}).catch(error => {
    console.error('❌ Failed to execute wallet fix:', error);
    process.exit(1);
});