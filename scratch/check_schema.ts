
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log('Profiles columns:', Object.keys(data[0]));
    } else {
        console.log('No profiles found to check columns.');
    }
}

checkSchema();
