import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deploy() {
    console.log('🔧 Deploying updated withdrawal function with row locking...\n');

    try {
        // Read the SQL file
        const sqlPath = path.resolve('payout_wallet_functions.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 SQL content length:', sql.length, 'chars');
        console.log('Executing SQL...');

        // Use exec_sql RPC if available
        try {
            const { error } = await supabase.rpc('exec_sql', { sql });
            if (error) {
                console.error('❌ Failed to execute SQL via RPC:', error.message);
                console.log('Trying alternative method...');
                // Fallback: maybe we can split statements and run via query? Not possible.
                process.exit(1);
            }
        } catch (rpcError) {
            console.error('RPC exec_sql failed:', rpcError.message);
            console.log('Attempting to run SQL via Supabase SQL editor?');
            process.exit(1);
        }

        console.log('✅ Function updated successfully.');

        // Verify the function exists
        try {
            const { data, error: verifyError } = await supabase.rpc('initiate_withdrawal', {
                p_merchant_id: '00000000-0000-0000-0000-000000000000',
                p_amount: 0,
                p_bank_account_id: '00000000-0000-0000-0000-000000000000'
            });
            if (verifyError) {
                if (verifyError.message.includes('Insufficient balance')) {
                    console.log('✅ Function exists and responds with expected error.');
                } else {
                    console.log('⚠️  Verification RPC returned unexpected error:', verifyError.message);
                }
            } else {
                console.log('✅ Function exists and returned data:', data);
            }
        } catch (verifyErr) {
            console.log('⚠️  Verification RPC threw exception:', verifyErr.message);
        }

    } catch (err) {
        console.error('❌ Deployment error:', err);
        process.exit(1);
    }
}

deploy();