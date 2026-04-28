const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function applySchema() {
    console.log('Applying withdrawal schema update...');
    const sql = fs.readFileSync(path.join(process.cwd(), 'withdrawal_schema_update.sql'), 'utf8');
    
    // Split SQL by common separators if needed, but since we're using Service Role, 
    // we might need to use a proxy or just try running it.
    // Supabase doesn't have a direct 'sql' RPC by default unless we created one.
    // Let's check if there's a 'exec_sql' or similar.
    
    console.log('Attempting to run SQL via RPC...');
    // If no RPC exists, we might need to tell the user to run it manually or try a workaround.
    // However, many of these projects have an 'exec_sql' function for migrations.
    
    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
            if (error.message.includes('function "exec_sql" does not exist')) {
                console.log('RPC "exec_sql" not found. Please run withdrawal_schema_update.sql manually in Supabase SQL Editor.');
                process.exit(1);
            }
            throw error;
        }
        console.log('Schema updated successfully via RPC!');
    } catch (err) {
        console.error('Error applying schema:', err.message);
        console.log('\n--- SQL CONTENT START ---');
        console.log(sql);
        console.log('--- SQL CONTENT END ---\n');
        console.log('Please copy the SQL above and run it in your Supabase SQL Editor.');
        process.exit(1);
    }
}

applySchema();
