
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addVisibilityColumn() {
  console.log('Attempting to add is_public column to products table...');
  
  // Since we don't have rpc('exec_sql'), we'll try to use a simple query 
  // to check if it exists, and then inform the user if it's missing.
  // Actually, we can't run ALTER TABLE via supabase-js easily unless there's an RPC.
  
  const { data, error } = await supabase
    .from('products')
    .select('is_public')
    .limit(1);

  if (error && error.code === '42703') { // undefined_column
    console.log('Column is_public is missing. You need to run this SQL in Supabase Dashboard:');
    console.log('ALTER TABLE products ADD COLUMN is_public BOOLEAN DEFAULT true;');
  } else if (error) {
    console.error('Error checking column:', error);
  } else {
    console.log('Column is_public already exists.');
  }
}

addVisibilityColumn();
