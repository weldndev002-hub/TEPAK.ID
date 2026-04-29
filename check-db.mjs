
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking subscription_history ---');
  const { data: history, error: hError } = await supabase
    .from('subscription_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (hError) console.error(hError);
  else console.log(JSON.stringify(history, null, 2));

  console.log('\n--- Checking orders ---');
  const { data: orders, error: oError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (oError) console.error(oError);
  else console.log(JSON.stringify(orders, null, 2));

  console.log('\n--- Checking subscription_plans ---');
  const { data: plans, error: pError } = await supabase
    .from('subscription_plans')
    .select('*');

  if (pError) console.error(pError);
  else console.log(JSON.stringify(plans, null, 2));
}

check();
