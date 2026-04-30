import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ ERROR: Missing DATABASE_URL or DIRECT_URL in .env');
    process.exit(1);
}

const sqlFile = process.argv[2];
if (!sqlFile) {
    console.error('❌ ERROR: Specify SQL file name as argument');
    process.exit(1);
}

const { Client } = pg;
const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();
        const sqlPath = join(__dirname, sqlFile);
        const sqlContent = readFileSync(sqlPath, 'utf8');
        console.log(`🚀 Running migration: ${sqlFile}...`);
        await client.query(sqlContent);
        console.log('✅ Migration successful!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

run();
