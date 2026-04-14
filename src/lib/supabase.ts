import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient, parseCookieHeader } from '@supabase/ssr';

// Helper to safely get environment variables across Browser, Node, and Cloudflare
// Helper to safely get environment variables across Browser, Node, and Cloudflare
const getEnv = (key: string, env?: any) => {
  // 1. Try passed runtime env (Cloudflare Functions)
  if (env && env[key]) return env[key];

  // 2. Vite / Astro Build-time (PUBLIC_ vars for browser)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }

  // 3. Node.js Runtime fallback
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  return undefined;
};

const supabaseUrlDefault = getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKeyDefault = getEnv('PUBLIC_SUPABASE_ANON_KEY');

// 1. Browser Client untuk React Components 
export const supabase = createBrowserClient(supabaseUrlDefault || '', supabaseAnonKeyDefault || '');

// 2. Server Client untuk Middleware atau .astro files (SSR)
export const getServerClient = (cookies: any, request: Request, runtimeEnv?: any) => {
  const url = getEnv('PUBLIC_SUPABASE_URL', runtimeEnv) || supabaseUrlDefault;
  const key = getEnv('PUBLIC_SUPABASE_ANON_KEY', runtimeEnv) || supabaseAnonKeyDefault;

  if (!url || !key) {
    console.error('❌ Supabase Server Client: Missing URL or Key. Check Cloudflare ENV.');
  }

  return createServerClient(url || '', key || '', {
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

export const getSupabaseAdmin = (runtimeEnv?: any) => {
  const url = getEnv('PUBLIC_SUPABASE_URL', runtimeEnv) || supabaseUrlDefault;
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', runtimeEnv) || 'placeholder-service-key';
  return createClient(url || '', serviceKey);
};

