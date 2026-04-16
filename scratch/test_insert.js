import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const sb = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await sb.from('products').insert({
    title: 'Test',
    description: 'Test',
    price: 15000,
    type: 'digital',
    status: 'draft',
    cover_url: '',
    file_url: 'assets/test.pdf',
    preview_urls: [],
    merchant_id: 'e4dbf068-d65d-4f36-96f7-11fdc3cb2228', // Dummy UUID, might fail fk constraint
    updated_at: new Date().toISOString()
  }).select().single();
  
  if (error) {
    console.error("Insert Error", error);
  } else {
    console.log("Success", data);
  }
}
run();
