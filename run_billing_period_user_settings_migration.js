import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials. Check .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🔧 Running billing_period column migration on user_settings...\n');

    try {
        // Try using RPC exec_sql if available
        const { error: rpcError } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE public.user_settings
        ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly';
      `
        });

        if (rpcError) {
            console.log('⚠️  RPC exec_sql not available. Trying direct check via REST API...');

            // Fallback: Try to check if the column already exists by querying
            const { data: testData, error: testError } = await supabase
                .from('user_settings')
                .select('billing_period')
                .limit(1);

            if (testError && testError.message.includes('column') && testError.message.includes('does not exist')) {
                console.log('❌ Column billing_period does not exist yet.');
                console.log('📋 Please run this SQL manually in the Supabase Dashboard SQL Editor:');
                console.log('');
                console.log('  ALTER TABLE public.user_settings');
                console.log("  ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly';");
                console.log('');
                process.exit(1);
            } else if (testError) {
                console.error('❌ Unexpected error:', testError.message);
                process.exit(1);
            } else {
                console.log('✅ Column billing_period already exists in user_settings!');
            }
        } else {
            console.log('✅ Migration executed successfully via RPC!');
        }

        // Verify the column exists
        const { data: verifyData, error: verifyError } = await supabase
            .from('user_settings')
            .select('billing_period')
            .limit(1);

        if (!verifyError) {
            console.log('✅ Verified: billing_period column exists in user_settings.');
            console.log('   Sample data:', verifyData);
        } else {
            console.error('❌ Verification failed:', verifyError.message);
        }

    } catch (err) {
        console.error('❌ Migration failed:', err);
        console.log('\n📋 Please run this SQL manually in the Supabase Dashboard SQL Editor:');
        console.log('');
        console.log('  ALTER TABLE public.user_settings');
        console.log("  ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly';");
        console.log('');
    }
}

runMigration();
