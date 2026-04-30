import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Use DIRECT_URL or DATABASE_URL
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ ERROR: Missing DATABASE_URL or DIRECT_URL in .env');
    process.exit(1);
}

const { Client } = pg;
const client = new Client({
    connectionString: connectionString,
});

async function runFix() {
    console.log('🚀 Applying Immediate Balance Fix via PostgreSQL Direct Connection...');

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const sqlPath = join(__dirname, 'fix_immediate_balance_final.sql');
        const sqlContent = readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL migration...');
        await client.query(sqlContent);
        
        console.log('✅ Fix applied successfully!');
        
        // Let's check a sample wallet to confirm
        const res = await client.query('SELECT merchant_id, available_balance, pending_balance FROM public.wallets LIMIT 1');
        if (res.rows.length > 0) {
            console.log('Sample Wallet State:', res.rows[0]);
        }

    } catch (err) {
        console.error('❌ Failed to apply fix:', err.message);
    } finally {
        await client.end();
    }
}

runFix();
