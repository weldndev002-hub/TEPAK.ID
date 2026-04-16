import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient, parseCookieHeader } from '@supabase/ssr';

// Helper to get env vars safely
// Browser: uses import.meta.env (Vite/Astro build-time)
// Server: uses import.meta.env or resolved CF env
const getEnv = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

// Helper for server-side: tries cloudflare:workers env first (runtime), then build-time env
const getServerEnv = async (key: string): Promise<string | undefined> => {
  try {
    // @ts-ignore - only available in Cloudflare Workers runtime
    const cf = await import('cloudflare:workers');
    if (cf?.env?.[key]) return cf.env[key];
  } catch (e) {
    // Not in CF runtime, fall through
  }
  return getEnv(key);
};

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY');

// 1. Browser Client for React Components (uses build-time env only — no CF workers)
export const supabase = createBrowserClient(supabaseUrl || '', supabaseAnonKey || '');

// 2. Server Client untuk Middleware atau .astro files (SSR)
export const getServerClient = (cookies: any, request: Request) => {
  const url = getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
  const key = getEnv('PUBLIC_SUPABASE_ANON_KEY') || supabaseAnonKey;

  if (!url || !key) {
    console.error('❌ Supabase Server Client: Missing URL or Key. Check ENV.');
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
  const url = runtimeEnv?.PUBLIC_SUPABASE_URL || getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
  
  // Try to find the service key in multiple places (SSR context, process.env, or import.meta)
  const serviceKey = 
    runtimeEnv?.SUPABASE_SERVICE_ROLE_KEY || 
    getEnv('SUPABASE_SERVICE_ROLE_KEY') || 
    (typeof process !== 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined);

  if (!serviceKey || serviceKey.startsWith('http') || serviceKey === 'placeholder-service-key') {
      console.warn('⚠️ [Supabase Admin] Valid SUPABASE_SERVICE_ROLE_KEY not found. Admin bypass will fail.');
  }

  return createClient(url || '', serviceKey || 'missing-key', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
  });
};

