import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFix() {
    console.log('🚀 Applying Immediate Balance Fix...');

    try {
        const sqlPath = join(__dirname, 'fix_immediate_balance_final.sql');
        const sqlContent = readFileSync(sqlPath, 'utf8');

        // Split by semicolon but be careful with functions (plpgsql uses semicolons)
        // Since I have a small number of blocks, I'll split by custom markers or just run as one block if RPC allows
        
        // Let's try running the whole thing via a helper if available, or split by major blocks
        const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

        if (error) {
            console.error('❌ RPC Error:', error);
            console.log('Trying fallback: splitting statements...');
            
            // Simple split for migration
            const statements = sqlContent.split('-- ').filter(s => s.trim().length > 0);
            for (const s of statements) {
                const { error: e } = await supabase.rpc('exec_sql', { sql: s });
                if (e) console.warn('⚠️ Statement warning:', e.message);
            }
        } else {
            console.log('✅ Fix applied successfully!');
        }

    } catch (err) {
        console.error('❌ Failed to apply fix:', err.message);
    }
}

runFix();
