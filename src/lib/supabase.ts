import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient, parseCookieHeader } from '@supabase/ssr';

// Helper to get env vars safely
// Browser: uses import.meta.env (Vite/Astro build-time)
// Server: uses import.meta.env or resolved CF env
const getEnv = (key: string): string | undefined => {
  // 1. Build-time (Vite/Astro)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }

  // 2. Runtime (Node.js)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // 3. Cloudflare Workers (Astro 6+)
  // Note: We try to use globalThis first as a fallback for some environments
  if (typeof globalThis !== 'undefined' && (globalThis as any)[key]) {
    return (globalThis as any)[key];
  }

  return undefined;
};

const getServerEnv = async (key: string): Promise<string | undefined> => {
  return getEnv(key);
};

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY');

// 1. Browser Client for React Components (uses build-time env only — no CF workers)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// 2. Server Client untuk Middleware atau .astro files (SSR)
export const getServerClient = (cookies: any, request: Request, runtimeEnv?: any) => {
  const url = runtimeEnv?.PUBLIC_SUPABASE_URL || getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
  const key = runtimeEnv?.PUBLIC_SUPABASE_ANON_KEY || getEnv('PUBLIC_SUPABASE_ANON_KEY') || supabaseAnonKey;

  if (!url || !key) {
    console.error('❌ Supabase Server Client: Missing URL or Key. Check ENV.');
    throw new Error('Supabase configuration missing. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.');
  }

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

export const getSupabaseAdmin = (runtimeEnv?: any) => {
  const url = runtimeEnv?.PUBLIC_SUPABASE_URL || getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
  
  // Try to find the service key in multiple places (SSR context, process.env, or import.meta)
  const serviceKey = 
    runtimeEnv?.SUPABASE_SERVICE_ROLE_KEY || 
    getEnv('SUPABASE_SERVICE_ROLE_KEY');

  console.log(`[Supabase Admin Init] URL: ${url ? 'Found' : 'Missing'}, Key: ${serviceKey ? `Found (${serviceKey.length} chars)` : 'Missing'}`);

  if (!url || !serviceKey) {
      throw new Error('Supabase Admin configuration missing. Please set SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(url, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
  });
};

