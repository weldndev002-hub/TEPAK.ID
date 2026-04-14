import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient, parseCookieHeader } from '@supabase/ssr';

// Helper to safely get environment variables across Browser, Node, and Cloudflare
const getEnv = (key: string) => {
  // 1. Vite / Astro Build-time (PUBLIC_ vars)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }

  // 2. Node.js Runtime fallback
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  return undefined;
};

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  if (typeof window !== 'undefined') {
    console.error('❌ Supabase configuration is missing. Please check your Cloudflare Build Variables.');
  }
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

