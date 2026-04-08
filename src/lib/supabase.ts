import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables are missing. Running in FE-only mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin/webhook actions
export const getSupabaseAdmin = () => {
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';
  return createClient(supabaseUrl, serviceKey);
};
