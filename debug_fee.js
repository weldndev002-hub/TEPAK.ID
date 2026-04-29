import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching platform_configs...');
    const { data: config, error } = await supabase
        .from('platform_configs')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.error('Error fetching config:', error);
    } else {
        console.log('Platform Config:', config);
        console.log(`Platform fee: ${config.platform_fee}%`);
        console.log(`PG fee: ${config.pg_fee}`);
        console.log(`Platform fee percent: ${config.platform_fee_percent}%`);
    }

    console.log('\n--- Sample orders (success) ---');
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('id, invoice_id, amount, platform_fee, pg_fee, net_amount, status')
        .eq('status', 'success')
        .limit(5);

    if (orderError) {
        console.error('Error fetching orders:', orderError);
    } else {
        orders.forEach(o => {
            console.log(`Order ${o.invoice_id}: amount=${o.amount}, platform_fee=${o.platform_fee}%, pg_fee=${o.pg_fee}, net_amount=${o.net_amount}`);
        });
    }

    console.log('\n--- Sample orders (pending) ---');
    const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('id, invoice_id, amount, platform_fee, pg_fee, net_amount, status')
        .eq('status', 'pending')
        .limit(5);

    if (pendingError) {
        console.error('Error fetching pending orders:', pendingError);
    } else {
        pendingOrders.forEach(o => {
            console.log(`Pending Order ${o.invoice_id}: amount=${o.amount}, platform_fee=${o.platform_fee}%, pg_fee=${o.pg_fee}, net_amount=${o.net_amount}`);
        });
    }

    console.log('\n--- Calculating expected net amount ---');
    if (orders && orders.length > 0) {
        const o = orders[0];
        const expected = o.amount - (o.amount * (o.platform_fee / 100)) - o.pg_fee;
        console.log(`Order ${o.invoice_id}: amount ${o.amount}, platform_fee ${o.platform_fee}%, pg_fee ${o.pg_fee}`);
        console.log(`Expected net = ${o.amount} - ${o.amount * (o.platform_fee / 100)} - ${o.pg_fee} = ${expected}`);
        console.log(`Actual net = ${o.net_amount}`);
        console.log(`Difference = ${o.net_amount - expected}`);
    }
}

main().catch(console.error);