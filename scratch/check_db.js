import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('user_settings')
    .select('ga_id, fb_pixel_id')
    .limit(1);

  if (error) {
    console.error('Schema check failed:', error);
  } else {
    console.log('Schema check success! Columns exist.');
    console.log('Sample data:', data);
  }
}

checkSchema();
