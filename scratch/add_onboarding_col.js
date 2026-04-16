import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DIRECT_URL });

async function run() {
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
    `);
    console.log('Column added: onboarding_completed');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}
run();
