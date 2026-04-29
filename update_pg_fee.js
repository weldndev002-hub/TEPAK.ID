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
    console.log('Updating platform_configs pg_fee to 0...');

    const { error } = await supabase
        .from('platform_configs')
        .update({ pg_fee: 0, updated_at: new Date().toISOString() })
        .eq('id', 1);

    if (error) {
        console.error('Error updating platform_configs:', error);
        return;
    }

    console.log('✅ platform_configs updated successfully.');

    // Also update net_amount for orders where pg_fee = 0 or NULL (optional)
    console.log('Updating net_amount for orders where pg_fee is 0 or NULL...');
    const { error: updateOrdersError } = await supabase.rpc('exec_sql', {
        sql_query: `
            UPDATE public.orders
            SET
                pg_fee = 0,
                net_amount = FLOOR(amount * (1 - (COALESCE(platform_fee, 5) / 100))) - 0
            WHERE (pg_fee = 0 OR pg_fee IS NULL OR net_amount IS NULL);
        `
    }).catch(async (err) => {
        console.log('RPC exec_sql not available, using direct query...');
        // Alternative: run separate queries
        const { error: e1 } = await supabase
            .from('orders')
            .update({ pg_fee: 0 })
            .or('pg_fee.is.null,pg_fee.eq.0');
        if (e1) console.error('Error updating pg_fee:', e1);
        // net_amount update is more complex, we can skip for now
    });

    console.log('✅ Done.');
}

main().catch(console.error);