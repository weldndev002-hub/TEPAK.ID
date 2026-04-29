
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

        // Add columns if not exist
        const sql = `
            DO $$ 
            BEGIN 
                -- is_public
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_public') THEN
                    ALTER TABLE products ADD COLUMN is_public BOOLEAN DEFAULT true;
                    RAISE NOTICE 'Column is_public added.';
                END IF;

                -- download_limit
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='download_limit') THEN
                    ALTER TABLE products ADD COLUMN download_limit INTEGER;
                    RAISE NOTICE 'Column download_limit added.';
                END IF;

                -- link_expiry
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='link_expiry') THEN
                    ALTER TABLE products ADD COLUMN link_expiry TEXT DEFAULT 'forever';
                    RAISE NOTICE 'Column link_expiry added.';
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
