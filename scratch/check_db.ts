
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCustomers() {
    console.log('Checking customers table...');
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching customers:', error);
        return;
    }

    console.log(`Found ${data.length} customers.`);
    console.log(JSON.stringify(data, null, 2));

    const { data: orders, error: oError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (oError) {
        console.error('Error fetching orders:', oError);
        return;
    }

    console.log(`Found ${orders.length} orders.`);
    console.log(JSON.stringify(orders, null, 2));
}

checkCustomers();
