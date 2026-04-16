import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DIRECT_URL });

async function run() {
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE user_settings 
      ADD COLUMN IF NOT EXISTS plan_expiry timestamp with time zone,
      ADD COLUMN IF NOT EXISTS auto_renewal boolean DEFAULT false;
    `);
    console.log('Database migrated successfully: added plan_expiry and auto_renewal to user_settings');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}
run();
