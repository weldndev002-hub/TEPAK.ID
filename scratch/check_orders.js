import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: cols, error: err2 } = await supabase.from('orders').select('*').limit(1);
    if (err2) {
        console.log('ERROR:', err2.message);
    } else {
        console.log('COLUMNS:', Object.keys(cols[0] || {}));
    }
}
run();
