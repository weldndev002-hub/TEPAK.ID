import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findToken() {
    const { data, error } = await supabase
        .from('digital_deliveries')
        .select('token, accessed_email')
        .eq('accessed_email', 'acepali2253@gmail.com')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('\n--- TOKEN FOUND ---');
        console.log('Email:', data[0].accessed_email);
        console.log('Token:', data[0].token);
        console.log('Download URL (Local): http://localhost:4321/digital-delivery/' + data[0].token + '?email=' + data[0].accessed_email);
        console.log('-------------------\n');
    } else {
        console.log('No digital delivery found for acepali2253@gmail.com');
    }
}

findToken();
