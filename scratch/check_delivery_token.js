// Run with: npx tsx scratch/check_delivery_token.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const token = 'dd_1777277197254_9i4usainxsv4ghf1n8o6';
    console.log(`--- CHECKING DELIVERY TOKEN: ${token} ---`);
    
    const { data, error } = await supabase
        .from('digital_deliveries')
        .select('*, orders(id, customer_id, customers(email))')
        .eq('token', token)
        .single();

    if (error) {
        console.error('Error fetching token:', error);
        return;
    }

    console.log('Token Data:', JSON.stringify(data, null, 2));
    
    const buyerEmail = data.orders?.customers?.email || data.accessed_email || "";
    console.log(`Buyer Email for Verification: "${buyerEmail}"`);
}

check();
