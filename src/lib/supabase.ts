import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient, parseCookieHeader } from '@supabase/ssr';

// Helper to get env vars safely
// Browser: uses import.meta.env (Vite/Astro build-time)
// Server: uses import.meta.env or resolved CF env
const getEnv = (key: string): string | undefined => {
  try {
    // 1. Build-time (Vite/Astro) - Priority for Browser
    if (key === 'PUBLIC_SUPABASE_URL') return import.meta.env.PUBLIC_SUPABASE_URL;
    if (key === 'PUBLIC_SUPABASE_ANON_KEY') return import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') return import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    if (key === 'ADMIN_PASSCODE') return import.meta.env.ADMIN_PASSCODE;

    // Fallback for other keys
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env as any)[key];
    }
  } catch (e) {
    // Suppress errors during initialization
  }

  try {
    // 2. Runtime (Node.js)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {}

  try {
    // 3. Cloudflare Workers (Fallback/Global)
    // Often in CF, secrets are attached to globalThis or the worker's context
    if (typeof globalThis !== 'undefined') {
      const val = (globalThis as any)[key];
      if (val) return val;
      
      // Also check for env object in some worker templates
      if ((globalThis as any).env && (globalThis as any).env[key]) {
        return (globalThis as any).env[key];
      }
    }
  } catch (e) {}

  return undefined;
};

const getServerEnv = async (key: string): Promise<string | undefined> => {
  return getEnv(key);
};

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY');

// 1. Browser Client (Lazy initialization)
let browserClient: any = null;

export const getSupabaseBrowserClient = (url?: string, key?: string) => {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return null as any;

  if (browserClient) return browserClient;

  const finalUrl = url || getEnv('PUBLIC_SUPABASE_URL');
  const finalKey = key || getEnv('PUBLIC_SUPABASE_ANON_KEY');

  if (!finalUrl || !finalKey) return null as any;

  browserClient = createBrowserClient(finalUrl, finalKey);
  return browserClient;
};

// Keep the export for backward compatibility but make it a proxy or safe null
export const supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : null as any;

// 2. Server Client untuk Middleware atau .astro files (SSR)
export const getServerClient = (cookies: any, request: Request, runtimeEnv?: any) => {
  const url = runtimeEnv?.PUBLIC_SUPABASE_URL || getEnv('PUBLIC_SUPABASE_URL') || supabaseUrl;
  const key = runtimeEnv?.PUBLIC_SUPABASE_ANON_KEY || getEnv('PUBLIC_SUPABASE_ANON_KEY') || supabaseAnonKey;

  if (!url || !key) {
    console.error('❌ Supabase Server Client: Missing URL or Key. Check Cloudflare Dashboard Variables.');
    return null as any;
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
      console.error('❌ Supabase Admin: Missing Service Role Key.');
      return null as any;
  }

  return createClient(url, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
  });
};

