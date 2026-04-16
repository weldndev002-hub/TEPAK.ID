import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DIRECT_URL });

async function run() {
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position");
  console.log(res.rows);
  await client.end();
}
run();
