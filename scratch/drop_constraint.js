import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DIRECT_URL,
});

async function run() {
  await client.connect();
  const res = await client.query("ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;");
  console.log("Constraint dropped.");
  await client.end();
}
run();
