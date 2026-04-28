const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('withdrawals').select('*').limit(1);
    if (error) {
        console.error(error);
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        // Table might be empty, try to get column names from information_schema
        const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name_input: 'withdrawals' }).catch(() => ({data: null}));
        if (cols) {
            console.log('Columns (via RPC):', cols);
        } else {
            console.log('Table exists but is empty and no RPC available.');
        }
    }
}

check();
