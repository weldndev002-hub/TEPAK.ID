
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
    console.error('Missing DIRECT_URL in .env');
    process.exit(1);
}

const client = new Client({
    connectionString,
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Add is_public column if not exists
        const sql = `
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_public') THEN
                    ALTER TABLE products ADD COLUMN is_public BOOLEAN DEFAULT true;
                    RAISE NOTICE 'Column is_public added to products table.';
                ELSE
                    RAISE NOTICE 'Column is_public already exists.';
                END IF;
            END $$;
        `;

        await client.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
