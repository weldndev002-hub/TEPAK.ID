import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Missing Supabase environment variables');
    console.error('Please ensure PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Starting wallet synchronization fix migration...\n');

    try {
        // Read the SQL migration file
        const sqlPath = join(__dirname, 'wallet_payout_fix.sql');
        const sqlContent = readFileSync(sqlPath, 'utf8');

        console.log('📄 Migration script loaded');
        console.log('Script size:', sqlContent.length, 'characters');
        console.log('First 200 chars:', sqlContent.substring(0, 200) + '...\n');

        // Split SQL into individual statements (simple split on semicolon)
        // Note: This is a simplified approach. For production, use a proper SQL parser
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Found ${statements.length} SQL statements to execute\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i] + ';'; // Add back semicolon
            const statementPreview = statement.substring(0, 100).replace(/\n/g, ' ');

            console.log(`[${i + 1}/${statements.length}] Executing: ${statementPreview}...`);

            try {
                const { error } = await supabase.rpc('exec_sql', { sql: statement });

                if (error) {
                    // Fallback: Try direct SQL execution via REST API (if RPC not available)
                    console.log(`   ⚠️  RPC failed, trying alternative approach...`);

                    // For triggers and functions, we need to handle differently
                    // Let's try a simpler approach: execute via psql if available
                    console.log(`   ℹ️  Manual execution may be required for complex statements`);
                    console.log(`   Error: ${error.message}`);

                    errorCount++;
                } else {
                    console.log(`   ✅ Success`);
                    successCount++;
                }
            } catch (err) {
                console.log(`   ❌ Error: ${err.message}`);
                errorCount++;
            }

            // Small delay to avoid rate limiting
            if (i < statements.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`   ✅ Successfully executed: ${successCount} statements`);
        console.log(`   ❌ Failed: ${errorCount} statements`);
        console.log(`   📝 Total: ${statements.length} statements`);

        if (errorCount > 0) {
            console.log(`\n⚠️  Some statements failed. The migration may need to be run manually in Supabase SQL Editor.`);
        } else {
            console.log(`\n🎉 Migration completed successfully!`);
        }

        // Verify the fix
        console.log(`\n🔍 Verifying the fix...`);
        await verifyFix();

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

async function verifyFix() {
    try {
        console.log('1. Checking if handle_order_status_change function exists...');

        // Query pg_proc system table
        const { data: functions, error } = await supabase
            .from('pg_proc')
            .select('proname')
            .ilike('proname', 'handle_order_status_change');

        if (error) {
            console.log(`   ⚠️  Cannot query pg_proc: ${error.message}`);
        } else if (functions && functions.length > 0) {
            console.log(`   ✅ Function exists in database`);
        } else {
            console.log(`   ❌ Function not found - migration may have failed`);
        }

        console.log('\n2. Checking wallet balances for existing successful orders...');

        const { data: orders } = await supabase
            .from('orders')
            .select('merchant_id, net_amount')
            .in('status', ['success', 'paid'])
            .limit(5);

        if (orders && orders.length > 0) {
            const merchantId = orders[0].merchant_id;
            const expectedTotal = orders.reduce((sum, order) => sum + (order.net_amount || 0), 0);

            const { data: wallet } = await supabase
                .from('wallets')
                .select('pending_balance, available_balance')
                .eq('merchant_id', merchantId)
                .single();

            if (wallet) {
                console.log(`   Merchant ${merchantId?.slice(0, 8)}...:`);
                console.log(`     Expected from orders: Rp ${expectedTotal.toLocaleString('id-ID')}`);
                console.log(`     Current pending: Rp ${wallet.pending_balance.toLocaleString('id-ID')}`);
                console.log(`     Current available: Rp ${wallet.available_balance.toLocaleString('id-ID')}`);

                if (wallet.pending_balance > 0) {
                    console.log(`   ✅ Wallet now has pending balance!`);
                } else {
                    console.log(`   ⚠️  Wallet still shows 0 pending balance`);
                    console.log(`   Note: Trigger will only affect NEW status changes, not existing orders`);
                }
            }
        }

        console.log('\n3. Testing platform_configs...');

        const { data: config } = await supabase
            .from('platform_configs')
            .select('payout_fee, min_withdrawal, pg_fee')
            .limit(1)
            .single();

        if (config) {
            console.log(`   ✅ Platform config found:`);
            console.log(`     Payout fee: ${config.payout_fee || 'Not set'}`);
            console.log(`     Min withdrawal: ${config.min_withdrawal || 'Not set'}`);
            console.log(`     PG fee: ${config.pg_fee || 'Not set'}`);
        } else {
            console.log(`   ⚠️  No platform config found`);
        }

    } catch (error) {
        console.error('Verification error:', error);
    }
}

// Run the migration
runMigration();