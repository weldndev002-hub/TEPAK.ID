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
    console.log('=== Verifying PG Fee Fix ===');

    // 1. Check platform_configs
    const { data: config, error } = await supabase
        .from('platform_configs')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.error('Error fetching config:', error);
    } else {
        console.log('Platform Config:', config);
        console.log(`PG fee should be 0: ${config.pg_fee === 0 ? '✅' : '❌'} (${config.pg_fee})`);
        console.log(`Platform fee: ${config.platform_fee}%`);
    }

    // 2. Check latest order to see net_amount
    const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('id, invoice_id, amount, platform_fee, pg_fee, net_amount, status')
        .order('created_at', { ascending: false })
        .limit(3);

    if (orderError) {
        console.error('Error fetching orders:', orderError);
    } else {
        console.log('\nLatest orders:');
        orders.forEach(o => {
            console.log(`- ${o.invoice_id} (${o.status}): amount=${o.amount}, platform_fee=${o.platform_fee}%, pg_fee=${o.pg_fee}, net_amount=${o.net_amount}`);
        });
    }

    // 3. Create a test order (optional) - we can skip for now
    console.log('\n=== Fix verification complete ===');
}

main().catch(console.error);