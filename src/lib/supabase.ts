import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient, parseCookieHeader } from '@supabase/ssr';

// Helper to get env vars safely
// Browser: uses import.meta.env (Vite/Astro build-time)
// Server: uses import.meta.env or resolved CF env
const getEnv = (key: string): string | undefined => {
  // Helper to clean values (remove quotes and spaces)
  const clean = (v: any, isUrl = false) => {
    if (typeof v !== 'string') return v;
    let cleaned = v.trim().replace(/^["']|["']$/g, '');
    if (isUrl) cleaned = cleaned.replace(/\/+$/, '');
    return cleaned;
  };

  try {
    // 1. Build-time (Vite/Astro) - Priority for Browser
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (key === 'PUBLIC_SUPABASE_URL' && import.meta.env.PUBLIC_SUPABASE_URL) return clean(import.meta.env.PUBLIC_SUPABASE_URL, true);
      if (key === 'PUBLIC_SUPABASE_ANON_KEY' && import.meta.env.PUBLIC_SUPABASE_ANON_KEY) return clean(import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
      if (key === 'SUPABASE_SERVICE_ROLE_KEY' && import.meta.env.SUPABASE_SERVICE_ROLE_KEY) return clean(import.meta.env.SUPABASE_SERVICE_ROLE_KEY);
      if (key === 'ADMIN_PASSCODE' && import.meta.env.ADMIN_PASSCODE) return clean(import.meta.env.ADMIN_PASSCODE);

      if ((import.meta.env as any)[key]) {
        return clean((import.meta.env as any)[key], key.includes('URL'));
      }
    }
  } catch (e) { }

  try {
    // 2. Runtime (Node.js)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return clean(process.env[key], key.includes('URL'));
    }
  } catch (e) { }

  try {
    // 3. Cloudflare Workers (Fallback/Global)
    if (typeof globalThis !== 'undefined') {
      // Check direct global (for older Worker styles or polyfills)
      const val = (globalThis as any)[key];
      if (val && typeof val === 'string') return clean(val, key.includes('URL'));

      // Check globalThis.env (Our custom injection)
      if ((globalThis as any).env && (globalThis as any).env[key]) {
        return clean((globalThis as any).env[key], key.includes('URL'));
      }

      // Check Astro locals runtime if it was globally injected
      if ((globalThis as any).runtime?.env?.[key]) {
        return clean((globalThis as any).runtime.env[key], key.includes('URL'));
      }
    }
  } catch (e) { }

  try {
    // 4. Browser Globals (Injected via script tag)
    if (typeof window !== 'undefined') {
      if ((window as any).__SUPABASE_CONFIG__?.[key]) {
        return clean((window as any).__SUPABASE_CONFIG__[key], key.includes('URL'));
      }
    }
  } catch (e) { }

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

  if (!finalUrl || !finalKey) {
    if (isBrowser) {
      console.warn('[Supabase Browser Client] Initialization failed: Missing URL or Key', {
        hasUrl: !!finalUrl,
        hasKey: !!finalKey,
        metaEnvUrl: !!import.meta.env.PUBLIC_SUPABASE_URL,
        metaEnvKey: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY
      });
    }
    return null as any;
  }

  // CRITICAL: Cookie handlers are REQUIRED for PKCE OAuth flow.
  // Without these, the code_verifier is stored in memory/localStorage
  // and is inaccessible to the server-side callback handler,
  // causing exchangeCodeForSession to return null session.
  browserClient = createBrowserClient(finalUrl, finalKey, {
    cookies: {
      getAll() {
        return document.cookie.split('; ').filter(Boolean).map(cookie => {
          const [name, ...valueParts] = cookie.split('=');
          return { name, value: valueParts.join('=') };
        });
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          let cookieString = `${name}=${value}`;
          if (options?.path) cookieString += `; path=${options.path}`;
          if (options?.maxAge !== undefined) cookieString += `; max-age=${options.maxAge}`;
          if (options?.domain) cookieString += `; domain=${options.domain}`;
          if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
          if (options?.secure && window.location.protocol === 'https:') cookieString += '; secure';
          document.cookie = cookieString;
        });
      },
    },
  });
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

  // parseCookieHeader returns {name: string, value?: string}[]
  // Supabase SSR requires {name: string, value: string}[] — filter out undefined values
  const parsedCookies = parseCookieHeader(request.headers.get('Cookie') ?? '').filter(
    (cookie): cookie is { name: string; value: string } => cookie.value !== undefined
  );

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parsedCookies;
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

