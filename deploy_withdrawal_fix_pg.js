import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!databaseUrl) {
    console.error('❌ DATABASE_URL or DIRECT_URL not found in environment');
    process.exit(1);
}

async function deploy() {
    console.log('🔧 Deploying updated withdrawal function with row locking...\n');
    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Read the SQL file
        const sqlPath = path.resolve('payout_wallet_functions.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Executing SQL...');
        await client.query(sql);

        console.log('✅ Function updated successfully.');

        // Verify the function exists by calling it with dummy parameters (should raise insufficient balance)
        try {
            await client.query(`
        SELECT public.initiate_withdrawal(
          '00000000-0000-0000-0000-000000000000'::uuid,
          0::numeric,
          '00000000-0000-0000-0000-000000000000'::uuid
        );
      `);
            console.log('⚠️  Function executed without error (unexpected)');
        } catch (err) {
            if (err.message.includes('Insufficient balance')) {
                console.log('✅ Function exists and raises expected error.');
            } else {
                console.log('⚠️  Function verification error:', err.message);
            }
        }

        await client.end();
        console.log('🎉 Deployment completed.');
    } catch (err) {
        console.error('❌ Deployment error:', err);
        process.exit(1);
    }
}

deploy();