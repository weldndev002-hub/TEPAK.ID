import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient, parseCookieHeader } from '@supabase/ssr';

// Helper to safely get environment variables across Browser, Node, and Cloudflare
const getEnv = (key: string) => {
  // 1. Try import.meta.env (Vite/Astro)
  if (import.meta.env && import.meta.env[key]) return import.meta.env[key];
  // 2. Try global cloudflare env if available (Edge)
  try {
    // @ts-ignore
    if (typeof env !== 'undefined' && (env as any)[key]) return (env as any)[key];
  } catch (e) {}
  
  return null;
};

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY') || 'placeholder-key';

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.warn('⚠️ Supabase environment variables are missing.');
}


// 1. Browser Client untuk React Components 
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// 2. Server Client untuk Middleware atau .astro files (SSR)
export const getServerClient = (cookies: any, request: Request) => {
  const url = getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
  const key = getEnv('PUBLIC_SUPABASE_ANON_KEY') || supabaseAnonKey;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, { ...options, path: '/' });
        });
      },
    },
  });
};

export const getSupabaseAdmin = () => {
  const url = getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || 'placeholder-service-key';
  return createClient(url, serviceKey);
};

