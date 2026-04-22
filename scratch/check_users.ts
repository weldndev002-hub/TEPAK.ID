import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
    console.log('Checking profiles table...');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('count', { count: 'exact' });
    if (pError) {
        console.error('Error fetching profiles:', pError);
    } else {
        console.log('Total profiles:', profiles[0]?.count);
    }

    console.log('Checking auth users...');
    const { data: { users }, error: aError } = await supabase.auth.admin.listUsers();
    if (aError) {
        console.error('Error fetching auth users:', aError);
    } else {
        console.log('Total auth users:', users.length);
    }
}

check();
