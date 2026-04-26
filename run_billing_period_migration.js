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
    console.log('🔧 Running billing_period migration...\n');

    try {
        // Try using RPC exec_sql if available
        const { error: rpcError } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE public.subscription_history
        ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly';
      `
        });

        if (rpcError) {
            console.log('⚠️  RPC exec_sql not available. Trying direct SQL via REST API...');

            // Fallback: Try to check if the column already exists by querying
            const { data: testData, error: testError } = await supabase
                .from('subscription_history')
                .select('billing_period')
                .limit(1);

            if (testError && testError.message.includes('column') && testError.message.includes('does not exist')) {
                console.log('❌ Column billing_period does not exist yet.');
                console.log('📋 Please run this SQL manually in the Supabase Dashboard SQL Editor:');
                console.log('');
                console.log('  ALTER TABLE public.subscription_history');
                console.log("  ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly';");
                console.log('');
                console.log('🌐 Dashboard: https://supabase.com/dashboard → SQL Editor');
            } else if (testError) {
                console.log('❌ Error checking column:', testError.message);
            } else {
                console.log('✅ Column billing_period already exists!');
            }
        } else {
            console.log('✅ Migration applied successfully via RPC!');
        }

        // Verify
        const { data: verifyData, error: verifyError } = await supabase
            .from('subscription_history')
            .select('billing_period')
            .limit(1);

        if (!verifyError) {
            console.log('✅ Verified: billing_period column exists in subscription_history');
        }

    } catch (err) {
        console.error('❌ Migration error:', err.message);
        console.log('');
        console.log('📋 Please run this SQL manually in the Supabase Dashboard SQL Editor:');
        console.log('');
        console.log('  ALTER TABLE public.subscription_history');
        console.log("  ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly';");
    }
}

runMigration();
