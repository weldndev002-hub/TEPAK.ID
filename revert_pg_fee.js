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
    console.log('Mengembalikan pg_fee ke 2000...');

    const { error } = await supabase
        .from('platform_configs')
        .update({ pg_fee: 2000, updated_at: new Date().toISOString() })
        .eq('id', 1);

    if (error) {
        console.error('Error updating platform_configs:', error);
        return;
    }

    console.log('✅ platform_configs pg_fee dikembalikan ke 2000.');
}

main().catch(console.error);