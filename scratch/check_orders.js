// Run with: npx tsx scratch/check_orders.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- CHECKING ORDERS IN DATABASE ---');
    
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching orders:', error);
        return;
    }

    console.log(`Found ${orders.length} recent orders.`);
    orders.forEach(o => {
        console.log(`ID: ${o.id} | Status: ${o.status} | Merchant: ${o.merchant_id} | Amount: ${o.amount} | Date: ${o.created_at}`);
    });
}

check();
