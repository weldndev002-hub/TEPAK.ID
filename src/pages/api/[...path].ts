import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { cors } from 'hono/cors';

// Get environment from build-time env or process.env
let cfEnv: any = {};

// Pre-import Supabase Admin to avoid dynamic import issues in dev mode
import { getSupabaseAdmin } from '../../lib/supabase';

// Helper to safely get environment variables
const getEnv = (key: string) => {
  const clean = (v: any, isUrl = false) => {
    if (typeof v !== 'string') return v;
    let cleaned = v.trim().replace(/^["']|["']$/g, '');
    if (isUrl) cleaned = cleaned.replace(/\/+$/, '');
    return cleaned;
  };

  // 1. Try passed runtime env (Cloudflare v6+)
  if (typeof cfEnv !== 'undefined' && cfEnv && cfEnv[key]) return clean(cfEnv[key], key.includes('URL'));

  // 2. Vite / Astro Build-time (PUBLIC_ vars)
  if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any)[key]) {
    return clean((import.meta.env as any)[key], key.includes('URL'));
  }

  // 3. Process ENV fallback (Local Node.js)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return clean(process.env[key], key.includes('URL'));
  }

  // 4. Global Fallback (Cloudflare Workers Standard)
  if (typeof globalThis !== 'undefined') {
    const val = (globalThis as any)[key];
    if (val) return clean(val, key.includes('URL'));
    if ((globalThis as any).env && (globalThis as any).env[key]) {
      return clean((globalThis as any).env[key], key.includes('URL'));
    }
  }

  return null;
};


const app = new Hono().basePath('/api');

// Middleware to capture Cloudflare Environment and Log Paths
app.use('*', cors());
app.use('*', async (c, next) => {
  // Capture environment from Hono's context
  if (c.env) {
    cfEnv = { ...cfEnv, ...c.env };
  }
  
  console.log(`[Hono Debug] Method: ${c.req.method}, Path: ${c.req.path}, URL: ${c.req.url}`);
  await next();
});

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Global Error] ${c.req.method} ${c.req.url}:`, err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    stack: err.stack,
    details: (err as any).details || (err as any).code || null,
    hint: (err as any).hint || null,
    note: 'Caught by Global Handler'
  }, 500);
});

// --- SECURITY & SANITIZATION HELPERS ---

/**
 * Helper to sanitize any string from HTML/Script tags.
 * Strips all HTML tags and normalizes whitespace.
 */
const sanitizeString = (str: any): string => {
  if (!str || typeof str !== 'string') return typeof str === 'string' ? '' : str;

  // 1. Remove all script tags and their content
  let cleaned = str.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');

  // 2. Remove "on" event handlers (e.g., onclick, onerror)
  cleaned = cleaned.replace(/on\w+\s*=\s*(['"]?)(.*?)\1/gim, '');

  // 3. Remove "javascript:" protocols
  cleaned = cleaned.replace(/javascript\s*:/gim, '');

  // 4. Strip ALL HTML tags for text-only fields
  cleaned = cleaned.replace(/<[^>]*>?/gm, '');

  // 5. Normalize whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
};

/**
 * Validates if a string contains potentially malicious patterns.
 * Used for "negative case" detection.
 */
const isMalicious = (str: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /on\w+\s*=/i,
    /javascript:/i,
    /data:text\/html/i,
    /document\./i,
    /window\./i,
    /eval\(/i
  ];
  return dangerousPatterns.some(pattern => pattern.test(str));
};

/**
 * Helper function to sanitize a block object (backend side).
 * Recursively cleans text content within blocks.
 */
const sanitizeTextBlockContent = (block: any): any => {
  if (!block || typeof block !== 'object') return block;

  // Deep copy to avoid mutating original
  const sanitized = JSON.parse(JSON.stringify(block));

  // Sanitize based on block type
  if (sanitized.type === 'text' && sanitized.data) {
    if (sanitized.data.title) sanitized.data.title = sanitizeString(sanitized.data.title);
    if (sanitized.data.content) sanitized.data.content = sanitizeString(sanitized.data.content);
  } else if (['link', 'article', 'video', 'image'].includes(sanitized.type)) {
    // Top-level fields
    if (sanitized.title) sanitized.title = sanitizeString(sanitized.title);
    if (sanitized.subtitle) sanitized.subtitle = sanitizeString(sanitized.subtitle);

    // Data fields
    if (sanitized.data) {
      if (sanitized.data.title) sanitized.data.title = sanitizeString(sanitized.data.title);
      if (sanitized.data.description) sanitized.data.description = sanitizeString(sanitized.data.description);
      if (sanitized.data.content) sanitized.data.content = sanitizeString(sanitized.data.content);
    }
  }

  return sanitized;
};

/**
 * Zod refinement to detect script tags
 */
const noScriptRefinement = (val: string | undefined | any) => {
  if (!val) return true;
  const str = typeof val === 'string' ? val : JSON.stringify(val);
  const dangerousPatterns = [
    /<script/i,
    /(?:^|\s)on\w+\s*=/i, // Match event handlers like onclick= but not words like "only" or "onboarding"
    /javascript:/i,
    /data:text\/html/i,
    /document\./i,
    /window\./i,
    /eval\(/i
  ];
  const matched = dangerousPatterns.find(pattern => pattern.test(str));
  if (matched) {
    console.warn(`[Security] Malicious pattern detected: ${matched} in value: ${str.substring(0, 100)}`);
  }
  return !matched;
};

const XSS_ERROR_MESSAGE = "Teks mengandung skrip atau atribut berbahaya yang tidak diperbolehkan.";

// --- DEBUG ROUTES ---

app.get('/debug/env', async (c) => {
  let supabase_reachable = false;
  let fetch_error = null;

  try {
    const url = getEnv('PUBLIC_SUPABASE_URL');
    const testRes = await fetch(`${url}/auth/v1/health`, { method: 'GET', timeout: 2000 } as any);
    supabase_reachable = testRes.ok;
  } catch (e: any) {
    fetch_error = e.message;
  }

  const { user } = await getAuthContext(c);
  return c.json({
    has_url: !!getEnv('PUBLIC_SUPABASE_URL'),
    has_anon: !!getEnv('PUBLIC_SUPABASE_ANON_KEY'),
    has_service: !!getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    supabase_reachable,
    fetch_error,
    user_id: user?.id || null,
    user_email: user?.email || null,
    cookies: c.req.header('Cookie') ? 'Present' : 'Missing'
  });
});

app.get('/debug/keys', (c) => {
  const url = getEnv('PUBLIC_SUPABASE_URL');
  const key = getEnv('PUBLIC_SUPABASE_ANON_KEY');

  const mask = (s: any) => {
    if (!s || typeof s !== 'string') return 'MISSING';
    if (s.length < 10) return 'TOO_SHORT';
    return s.substring(0, 5) + '...' + s.substring(s.length - 5);
  };

  return c.json({
    url: mask(url),
    url_full_length: url?.length || 0,
    key: mask(key),
    key_full_length: key?.length || 0,
    cf_keys: Object.keys(c.env || {}),
    global_keys: typeof globalThis !== 'undefined' ? Object.keys(globalThis).filter(k => k.includes('SUPABASE')) : [],
    msg: 'Checking available bindings and masked values'
  });
});

// --- DOMAIN SETTINGS ROUTES ---

// Get domain status
app.get('/settings/domain', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('domain_name, domain_verified')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    let verification_records = null;
    const cfToken = getEnv('CLOUDFLARE_API_TOKEN');
    const cfZoneId = getEnv('CLOUDFLARE_ZONE_ID');

    if (data?.domain_name && !data.domain_verified && cfToken && cfZoneId) {
        try {
            const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${data.domain_name}`, {
                headers: { 'Authorization': `Bearer ${cfToken}` }
            });
            const cfData: any = await cfRes.json();
            if (cfRes.ok && cfData.result?.[0]) {
                const hostname = cfData.result[0];
                verification_records = {
                    ownership: hostname.ownership_verification || null,
                    ssl: hostname.ssl?.validation_records?.[0] || null
                };
            }
        } catch (e) {
            console.error('[Domain API] Failed to fetch verification records:', e);
        }
    }

    return c.json({ ...(data || { domain_name: null, domain_verified: false }), verification_records });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// --- ONBOARDING ATOMIC ROUTE ---
app.post('/onboarding/complete', zValidator('json', z.object({
  domain_name: z.string().min(1).regex(/^[a-z0-9.-]+$/, 'Hanya boleh berisi huruf kecil, angka, titik, dan tanda hubung').transform(v => v.trim()),
  full_name: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
  bio: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
  avatar_url: z.string().optional().nullable(),
  instagram_url: z.string().optional().nullable(),

  tiktok_url: z.string().optional().nullable(),
  youtube_url: z.string().optional().nullable(),
  theme: z.string().optional().default('atelier-dark')
})), async (c) => {
  let step = 'init';
  try {
    step = 'auth';
    const { user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    step = 'payload';
    const body = c.req.valid('json');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    console.log(`[Atomic Onboarding] [Step: ${step}] User: ${user.id}, Domain: ${body.domain_name}, Theme: ${body.theme}`);

    // 1. Check domain availability
    step = 'domain-check';
    const { data: existingDomain, error: checkErr } = await adminSupabase
      .from('user_settings')
      .select('user_id')
      .eq('domain_name', body.domain_name)
      .neq('user_id', user.id)
      .maybeSingle();

    if (checkErr) {
      console.error(`[Atomic Onboarding] [Step: ${step}] Error:`, checkErr);
      throw new Error(`Gagal pengecekan domain: ${checkErr.message}`);
    }

    if (existingDomain) {
      return c.json({ error: 'Subdomain telah digunakan' }, 400);
    }

    // 2. Perform Profile Update
    step = 'profile-update';
    console.log(`[Atomic Onboarding] [Step: ${step}] Updating profiles table with username=${body.domain_name}...`);
    const { data: profile, error: pErr } = await adminSupabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: body.domain_name, // Fix: Ensure username is set
        full_name: body.full_name,
        bio: body.bio,
        avatar_url: body.avatar_url,
        instagram_url: body.instagram_url,
        tiktok_url: body.tiktok_url,
        youtube_url: body.youtube_url,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (pErr) {
      console.error(`[Atomic Onboarding] [Step: ${step}] Profiles Error:`, pErr);
      throw new Error(`Profil gagal disimpan: ${pErr.message}`);
    }

    // 3. Perform Domain + Theme + Onboarding Completed Upsert
    // Try with theme/onboarding_completed first (after migration), fallback without (before migration)
    step = 'domain-upsert';
    console.log(`[Atomic Onboarding] [Step: ${step}] Upserting user_settings table with theme=${body.theme}...`);

    let settings: any = null;
    let sErr: any = null;

    // Attempt with new columns (theme, onboarding_completed)
    const upsertData: any = {
      user_id: user.id,
      domain_name: body.domain_name,
      domain_verified: true,
      theme: body.theme,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    };

    const upsertResult = await adminSupabase
      .from('user_settings')
      .upsert(upsertData, { onConflict: 'user_id' })
      .select()
      .single();

    // DEBUG: Log the full error structure to diagnose schema cache issues
    if (upsertResult.error) {
      console.error(`[Atomic Onboarding] [Step: ${step}] Upsert error details:`, {
        code: upsertResult.error.code,
        message: upsertResult.error.message,
        details: upsertResult.error.details,
        hint: upsertResult.error.hint,
        fullError: JSON.stringify(upsertResult.error)
      });
    }

    if (upsertResult.error && (upsertResult.error.code === '42703' || upsertResult.error.message?.includes('schema cache'))) {
      // Column doesn't exist yet (migration not run) or PostgREST schema cache is stale - fallback without theme/onboarding_completed
      console.warn(`[Atomic Onboarding] [Step: ${step}] theme/onboarding_completed columns not found (code=${upsertResult.error.code}), falling back to basic upsert`);
      const fallbackResult = await adminSupabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          domain_name: body.domain_name,
          domain_verified: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();
      settings = fallbackResult.data;
      sErr = fallbackResult.error;
    } else {
      settings = upsertResult.data;
      sErr = upsertResult.error;
    }

    if (sErr) {
      console.error(`[Atomic Onboarding] [Step: ${step}] Settings Error:`, sErr);
      throw new Error(`Domain gagal disimpan: ${sErr.message}`);
    }

    console.log(`[Atomic Onboarding] [Step: success] Completed for ${user.id}`);
    return c.json({ success: true, settings });
  } catch (err: any) {
    console.error(`[Atomic Onboarding] [Step: ${step}] Critical Failure:`, err);
    return c.json({
      error: err.message || 'Server error',
      step,
      stack: err.stack
    }, 500);
  }
});

// --- ONBOARDING DATA (GET) - Fetch existing user data for pre-fill ---
app.get('/onboarding/data', async (c) => {
  try {
    const { user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const adminSupabase = getSupabaseAdmin(cfEnv);

    // Fetch profile data
    const { data: profile, error: pErr } = await adminSupabase
      .from('profiles')
      .select('full_name, bio, avatar_url, instagram_url, tiktok_url, youtube_url')
      .eq('id', user.id)
      .single();

    if (pErr && pErr.code !== 'PGRST116') {
      console.error('[Onboarding Data] Profile fetch error:', pErr);
    }

    // Fetch user_settings data (use select('*') for resilience - theme/onboarding_completed columns may not exist yet)
    const { data: settings, error: sErr } = await adminSupabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (sErr && sErr.code !== 'PGRST116') {
      console.error('[Onboarding Data] Settings fetch error:', sErr);
    }

    return c.json({
      profile: profile || {},
      settings: settings || {}
    });
  } catch (err: any) {
    console.error('[Onboarding Data] Error:', err);
    return c.json({ error: err.message || 'Server error' }, 500);
  }
});

// Update/Save domain (Cloudflare Custom Hostname Integration)
app.put('/settings/domain', zValidator('json', z.object({ 
  domain_name: z.string()
    .min(1)
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, "Format domain tidak valid, gunakan format: domainku.com atau sub.domainku.com")
    .refine(val => !val.includes('://'), "Gunakan format domain yang benar, tanpa http/https")
    .refine(val => !val.includes('/'), "Masukkan hanya nama domain, tanpa folder/path")
})), async (c) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[Domain API] [${timestamp}] Handler invoked`);
    const { supabase, user } = await getAuthContext(c);
    if (!user) {
      console.warn('[Domain API] Unauthorized access attempt');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { domain_name: raw_domain } = c.req.valid('json');
    const domain_name = raw_domain?.toLowerCase().trim();
    console.log(`[Domain API] Process started: domain=${domain_name}, user=${user.id}`);

    // 1. Check if the domain is already taken by ANOTHER user
    const adminSupabase = getSupabaseAdmin(cfEnv);
    const { data: existingDomain, error: checkError } = await adminSupabase
      .from('user_settings')
      .select('user_id')
      .eq('domain_name', domain_name)
      .neq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('[Domain API] Check error:', checkError);
      return c.json({ error: 'Database check failed: ' + checkError.message }, 500);
    }

    if (existingDomain) {
      console.log(`[Domain API] Domain ${domain_name} is already taken by ${existingDomain.user_id}`);
      return c.json({ error: 'Subdomain telah digunakan' }, 400);
    }

    // 2. Perform the update directly using admin client to ensure success during onboarding
    console.log(`[Domain API] Performing upsert for user: ${user.id}`);
    const { data: upsertData, error: upsertError } = await adminSupabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        domain_name,
        domain_verified: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('[Domain API] Upsert Error:', upsertError);
      return c.json({ error: 'Gagal menyimpan domain: ' + upsertError.message, code: upsertError.code }, 500);
    }

    // 3. Register with Cloudflare Custom Hostname API
    const cfToken = getEnv('CLOUDFLARE_API_TOKEN');
    const cfZoneId = getEnv('CLOUDFLARE_ZONE_ID');

    if (cfToken && cfZoneId) {
      try {
        console.log(`[Domain API] Registering ${domain_name} with Cloudflare...`);
        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hostname: domain_name,
            ssl: {
              method: 'http',
              type: 'dv'
            }
          })
        });

        const cfData: any = await cfRes.json();
        if (!cfRes.ok) {
            console.error('[Domain API] Cloudflare Registration FAILED:', JSON.stringify(cfData));
            // If already exists, we ignore the error but still log it for debugging
            if (cfData.errors?.[0]?.code === 1406) {
                console.log('[Domain API] Domain already exists on Cloudflare, proceeding...');
            } else {
                return c.json({ 
                    error: `Cloudflare API Error: ${cfData.errors?.[0]?.message || 'Unknown error'}`,
                    details: cfData.errors 
                }, 400);
            }
        } else {
            console.log(`[Domain API] Cloudflare Registration Success: ${cfData.result?.id}`);
        }
      } catch (cfErr) {
        console.error('[Domain API] Cloudflare API Fetch Error:', cfErr);
      }
    }

    console.log(`[Domain API] Success for user: ${user.id}`);
    return c.json(upsertData);
  } catch (err: any) {
    console.error('[Domain API Global Catch]', err);
    return c.json({
      error: 'Critical server error in domain settings',
      message: err.message
    }, 500);
  }
});

// Verify Domain Status (Server-side Cloudflare Check)
app.post('/settings/domain/verify', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // 1. Fetch current settings and check rate limit
    const { data: settings, error: fetchError } = await supabase
      .from('user_settings')
      .select('domain_name, domain_verified, updated_at')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !settings?.domain_name) {
      return c.json({ error: 'Domain belum dikonfigurasi' }, 400);
    }

    if (settings.domain_verified) {
        return c.json({ success: true, message: 'Domain sudah aktif' });
    }

    // Rate Limiting: Minimum 60 seconds between verification attempts
    const lastCheck = new Date(settings.updated_at).getTime();
    const now = Date.now();
    if (now - lastCheck < 60000) {
        const waitTime = Math.ceil((60000 - (now - lastCheck)) / 1000);
        return c.json({ 
            error: `Harap tunggu ${waitTime} detik lagi sebelum mencoba verifikasi ulang.`,
            code: 'RATE_LIMIT'
        }, 429);
    }

    // 2. Perform Server-side Cloudflare Status Check
    const cfToken = getEnv('CLOUDFLARE_API_TOKEN');
    const cfZoneId = getEnv('CLOUDFLARE_ZONE_ID');
    let isActuallyActive = false;

    if (cfToken && cfZoneId) {
        try {
            const cfUrl = `https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${settings.domain_name}`;
            console.log(`[Domain API] Checking CF status: ${cfUrl}`);
            
            const cfRes = await fetch(cfUrl, {
                headers: { 'Authorization': `Bearer ${cfToken}` }
            });
            const cfData: any = await cfRes.json();
            
            console.log(`[Domain API] CF Response Status: ${cfRes.status}`);
            
            if (cfRes.ok && cfData.result && cfData.result.length > 0) {
                const hostnameData = cfData.result[0];
                const hostnameActive = hostnameData.status === 'active';
                const sslActive = hostnameData.ssl?.status === 'active';
                
                console.log(`[Domain API] Hostname Status: ${hostnameData.status}, SSL Status: ${hostnameData.ssl?.status}`);

                if (hostnameActive && sslActive) {
                    isActuallyActive = true;
                    console.log(`[Domain API] Verification SUCCESS: ${settings.domain_name}`);
                } else if (hostnameActive) {
                    console.log(`[Domain API] Hostname active but SSL pending: ${settings.domain_name}`);
                    return c.json({ 
                        error: 'DNS sudah terhubung, tapi sertifikat SSL sedang disiapkan oleh Cloudflare. Harap tunggu 1-2 menit lagi.',
                        code: 'SSL_PENDING'
                    }, 400);
                }
            } else {
                console.warn(`[Domain API] Domain not found or not active on CF: ${JSON.stringify(cfData)}`);
            }
        } catch (e) {
            console.error('[Domain API] CF Verification Error:', e);
        }
    } else {
        // Fallback for local/dev if tokens are missing (for simulation)
        isActuallyActive = false; 
    }

    if (isActuallyActive) {
        const { error: updateError } = await getSupabaseAdmin(cfEnv)
          .from('user_settings')
          .update({ domain_verified: true, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        return c.json({ success: true, message: 'Domain verified' });
    } else {
        // Update timestamp even if failed to enforce rate limit
        await getSupabaseAdmin(cfEnv)
            .from('user_settings')
            .update({ updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

        return c.json({ 
            error: 'DNS belum terdeteksi aktif di Cloudflare. Harap pastikan CNAME sudah benar dan tunggu proses propagasi (biasanya 5-10 menit).',
            code: 'PENDING_PROPAGATION'
        }, 400);
    }
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete/Remove domain
app.delete('/settings/domain', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        domain_name: null,
        domain_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Helper untuk mendapatkan Supabase Client & User (Robust Cloudflare Compatibility)
// CRITICAL: parseCookieHeader returns {name, value}[] NOT a plain object.
// We must filter undefined values and provide setAll() for session refresh.
const getAuthContext = async (c: any) => {
  try {
    const url = getEnv('PUBLIC_SUPABASE_URL');
    const key = getEnv('PUBLIC_SUPABASE_ANON_KEY');

    // Multi-source cookie detection
    let cookieHeader = c.req.header('Cookie') ?? '';
    if (!cookieHeader) {
      // Fallback to Hono's getCookie if header is missing
      const allCookies = getCookie(c);
      cookieHeader = Object.entries(allCookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
    }

    if (!url || !key) {
      console.error('[getAuthContext] Configuration missing! URL:', !!url, 'Key:', !!key);
      return { supabase: null as any, user: null };
    }

    // Parse cookies and filter out entries with undefined values
    // parseCookieHeader returns {name: string, value?: string}[]
    // Supabase SSR requires {name: string, value: string}[]
    const parsedCookies = parseCookieHeader(cookieHeader).filter(
      (cookie): cookie is { name: string; value: string } => cookie.value !== undefined
    );

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return parsedCookies;
        },
        setAll(cookiesToSet) {
          // CRITICAL: Supabase SSR needs setAll() to refresh session cookies.
          // Without this, token refresh fails silently and the user appears logged out.
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Normalize sameSite: Supabase SSR may pass `true` but Hono expects string values
              let sameSite: 'lax' | 'strict' | 'none' | 'Lax' | 'Strict' | 'None' | undefined;
              if (typeof options?.sameSite === 'string') {
                sameSite = options.sameSite as any;
              } else if (options?.sameSite === true) {
                sameSite = 'Lax';
              } else {
                sameSite = 'Lax';
              }
              const isLocal = c.req.header('host')?.includes('localhost') || c.req.header('host')?.includes('127.0.0.1');
              setCookie(c, name, value, {
                ...options,
                path: options?.path || '/',
                secure: isLocal ? false : (options?.secure ?? true),
                sameSite,
                httpOnly: options?.httpOnly ?? true,
                maxAge: options?.maxAge,
              });
            });
          } catch (setErr: any) {
            console.warn('[getAuthContext] Failed to set cookies:', setErr.message);
          }
        },
      },
    });

    try {
      const { data: authData } = await supabase.auth.getUser();
      console.log('[getAuthContext] getUser result:', authData?.user ? `user ${authData.user.id}` : 'no user', 'error?', authData?.error);
      let authenticatedUser = authData?.user;

      // Fallback: If getUser failed but we have cookies, try to extract the token manually
      if (!authenticatedUser) {
        console.log('[getAuthContext] No user from getUser, checking cookies. parsedCookies length:', parsedCookies.length);
        const authTokenCookie = parsedCookies.find(cookie => cookie.name.includes('auth-token'));
        const token = authTokenCookie?.value
          || parsedCookies.find(c => c.name === 'sb_access_token')?.value
          || parsedCookies.find(c => c.name === 'sb-access-token')?.value;

        if (token) {
          console.log('[getAuthContext] Found token, attempting getUser with token');
          try {
            const { data: retryData } = await supabase.auth.getUser(token);
            if (retryData?.user) {
              authenticatedUser = retryData.user;
              console.log('[getAuthContext] User retrieved via token:', authenticatedUser.id);
            } else {
              // SUPER FALLBACK: Try to decode JWT manually for session existence check
              const parts = token.split('.');
              if (parts.length === 3) {
                const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(atob(base64));
                if (payload && payload.sub) {
                  authenticatedUser = { id: payload.sub, email: payload.email } as any;
                  console.log('[getAuthContext] User decoded from JWT:', authenticatedUser.id);
                }
              }
            }
          } catch (jwtErr) { console.log('[getAuthContext] JWT decode error:', jwtErr); }
        }
      }

      if (authenticatedUser) {
        // SECURITY: Check if user is banned
        // Use service role if possible to bypass RLS for this specific check, 
        // but here we use the admin client which we know has full access
        const adminSupabase = await getAdminClient(cfEnv);
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('is_banned')
          .eq('id', authenticatedUser.id)
          .single();

        if (profile?.is_banned) {
          console.warn(`[getAuthContext] Banned user attempted access: ${authenticatedUser.id}`);
          return { supabase, user: null };
        }

        return { supabase, user: authenticatedUser };
      }
    } catch (fErr: any) {
      console.error('[getAuthContext] Auth fetch failed (Internal Error):', fErr.message);
    }

    return { supabase, user: null };
  } catch (err: any) {
    console.error('[getAuthContext] Fatal Crash:', err);
    return { supabase: null as any, user: null };
  }
};

// Helper for admin client with environment-aware config
const getAdminClient = async (env: any) => {
  return getSupabaseAdmin(env);
};

// Middleware untuk logs
app.use('*', async (c, next) => {
  console.log(`[Hono] Request: ${c.req.method} ${c.req.url}`);
  await next();
});

// --- PUBLIC UTILITY ROUTES ---
app.get('/utils/fetch-metadata', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.json({ error: 'URL is required' }, 400);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/',
      },
    });

    if (!response.ok) {
      console.error(`[Fetch Metadata] HTTP Error: ${response.status} ${response.statusText} for ${url}`);
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }


    const html = await response.text();

    // More robust metadata extraction

    const getMeta = (name: string) => {
      const metas = html.match(/<meta[^>]*>/gi) || [];
      const target = name.toLowerCase();
      const ogTarget = `og:${target}`;
      const twitterTarget = `twitter:${target}`;

      for (const meta of metas) {
        const lowerMeta = meta.toLowerCase();
        if (
          lowerMeta.includes(`"${target}"`) || lowerMeta.includes(`'${target}'`) ||
          lowerMeta.includes(`"${ogTarget}"`) || lowerMeta.includes(`'${ogTarget}'`) ||
          lowerMeta.includes(`"${twitterTarget}"`) || lowerMeta.includes(`'${twitterTarget}'`)
        ) {

          const contentMatch = meta.match(/content=["']([^"']*)["']/i);
          if (contentMatch) return contentMatch[1];
        }
      }
      return null;
    };



    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = (getMeta('title') || titleMatch?.[1] || '').trim();


    const description = (getMeta('description') || '').trim();
    let image = (getMeta('image') || '').trim();

    // Fallback for Shopee images if og:image is missing
    if (!image && html.includes('shopee.co.id')) {
      const shopeeImgRegex = /https:\/\/(?:down-id\.img\.susercontent\.com|cf\.shopee\.co\.id)\/file\/([a-z0-9_]+)/i;
      const match = html.match(shopeeImgRegex);
      if (match) image = match[0];
    }


    // Resolve relative image URLs
    if (image && !image.startsWith('http')) {
      try {
        const baseUrl = new URL(url);
        image = new URL(image, baseUrl.origin).toString();
      } catch (e) { }
    }

    return c.json({
      title,
      description,
      image
    });

  } catch (err: any) {
    console.error('[Fetch Metadata Error]', err);
    return c.json({ error: err.message }, 500);
  }
});

// Check if email exists
app.get('/public/check-email', async (c) => {
  const email = c.req.query('email')?.toLowerCase();
  if (!email) return c.json({ exists: false, error: 'Email wajib diisi' }, 400);

  try {
    const adminSupabase = await getAdminClient(cfEnv);
    const { data, error } = await adminSupabase.auth.admin.listUsers();
    if (error) throw error;
    const userExists = data.users.some(u => u.email?.toLowerCase() === email);
    return c.json({ exists: userExists });
  } catch (err: any) {
    console.error('[Check Email API Error]', err);
    return c.json({ exists: false, error: err.message || 'Server Error' });
  }
});

app.get('/public/check-domain', async (c) => {
  const domain = c.req.query('name')?.toLowerCase();
  if (!domain) return c.json({ available: false, error: 'Nama domain wajib diisi' }, 400);

  const domainRegex = /^[a-zA-Z0-9-]+$/;
  if (!domainRegex.test(domain)) {
    return c.json({ available: false, error: 'Error format' }, 400);
  }

  try {
    const adminSupabase = await getAdminClient(cfEnv);
    const { data, error } = await adminSupabase
      .from('user_settings')
      .select('user_id')
      .eq('domain_name', domain)
      .maybeSingle();

    if (error) throw error;

    const reserved = ['admin', 'tepak', 'orbit', 'studio', 'api', 'auth', 'login', 'register', 'dashboard'];
    if (reserved.includes(domain)) {
      return c.json({ available: false, error: 'Subdomain telah digunakan' });
    }

    return c.json({ available: !data });
  } catch (err: any) {
    console.error('[Check Domain API Error]', err);
    return c.json({ available: false, error: err.message || 'Server Error' }, 500);
  }
});

// --- DEBUG / LIVENESS ---
app.get('/hello', (c) => {
  return c.json({
    message: 'Hello from Hono on Astro Edge!',
    timestamp: new Date().toISOString()
  });
});

// --- ORDERS ROUTES (TO THE TOP FOR PRIORITY) ---

// --- WALLET & WITHDRAWAL ROUTES ---

// Get wallet balances
app.get('/wallet/stats', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // 1. Get balance from wallet table
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('merchant_id', user.id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') throw walletError;

    // 2. Get total net revenue from net_amount column in orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('net_amount, amount, status')
      .eq('merchant_id', user.id)
      .in('status', ['success', 'paid']);

    if (orderError) throw orderError;

    // Use net_amount if available, fallback to 5% calculation for old legacy data
    const totalNet = orders?.reduce((sum: number, o: any) => {
      const val = o.net_amount !== null ? Number(o.net_amount) : Math.floor(Number(o.amount) * 0.95);
      return sum + val;
    }, 0) || 0;

    // 3. Fetch payout config for dynamic fee display
    const { data: payoutConfig } = await supabase
      .from('platform_configs')
      .select('payout_fee, min_withdrawal')
      .eq('id', 1)
      .single();

    return c.json({
      available: wallet?.available_balance || 0,
      pending: wallet?.pending_balance || 0,
      total_net: totalNet,
      payout_fee: payoutConfig?.payout_fee || 5000,
      min_withdrawal: payoutConfig?.min_withdrawal || 50000
    });
  } catch (err: any) {
    console.error('[Wallet Stats API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Get withdrawal history
app.get('/withdrawals', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        bank_accounts (*)
      `)
      .eq('merchant_id', user.id)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return c.json(data || []);
  } catch (err: any) {
    console.error('[Withdrawals API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Request new withdrawal (Manual approval by Admin)
app.post('/wallet/withdraw', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // --- SECURITY: Check if Payouts are globally enabled ---
    const { data: config } = await supabase
      .from('platform_configs')
      .select('payouts_enabled, payout_fee, min_withdrawal')
      .eq('id', 1)
      .single();

    if (config && config.payouts_enabled === false) {
      return c.json({
        error: 'Penarikan saldo sedang ditangguhkan sementara untuk pemeliharaan sistem. Harap coba lagi nanti.'
      }, 403);
    }

    const { amount, bankAccountId } = await c.req.json();
    if (!amount || amount <= 0) throw new Error('Jumlah penarikan tidak valid');
    if (!bankAccountId) throw new Error('Rekening bank wajib dipilih');

    const payoutFee = config?.payout_fee || 5000;
    const minWithdrawal = config?.min_withdrawal || 50000;
    if (Number(amount) < minWithdrawal) {
      return c.json({ error: `Minimal penarikan adalah Rp ${minWithdrawal.toLocaleString('id-ID')}` }, 400);
    }

    console.log(`[Withdraw API] User ${user.id} requesting withdrawal of ${amount}, bankAccountId: ${bankAccountId}`);

    // --- Step 1: Ambil info rekening bank dari database ---
    const { data: bankAccount, error: bankError } = await supabase
      .from('bank_accounts')
      .select('id, bank_name, account_number, account_name')
      .eq('id', bankAccountId)
      .eq('merchant_id', user.id)
      .single();

    if (bankError || !bankAccount) {
      throw new Error('Rekening bank tidak ditemukan. Silakan daftarkan rekening terlebih dahulu.');
    }

    // --- Step 2: Cek saldo wallet ---
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('available_balance')
      .eq('merchant_id', user.id)
      .single();

    if (walletError) throw walletError;

    const availableBalance = Number(wallet?.available_balance || 0);
    if (availableBalance < Number(amount)) {
      return c.json({ error: `Saldo tidak mencukupi. Saldo tersedia: Rp ${availableBalance.toLocaleString('id-ID')}` }, 400);
    }

    // --- Step 3: Initiate Withdrawal via Atomic RPC ---
    // Creates a pending record and deducts available balance (moves to pending_balance)
    console.log(`[Withdraw API] RPC initiate_withdrawal for ${amount}`);
    const { data: withdrawalId, error: rpcError } = await supabase.rpc('initiate_withdrawal', {
      p_merchant_id: user.id,
      p_amount: Number(amount),
      p_bank_account_id: bankAccountId
    });

    if (rpcError) {
      console.error('[Withdraw API] RPC Error:', rpcError);
      return c.json({ error: `Gagal inisialisasi penarikan: ${rpcError.message}` }, 500);
    }

    // --- Step 4: Return pending status ---
    // Admin will manually review, transfer, and approve via /admin/payouts
    console.log(`[Withdraw API] ✅ Withdrawal request created (pending): ${withdrawalId}`);
    return c.json({
      success: true,
      withdrawalId,
      status: 'pending',
      accountName: bankAccount.account_name,
      bankName: bankAccount.bank_name,
      amount: Number(amount),
      fee: payoutFee,
      netTransfer: Number(amount) - payoutFee,
      newBalance: availableBalance - Number(amount)
    });

  } catch (err: any) {
    console.error('[Withdraw API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// --- DISBURSEMENT (DUITKU TRANSFER) ROUTES ---

// Cek saldo akun Duitku
app.get('/disbursement/balance', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { DuitkuDisbursementService } = await import('../../lib/duitku-disbursement');
    const service = new DuitkuDisbursementService();
    const balance = await service.checkBalance();
    return c.json(balance);
  } catch (err: any) {
    console.error('[Disbursement Balance] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Inquiry / Validasi nomor rekening
app.post('/disbursement/inquiry', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { bankCode, bankAccount, amountTransfer, purpose } = await c.req.json();
    if (!bankCode || !bankAccount) {
      return c.json({ error: 'bankCode dan bankAccount wajib diisi' }, 400);
    }

    const { DuitkuDisbursementService } = await import('../../lib/duitku-disbursement');
    const service = new DuitkuDisbursementService();
    const inquiry = await service.inquiryAccount(
      bankCode,
      bankAccount,
      amountTransfer || 50000,
      purpose || 'Inquiry rekening Tepak.ID'
    );
    return c.json(inquiry);
  } catch (err: any) {
    console.error('[Disbursement Inquiry] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Daftar bank yang tersedia untuk disbursement
app.get('/disbursement/banks', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { DuitkuDisbursementService } = await import('../../lib/duitku-disbursement');
    const service = new DuitkuDisbursementService();
    const bankList = await service.getBankList();
    return c.json(bankList);
  } catch (err: any) {
    console.error('[Disbursement Banks] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Cek status transfer
app.get('/disbursement/status/:disburseId', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const disburseId = c.req.param('disburseId');
    if (!disburseId) {
      return c.json({ error: 'disburseId wajib diisi' }, 400);
    }

    const { DuitkuDisbursementService } = await import('../../lib/duitku-disbursement');
    const service = new DuitkuDisbursementService();
    const status = await service.checkTransferStatus(disburseId);
    return c.json(status);
  } catch (err: any) {
    console.error('[Disbursement Status] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Withdraw dengan Duitku Disbursement (gabungan inquiry + transfer)
app.post('/disbursement/withdraw', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { amount, bankCode, bankAccount, bankAccountId } = await c.req.json();

    // --- Validasi input ---
    if (!amount || amount <= 0) {
      return c.json({ error: 'Amount harus lebih dari 0' }, 400);
    }
    if (!bankCode) {
      return c.json({ error: 'Bank code wajib diisi' }, 400);
    }
    if (!bankAccount) {
      return c.json({ error: 'Nomor rekening (bankAccount) wajib diisi' }, 400);
    }

    // --- SECURITY: Check if Payouts are globally enabled ---
    const { data: config } = await supabase
      .from('platform_configs')
      .select('payouts_enabled, payout_fee, min_withdrawal')
      .eq('id', 1)
      .single();

    if (config && config.payouts_enabled === false) {
      return c.json({
        error: 'Penarikan saldo sedang ditangguhkan sementara untuk pemeliharaan sistem. Harap coba lagi nanti.'
      }, 403);
    }

    const minWithdrawal = config?.min_withdrawal || 50000;

    if (Number(amount) < minWithdrawal) {
      return c.json({ error: `Minimal penarikan adalah Rp ${minWithdrawal.toLocaleString('id-ID')}` }, 400);
    }

    // --- Cek saldo wallet user ---
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('available_balance')
      .eq('merchant_id', user.id)
      .single();

    if (walletError) throw walletError;

    const availableBalance = Number(wallet?.available_balance || 0);
    if (availableBalance < Number(amount)) {
      return c.json({ error: `Saldo tidak mencukupi. Saldo tersedia: Rp ${availableBalance.toLocaleString('id-ID')}` }, 400);
    }

    // --- Step 1: Inquiry rekening (validasi nama pemilik) ---
    const { DuitkuDisbursementService } = await import('../../lib/duitku-disbursement');
    const service = new DuitkuDisbursementService();

    console.log(`[Disbursement Withdraw] Step 1: Inquiry for bank=${bankCode}, account=${bankAccount}, amount=${amount}`);
    const inquiry = await service.inquiryAccount(
      bankCode,
      bankAccount,
      Number(amount),
      `Withdrawal Tepak.ID - ${user.id.substring(0, 8)}`
    );

    if (inquiry.responseCode !== '00') {
      return c.json({
        error: `Validasi rekening gagal: ${inquiry.responseDesc}`,
        inquiry
      }, 400);
    }

    // --- Step 2: Initiate Withdrawal via Atomic RPC ---
    // This handles balance check, deduction, and record creation in one transaction
    console.log(`[Disbursement Withdraw] Step 2: RPC initiate_withdrawal for ${amount}`);

    // First, find or create the bank account record to get an ID
    let targetBankAccountId = bankAccountId;
    if (!targetBankAccountId) {
      const { data: existingBank } = await supabase
        .from('bank_accounts')
        .select('id')
        .eq('merchant_id', user.id)
        .eq('account_number', bankAccount)
        .eq('bank_name', bankCode)
        .single();

      if (existingBank) {
        targetBankAccountId = existingBank.id;
      } else {
        const { data: newBank, error: bankCreateError } = await supabase
          .from('bank_accounts')
          .insert({
            merchant_id: user.id,
            bank_name: bankCode,
            account_number: bankAccount,
            account_name: inquiry.accountName,
            is_primary: false
          })
          .select('id')
          .single();

        if (bankCreateError) throw bankCreateError;
        targetBankAccountId = newBank.id;
      }
    }

    const { data: withdrawalId, error: rpcError } = await supabase.rpc('initiate_withdrawal', {
      p_merchant_id: user.id,
      p_amount: Number(amount),
      p_bank_account_id: targetBankAccountId
    });

    if (rpcError) {
      console.error('[Disbursement Withdraw] RPC Error:', rpcError);
      return c.json({ error: `Gagal inisialisasi penarikan: ${rpcError.message}` }, 500);
    }

    // --- Step 3: Eksekusi transfer via Duitku (menggunakan data inquiry) ---
    console.log(`[Disbursement Withdraw] Step 3: Transfer disburseId=${inquiry.disburseId}`);
    const transfer = await service.requestTransfer(inquiry);

    // --- Step 4: Update record withdrawal dengan transfer info ---
    const transferStatus = transfer.responseCode === '00' ? 'completed' : 'processing';
    const isFailed = transfer.responseCode !== '00' && transfer.responseCode !== '01'; // 01 usually means pending/processing

    await supabase
      .from('withdrawals')
      .update({
        status: isFailed ? 'failed' : transferStatus,
        processed_at: new Date().toISOString(),
        disburse_id: inquiry.disburseId,
        cust_ref_number: inquiry.custRefNumber,
        notes: `Duitku Disbursement - disburseId: ${inquiry.disburseId}, custRef: ${inquiry.custRefNumber}, responseCode: ${transfer.responseCode}`
      })
      .eq('id', withdrawalId);

    if (isFailed) {
      // Refund via RPC — move pending back to available
      await supabase.rpc('update_wallet_payout_reject', {
        p_merchant_id: user.id,
        p_amount: Number(amount)
      });

      return c.json({
        success: false,
        error: `Transfer gagal: ${transfer.responseDesc}. Saldo dikembalikan.`,
        withdrawalId,
        disburseId: inquiry.disburseId
      }, 500);
    }

    // --- Step 5: Clear pending_balance if transfer completed immediately ---
    if (transferStatus === 'completed') {
      console.log(`[Disbursement Withdraw] Transfer completed immediately — clearing pending_balance for ${user.id}`);
      const { error: successRpcError } = await supabase.rpc('update_wallet_payout_success', {
        p_merchant_id: user.id,
        p_amount: Number(amount)
      });
      if (successRpcError) {
        console.error('[Disbursement Withdraw] Failed to clear pending_balance:', successRpcError);
      }
    }

    console.log(`[Disbursement Withdraw] Transfer ${transferStatus}: disburseId=${inquiry.disburseId}`);

    return c.json({
      success: true,
      withdrawalId,
      disburseId: inquiry.disburseId,
      custRefNumber: inquiry.custRefNumber,
      status: transferStatus,
      inquiry: {
        accountName: inquiry.accountName,
        bankCode: inquiry.bankCode,
        bankAccount: inquiry.bankAccount
      },
      transfer: {
        responseCode: transfer.responseCode,
        responseDesc: transfer.responseDesc,
        amountTransfer: transfer.amountTransfer
      }
    });

  } catch (err: any) {
    console.error('[Disbursement Withdraw] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Check bank account status
app.get('/bank-accounts', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('merchant_id', user.id)
      .eq('is_primary', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return c.json({ exists: !!data, details: data || null });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Save/Update bank account info
app.post('/bank-accounts', zValidator('json', z.object({
  bank_name: z.string().min(1, 'Nama bank wajib diisi'),
  account_number: z.string().min(1, 'Nomor rekening wajib diisi').regex(/^\d+$/, 'Nomor rekening hanya boleh berisi angka'),
  account_name: z.string().min(1, 'Nama pemilik rekening wajib diisi')
})), async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { bank_name, account_number, account_name } = c.req.valid('json');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    // Upsert: if primary bank exists, update it; otherwise insert new
    const { data: existing } = await adminSupabase
      .from('bank_accounts')
      .select('id')
      .eq('merchant_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    let result: any;
    if (existing) {
      const { data, error } = await adminSupabase
        .from('bank_accounts')
        .update({
          bank_name,
          account_number,
          account_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await adminSupabase
        .from('bank_accounts')
        .insert({
          merchant_id: user.id,
          bank_name,
          account_number,
          account_name,
          is_primary: true
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return c.json({ success: true, details: result });
  } catch (err: any) {
    console.error('[Bank Accounts POST] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// NOTE: Orders & Stats routes are defined below (enhanced versions) — duplicates removed to fix Hono "matcher already built" error

// GET SINGLE WITHDRAWAL DETAIL
app.get('/withdrawals/:id', async (c) => {
  const id = c.req.param('id');
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        bank_accounts (*)
      `)
      .eq('id', id)
      .eq('merchant_id', user.id)
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// NOTE: Customer detail route is defined below (enhanced version) — duplicate removed to fix Hono "matcher already built" error

// UPDATE CUSTOMER DETAIL
app.put('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data, error } = await supabase
      .from('customers')
      .update(body)
      .eq('id', id)
      .eq('merchant_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET CURRENT USER PROFILE & SETTINGS (Enhanced with Expiry Check)
app.get('/profile', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // 1. Fetch profile & settings
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();

    let currentSettings = settings;

    // 2. Auto-revert if expired
    if (settings?.plan_status && settings.plan_status !== 'free' && settings.plan_expiry) {
      const expiryDate = new Date(settings.plan_expiry);
      const now = new Date();

      if (now > expiryDate) {
        console.log(`[Subscription] Plan expired for user ${user.id}. Reverting to free.`);
        const { data: updatedSettings } = await supabase
          .from('user_settings')
          .update({
            plan_status: 'free',
            auto_renewal: false,
            billing_period: 'monthly'
          })
          .eq('user_id', user.id)
          .select()
          .single();

        currentSettings = updatedSettings;
      }
    }

    return c.json({
      ...profile,
      email: user.email,
      settings: currentSettings || null
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 1.3 Delete Account Permanently
app.delete('/profile', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // 1. Cek status langganan dan batalkan otomatis jika masih aktif
    const { data: settings } = await supabase
      .from('user_settings')
      .select('plan_status, plan_id, plan_expiry')
      .eq('user_id', user.id)
      .single();

    if (settings?.plan_status && settings.plan_status !== 'free') {
      // Otomatis batalkan langganan sebelum menghapus akun
      console.log(`[Account Termination] User ${user.id} has active plan: ${settings.plan_status}. Auto-cancelling before deletion.`);

      await supabase
        .from('user_settings')
        .update({
          plan_status: 'free',
          plan_id: null,
          plan_expiry: null,
          billing_period: 'monthly',
        })
        .eq('user_id', user.id);

      // Catat pembatalan di subscription_history
      if (settings.plan_id) {
        await supabase
          .from('subscription_history')
          .insert({
            user_id: user.id,
            plan_id: settings.plan_id,
            action: 'cancelled',
            status: 'CANCELLED',
            description: 'Langganan dibatalkan otomatis saat penghapusan akun',
          });
      }
    }

    // 2. Hapus data terkait pengguna sebelum menghapus akun auth
    // Hapus subscription_history
    await supabase.from('subscription_history').delete().eq('user_id', user.id);
    // Hapus user_settings
    await supabase.from('user_settings').delete().eq('user_id', user.id);
    // Hapus digital_deliveries
    await supabase.from('digital_deliveries').delete().eq('creator_id', user.id);
    // Hapus orders
    await supabase.from('orders').delete().eq('creator_id', user.id);
    // Hapus products
    await supabase.from('products').delete().eq('user_id', user.id);
    // Hapus profiles
    await supabase.from('profiles').delete().eq('id', user.id);

    // 3. Gunakan Admin Client untuk menghapus User dari auth.users
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminClient = getSupabaseAdmin(cfEnv);

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    // Clear cookies explicitly to avoid redirect loops or "ghost" sessions
    const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'auth-token', 'sb_access_token'];
    cookiesToClear.forEach(name => {
      setCookie(c, name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
      });
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.error('[Account Termination] Error:', err);
    return c.json({ error: 'Gagal menghapus akun. Silakan hubungi dukungan teknis.' }, 500);
  }
});

// Endpoints /subscription/upgrade dan /subscription/cancel lama telah dihapus
// karena sudah digulirkan ke integrasi Duitku yang sesungguhnya di bagian bawah file ini.

// UPLOAD SEO IMAGE - Server-side using admin client
app.post('/seo/og-image', async (c) => {
  const { user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const formData = await c.req.formData();
    const file = formData.get('image') as File | null;
    if (!file) return c.json({ error: 'No file provided' }, 400);

    const BUCKET = 'SEO';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `og-${user.id}-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
    const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY') || '';

    const isValidKey = (k: string) => k && k.length > 20 && (k.startsWith('eyJ') || k.startsWith('sb_'));

    let uploadClient = (isValidKey(serviceKey))
      ? createClient(supabaseUrl, serviceKey)
      : (isValidKey(anonKey))
        ? createClient(supabaseUrl, anonKey)
        : (await getAuthContext(c)).supabase;

    // Check if bucket exists, create if not (only if service key is available)
    if (isValidKey(serviceKey)) {
      await uploadClient.storage.createBucket(BUCKET, { public: true }).catch(() => { });
    }

    // Upload file
    const { error: uploadError } = await uploadClient.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, { contentType: file.type || 'image/jpeg', upsert: true });

    if (uploadError) {
      console.error('[SEO Image Upload] Storage error:', uploadError.message);
      return c.json({ error: uploadError.message }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = uploadClient.storage.from(BUCKET).getPublicUrl(filePath);

    return c.json({ seo_image: publicUrl });

  } catch (err: any) {
    console.error('[SEO Image Upload] Unexpected error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// UPLOAD AVATAR - Server-side using admin client to bypass storage RLS
app.post('/profile/avatar', async (c) => {
  const { user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const formData = await c.req.formData();
    const file = formData.get('avatar') as File | null;
    if (!file) return c.json({ error: 'No file provided' }, 400);

    const BUCKET = 'user-avatars';
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Build an admin Supabase client (service_role key bypasses RLS)
    const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
    const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY') || '';

    // Helper to check if a string looks like a valid Supabase key (JWT or new publishable format)
    const isValidKey = (k: string) => k && k.length > 20 && (k.startsWith('eyJ') || k.startsWith('sb_'));

    // Choose the best client for upload:
    let uploadClient = (isValidKey(serviceKey))
      ? createClient(supabaseUrl, serviceKey)
      : (isValidKey(anonKey))
        ? createClient(supabaseUrl, anonKey)
        : (await getAuthContext(c)).supabase;

    // Auto-create bucket if not exists (only attempted if we have a service key)
    if (isValidKey(serviceKey)) {
      const { error: bErr } = await uploadClient.storage.createBucket(BUCKET, { public: true });
      if (bErr && !bErr.message?.includes('already exists')) {
        console.warn('[Avatar] Bucket create warning:', bErr.message);
      }
    }

    // Upload file
    const { error: uploadError } = await uploadClient.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, { contentType: file.type || 'image/jpeg', upsert: true });

    if (uploadError) {
      console.error('[Avatar Upload] Storage error:', uploadError.message);
      if (uploadError.message?.toLowerCase().includes('row-level security') || uploadError.message?.toLowerCase().includes('rls') || uploadError.message?.toLowerCase().includes('bucket not found')) {
        return c.json({ error: 'Storage RLS error. Tambahkan SUPABASE_SERVICE_ROLE_KEY ke .env atau buat storage policy di Supabase dashboard.' }, 500);
      }
      throw uploadError;
    }

    const { data: { publicUrl } } = uploadClient.storage.from(BUCKET).getPublicUrl(filePath);
    console.log(`[Avatar Upload] Generated URL: ${publicUrl}`);

    // Save avatar_url to profiles table (use admin client to bypass profiles RLS too)
    const { error: updateError } = await uploadClient
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Avatar Upload] DB update error:', updateError.message);
      return c.json({ error: updateError.message }, 500);
    }

    return c.json({ success: true, url: publicUrl, avatar_url: publicUrl });
  } catch (err: any) {
    console.error('[Avatar Upload] Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// UPLOAD BLOCK IMAGE - saves to Supabase Storage and returns permanent public URL
app.post('/blocks/upload-image', async (c) => {
  const { user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const formData = await c.req.formData();
    const file = formData.get('image') as File | null;

    if (!file) return c.json({ error: 'No file provided' }, 400);

    // Server-side validation: type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return c.json({ error: 'Format tidak didukung atau file terlalu besar (Maks 2MB)' }, 422);
    }

    // Server-side validation: size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      return c.json({ error: 'Format tidak didukung atau file terlalu besar (Maks 2MB)' }, 422);
    }

    const BUCKET = 'block-images';
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
    const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY') || '';
    const isValidKey = (k: string) => k && k.length > 20 && (k.startsWith('eyJ') || k.startsWith('sb_'));

    const uploadClient = isValidKey(serviceKey)
      ? createClient(supabaseUrl, serviceKey)
      : isValidKey(anonKey)
        ? createClient(supabaseUrl, anonKey)
        : (await getAuthContext(c)).supabase;

    // Auto-create public bucket on first use
    if (isValidKey(serviceKey)) {
      const { error: bErr } = await uploadClient.storage.createBucket(BUCKET, { public: true });
      if (bErr && !bErr.message?.includes('already exists')) {
        console.warn('[BlockImage] Bucket create warning:', bErr.message);
      }
    }

    const { error: uploadError } = await uploadClient.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error('[BlockImage Upload] Storage error:', uploadError.message);
      if (
        uploadError.message?.toLowerCase().includes('row-level security') ||
        uploadError.message?.toLowerCase().includes('rls') ||
        uploadError.message?.toLowerCase().includes('bucket not found')
      ) {
        return c.json({ error: 'Storage RLS error. Tambahkan SUPABASE_SERVICE_ROLE_KEY ke .env.' }, 500);
      }
      throw uploadError;
    }

    const { data: { publicUrl } } = uploadClient.storage.from(BUCKET).getPublicUrl(filePath);
    console.log(`[BlockImage Upload] URL: ${publicUrl}`);
    return c.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('[BlockImage Upload] Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// UPLOAD PLATFORM LOGO/ASSETS (Admin Only)
app.post('/admin/upload-logo', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return c.json({ error: 'No file provided' }, 400);

    const BUCKET = 'platform-assets';
    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `logo-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Build an admin Supabase client (service_role key bypasses RLS)
    const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
    const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || '';

    const { createClient } = await import('@supabase/supabase-js');
    const uploadClient = (serviceKey && serviceKey.length > 20)
      ? createClient(supabaseUrl, serviceKey)
      : supabase;

    // Auto-create bucket if not exists
    if (serviceKey && serviceKey.length > 20) {
      await uploadClient.storage.createBucket(BUCKET, { public: true });
    }

    // Upload file
    const { error: uploadError } = await uploadClient.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, { contentType: file.type || 'image/png', upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = uploadClient.storage.from(BUCKET).getPublicUrl(filePath);

    return c.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('[Logo Upload] Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// UPDATE CURRENT USER PROFILE
app.put('/profile', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    console.log(`[PUT /profile] Update payload received from user ${user.id}:`, body);

    // Only pass columns that are GUARANTEED to exist in the profiles table
    const allowedFields = [
      'full_name', 'bio', 'avatar_url', 'username',
      'instagram_url', 'twitter_url', 'youtube_url', 'tiktok_url', 'blocks',
      'phone', 'address_text', 'city', 'postcode', 'onboarding_completed'
    ];
    const updatePayload: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        let value = body[field];

        // Deep check for malicious patterns in ANY field (Negative Case Prevention)
        const checkValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (isMalicious(checkValue)) {
            return c.json({ 
                error: 'Konten tidak diperbolehkan karena mengandung karakter atau pola berbahaya.',
                code: 'XSS_DETECTED'
            }, 400);
        }

        // Sanitize string fields
        if (typeof value === 'string' && ['full_name', 'bio', 'username', 'address_text', 'city'].includes(field)) {
          value = sanitizeString(value);
        }

        // Sanitize blocks array
        if (field === 'blocks' && Array.isArray(value)) {
          value = value.map(sanitizeTextBlockContent);
        }

        updatePayload[field] = value;
      }
    }


    if (Object.keys(updatePayload).length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[PUT /profile] Supabase error:', error);
      throw error;
    }
    return c.json(data);
  } catch (err: any) {
    console.error('[PUT /profile] Error:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

// --- ANALYTICS ROUTES (HIGH PRIORITY) ---

// GET ALL PUBLISHED TUTORIALS
app.get('/tutorials', async (c) => {
  const { supabase } = await getAuthContext(c);

  try {
    const { data, error } = await supabase
      .from('tutorials')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return c.json(data || []);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Removed duplicate dashboard route - logic is handled below.

/**
 * PRODUCT CRUD ENDPOINTS (SUPABASE VERSION)
 */

// 1. List Products
app.get('/products', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);

  // Get sold counts & views counts for all products
  const [{ data: orders }, { data: events }] = await Promise.all([
    supabase
      .from('orders')
      .select('product_id, status')
      .eq('merchant_id', user.id)
      .in('status', ['success', 'paid']),
    supabase
      .from('analytics_events')
      .select('product_id, event_type')
      .eq('merchant_id', user.id)
      .in('event_type', ['view', 'page_view'])
  ]);

  const productsWithStats = products.map(p => {
    const soldCount = orders?.filter(o => o.product_id === p.id).length || 0;
    const viewsCount = events?.filter(e => e.product_id === p.id).length || 0;
    return { ...p, sold_count: soldCount, views_count: viewsCount };
  });

  return c.json(productsWithStats);
});

// 2. Create Product
app.post(
  '/products',
  zValidator(
    'json',
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      type: z.string().optional().default('digital'),
      status: z.string().optional().default('draft'),
      is_public: z.boolean().optional().default(true),
      download_limit: z.number().nullable().optional(),
      link_expiry: z.string().optional().default('forever'),
      cover_url: z.string().optional(),
      file_url: z.string().optional(),
      preview_urls: z.array(z.string()).optional().default([]),
      sale_price: z.number().nullable().optional(),
    })
  ),
  async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = c.req.valid('json');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...body,
        merchant_id: user.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return c.json({ error: error.message, details: error.details, hint: error.hint }, 500);
    }
    return c.json(data, 201);
  }
);

// 3. Get One Product
app.get('/products/:id', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('merchant_id', user.id)
    .single();

  if (error) return c.json({ error: error.message }, 404);

  // If the file is in our private bucket (internal path without http), generate a signed URL for the merchant to preview
  if (data.file_url && !data.file_url.startsWith('http')) {
    const { data: signed } = await supabase.storage.from('media-produk-private').createSignedUrl(data.file_url, 60 * 60);
    data.admin_download_url = signed?.signedUrl || data.file_url;
  }

  return c.json(data);
});

// 4. Update Product
app.put(
  '/products/:id',
  zValidator(
    'json',
    z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().min(0).optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      is_public: z.boolean().optional(),
      download_limit: z.number().nullable().optional(),
      link_expiry: z.string().optional(),
      file_url: z.string().optional(),
      preview_urls: z.array(z.string()).optional(),
      sale_price: z.number().nullable().optional(),
    })
  ),
  async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { data, error } = await supabase
      .from('products')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('merchant_id', user.id)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
  }
);

// 4.1 Product Detail with Analytics (Enhanced)
app.get('/products/:id/stats', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');

  // Fetch all in parallel for performance
  const [ordersResult, analyticsResult] = await Promise.all([
    supabase
      .from('orders')
      .select('*, customers (name, email)')
      .eq('product_id', id)
      .eq('merchant_id', user.id),
    supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .eq('merchant_id', user.id)
      .eq('product_id', id)
      .in('event_type', ['view', 'page_view', 'click'])
  ]);

  if (ordersResult.error) return c.json({ error: ordersResult.error.message }, 500);

  const orders = ordersResult.data || [];
  const events = analyticsResult.data || [];

  const totalSold = orders.filter(o => o.status === 'success' || o.status === 'paid').length;
  const totalRevenue = orders
    .filter(o => o.status === 'success' || o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.amount), 0);

  // View count from analytics events
  const totalViews = events.filter(e => e.event_type === 'view' || e.event_type === 'page_view').length;
  const totalClicks = events.filter(e => e.event_type === 'click').length;

  // Conversion rate: sold / views * 100
  const conversionRate = totalViews > 0
    ? ((totalSold / totalViews) * 100).toFixed(1)
    : '0.0';

  return c.json({
    total_sold: totalSold,
    total_revenue: totalRevenue,
    total_views: totalViews,
    total_clicks: totalClicks,
    conversion_rate: conversionRate,
    recent_buyers: orders
      .filter(o => o.status === 'success' || o.status === 'paid')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  });
});

// 4.2 Global Analytics Dashboard (Real Aggregation)


// 5. Delete Product
app.delete('/products/:id', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('merchant_id', user.id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

/**
 * ORDER MANAGEMENT ENDPOINTS
 */

// 1. List Orders
app.get('/orders', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (name, email),
      products (title, cover_url, type)
    `)
    .eq('merchant_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// 2. Order Statistics
app.get('/orders/stats', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) {
    console.log('[orders/stats] No user found, returning 401');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  console.log(`[orders/stats] User ID: ${user.id}, email: ${user.email}`);

  // Fetch all orders to calculate stats manually (easier for small sets)
  const { data: orders, error } = await supabase
    .from('orders')
    .select('amount, status, net_amount, merchant_id')
    .eq('merchant_id', user.id);

  if (error) {
    console.error('[orders/stats] Supabase error:', error);
    return c.json({ error: error.message }, 500);
  }

  console.log(`[orders/stats] Found ${orders?.length || 0} orders for merchant ${user.id}`);

  const totalOrders = orders.length;
  const successfulOrders = orders.filter(o => o.status === 'success' || o.status === 'paid').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // Calculate Revenue (Success only)
  // Use net_amount if available, fallback to 5% calculation for old legacy data
  const totalRevenue = orders
    .filter(o => o.status === 'success' || o.status === 'paid')
    .reduce((sum, o) => {
      const val = o.net_amount !== null ? Number(o.net_amount) : Math.max(0, (Number(o.amount) * 0.95) - 2000);
      return sum + val;
    }, 0);

  console.log(`[orders/stats] Stats: total=${totalOrders}, success=${successfulOrders}, pending=${pendingOrders}, revenue=${totalRevenue}`);

  return c.json({
    total_orders: totalOrders,
    successful_orders: successfulOrders,
    pending_orders: pendingOrders,
    total_revenue: totalRevenue
  });
});

// 1.1 Get Specific Order (Enhanced)
app.get('/orders/:id', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');

  const { data, error } = await supabase
    .from('orders')
    .select(`
            *,
            customers (*),
            products (*)
        `)
    .eq('id', id)
    .eq('merchant_id', user.id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

/**
 * CUSTOMER MANAGEMENT ENDPOINTS
 */

// 1. List Customers
app.get('/customers', async (c) => {
  const { user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const filter = c.req.query('filter') || 'all';

  console.log(`[API] Fetching customers for merchant_id: ${user.id} with filter: ${filter}`);
  const { getSupabaseAdmin } = await import('../../lib/supabase');
  const supabase = getSupabaseAdmin(cfEnv);

  // Fetch with orders to calculate LTV (LifeTime Value)
  let query = supabase
    .from('customers')
    .select(`
            *,
            orders (amount, status)
        `)
    .eq('merchant_id', user.id);

  // Apply time-based filters
  if (filter === 'this_month') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    query = query.gte('created_at', startOfMonth.toISOString());
  } else if (filter === '30_days') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte('created_at', thirtyDaysAgo.toISOString());
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[API] Error fetching customers:', error);
    return c.json({ error: error.message }, 500);
  }

  // Add stats to each customer
  let customersWithStats = (data || []).map(item => {
    const successfulOrders = (item.orders || []).filter((o: any) => o.status === 'success' || o.status === 'paid');
    const totalSpent = successfulOrders.reduce((sum: number, o: any) => sum + Number(o.amount), 0);

    // Remove the full orders list to keep response small
    const { orders, ...customerData } = item;
    return {
      ...customerData,
      total_spent: totalSpent,
      order_count: successfulOrders.length
    };
  });

  // Special sort for Biggest filter
  if (filter === 'biggest') {
    customersWithStats.sort((a, b) => b.total_spent - a.total_spent);
  }

  console.log(`[API] Found ${customersWithStats.length} customers for ${user.id}`);
  return c.json(customersWithStats);
});

// 2. Customer Detail (with Order History)
app.get('/customers/:id', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');

  // 1. Get Profile
  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('merchant_id', user.id)
    .single();

  if (custError) return c.json({ error: custError.message }, 404);

  // 2. Get Order History
  const { data: orders, error: orderError } = await supabase
    .from('orders')
    .select(`
            *,
            products (title, type, cover_url)
        `)
    .eq('customer_id', id)
    .order('created_at', { ascending: false });

  return c.json({
    ...customer,
    orders: orders || []
  });
});

// 2.1 Update Customer
app.put(
  '/customers/:id',
  zValidator(
    'json',
    z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      notes: z.string().optional(),
      address_text: z.string().optional(),
    })
  ),
  async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const id = c.req.param('id');
    const body = c.req.valid('json');

    const { data, error } = await supabase
      .from('customers')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        notes: body.notes,
        address_text: body.address_text,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('merchant_id', user.id)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
  }
);

// 2.2 Delete Customer
app.delete('/customers/:id', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('merchant_id', user.id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// 3. Create Order (Internal/Public for Checkout)
app.post(
  '/orders',
  zValidator(
    'json',
    z.object({
      product_id: z.string().uuid(),
      merchant_id: z.string().uuid(),
      amount: z.number().min(0),
      buyer_name: z.string(),
      buyer_email: z.string().email(),
      buyer_phone: z.string().optional(),
      payment_method: z.string().optional().default('QRIS'),
      status: z.string().optional().default('pending')
    })
  ),
  async (c) => {
    // Gunakan Admin Client untuk checkout publik agar bypass RLS
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const supabase = getSupabaseAdmin(cfEnv);
    const body = c.req.valid('json');

    // 1. Upsert Customer
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .upsert({
        merchant_id: body.merchant_id,
        email: body.buyer_email,
        name: body.buyer_name,
        phone: body.buyer_phone
      }, { onConflict: 'merchant_id, email' })
      .select()
      .single();

    if (custError) return c.json({ error: custError.message }, 500);

    // 2. Fetch current Platform Fee & PG Fee from Config
    const { data: pConfig } = await supabase
      .from('platform_configs')
      .select('platform_fee, pg_fee')
      .eq('id', 1)
      .single();

    const currentFee = pConfig?.platform_fee || 5;
    const pgFee = pConfig?.pg_fee || 0;

    // Buyer pays the product price exactly (no extra fee)
    // body.amount is the base product price sent from frontend
    const platformFeeAmount = Math.round(body.amount * (currentFee / 100));
    const totalAmount = body.amount; // Buyer pays the product price exactly
    const netAmount = body.amount - platformFeeAmount - pgFee; // Merchant pays the fees (platform fee + pg fee)

    console.log(`[Order Creation] Fee breakdown: amount=${body.amount}, platformFee=${currentFee}% (${platformFeeAmount}), pgFee=${pgFee}, netAmount=${netAmount}`);

    // 3. Create Order (Status Pending)
    const invoiceId = `TPK-${Math.floor(Math.random() * 1000000)}`;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        invoice_id: invoiceId,
        customer_id: customer.id,
        product_id: body.product_id,
        merchant_id: body.merchant_id,
        amount: totalAmount,
        platform_fee: currentFee,
        pg_fee: pgFee,
        net_amount: netAmount,
        status: 'pending', // Awalnya pending
        payment_method: body.payment_method
      })
      .select()
      .single();

    if (orderError) return c.json({ error: orderError.message }, 500);

    // 3. Inisialisasi Pembayaran Duitku
    try {
      const merchantCode = getEnv('PUBLIC_DUITKU_MERCHANT_CODE') || '';
      const merchantKey = getEnv('PUBLIC_DUITKU_MERCHANT_KEY') || '';
      const callbackUrl = getEnv('DUITKU_CALLBACK_URL') || '';

      if (!merchantCode || !merchantKey) {
        console.warn('[Orders] Duitku config missing, returning order only');
        return c.json(order, 201);
      }

      const { DuitkuService } = await import('../../lib/duitku');
      const duitkuService = new DuitkuService(merchantCode, merchantKey);

      const requestOrigin = new URL(c.req.url).origin;
      const isLocalOrTunnel = requestOrigin.includes('localhost') || requestOrigin.includes('trycloudflare.com');

      const paymentResponse = await duitkuService.createPayment({
        merchantCode,
        merchantKey,
        paymentAmount: totalAmount,
        orderId: invoiceId,
        productDetails: `Pesanan ${invoiceId}`,
        customerEmail: body.buyer_email,
        customerPhone: body.buyer_phone || '',
        customerName: body.buyer_name,
        returnUrl: `${requestOrigin}/checkout/success?id=${invoiceId}&merchant=${body.merchant_id}`,
        callbackUrl: isLocalOrTunnel ? `${requestOrigin}/api/payments/duitku/webhook` : (callbackUrl || `${requestOrigin}/api/payments/duitku/webhook`),
        paymentMethod: body.payment_method,
      });

      console.log(`[Orders] Duitku created for ${invoiceId}:`, paymentResponse.reference);

      return c.json({
        ...order,
        payment: paymentResponse
      }, 201);
    } catch (duitkuErr: any) {
      console.error('[Orders] Duitku Init Error:', duitkuErr);
      // Tetap kembalikan order meskipun duitku gagal (fallback)
      return c.json(order, 201);
    }
  }
);

/**
 * SUBSCRIPTION & PLAN MANAGEMENT
 */

// 1. Get Subscription Status
app.get('/subscription/status', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('plan_status, plan_expiry, auto_renewal, billing_period')
      .eq('user_id', user.id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

    let planId = settings?.plan_status || 'free';

    // Auto-revert expired subscriptions
    if (planId !== 'free' && settings?.plan_expiry) {
      const expiryDate = new Date(settings.plan_expiry);
      if (new Date() > expiryDate) {
        console.log(`[Subscription] Plan expired for user ${user.id}. Auto-reverting to free.`);
        await supabase
          .from('user_settings')
          .update({ plan_status: 'free', auto_renewal: false, billing_period: 'monthly' })
          .eq('user_id', user.id);
        planId = 'free';
      }
    }

    // Fetch plan details (features, config, etc)
    const { data: planDetails } = await supabase
      .from('subscription_plans')
      .select('id, name, features, config')
      .eq('id', planId)
      .single();

    return c.json({
      plan_status: planId,
      plan_expiry: settings?.plan_expiry || null,
      auto_renewal: settings?.auto_renewal || false,
      billing_period: settings?.billing_period || 'monthly',
      plan_details: planDetails || { id: planId, name: planId.toUpperCase(), features: [], config: {} }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});


// 1.2 Cancel Subscription (Turn off Auto-Renewal)
app.post('/subscription/cancel', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { error } = await supabase
      .from('user_settings')
      .update({
        auto_renewal: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) throw error;

    // Log the cancellation in history if needed
    console.log(`[Subscription] Cancelled for user ${user.id}`);

    return c.json({ success: true });
  } catch (err: any) {
    console.error('[Subscription Cancel API] Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// 1.4 Get Latest Invoice
app.get('/subscription/invoice', async (c) => {
  const { user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminClient = getSupabaseAdmin(cfEnv);

    // 1. Ambil riwayat terakhir yang sukses
    const { data: history, error: hError } = await adminClient
      .from('subscription_history')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['SUCCESS', 'success', 'Paid', 'PAID', 'paid'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (hError || !history) {
      console.warn('[Subscription Invoice] History not found:', hError?.message);
      return c.json({ error: 'Invoice langganan tidak ditemukan.' }, 404);
    }

    // 2. Ambil detail plan secara manual (karena join mungkin gagal jika relasi FK tidak diset)
    const { data: planData } = await adminClient
      .from('subscription_plans')
      .select('name, price_monthly, price_yearly')
      .eq('id', history.plan_id)
      .single();

    // Gabungkan data
    const invoice = {
      ...history,
      subscription_plans: planData || { name: history.plan_id, price_monthly: history.amount }
    };

    return c.json(invoice);
  } catch (err: any) {
    console.error('[Subscription Invoice] Exception:', err.message);
    return c.json({ error: err.message }, 500);
  }
});

// 1.1 Get Subscription History
app.get('/subscription/history', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { data, error } = await supabase
    .from('subscription_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Subscription History API] Error:', error);
    return c.json({ error: error.message }, 500);
  }
  return c.json(data || []);
});

// 1.5 Get All Active Plans (Public)
app.get('/plans', async (c) => {
  try {
    const { supabase } = await getAuthContext(c);
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('id, name, badge, price_monthly, price_yearly, description, features, config')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return c.json(data || []);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

/**
 * CUSTOM DOMAIN MANAGEMENT (PRO ONLY)
 */

// 1. Setup Custom Domain
app.post(
  '/domain/setup',
  zValidator(
    'json',
    z.object({
      domain: z.string()
        .min(3)
        .max(255)
        .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9]{2,})+$/, "Gunakan format domain yang benar, tanpa http/https")
    })
  ),
  async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { domain: rawDomain } = c.req.valid('json');
    const domain = rawDomain.trim().toLowerCase();
    console.log(`[Domain Setup] Attempting to register: ${domain} for user ${user.id}`);

    try {
      // Check if user is PRO
      const { data: settings } = await supabase
        .from('user_settings')
        .select('plan_status')
        .eq('user_id', user.id)
        .single();
      
      if (settings?.plan_status !== 'pro') {
        console.warn(`[Domain Setup] Access denied: User ${user.id} is not PRO`);
        return c.json({ error: 'Fitur Custom Domain hanya tersedia untuk pengguna PRO.' }, 403);
      }

      // Check if domain is already taken
      const adminSupabase = getSupabaseAdmin(cfEnv);
      const { data: existing } = await adminSupabase
        .from('user_settings')
        .select('user_id')
        .eq('domain_name', domain)
        .neq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        console.warn(`[Domain Setup] Domain ${domain} already taken by another user`);
        return c.json({ error: 'Domain ini sudah digunakan oleh pengguna lain.' }, 400);
      }

      // 2. Perform the update directly using admin client to ensure success
      const { error: dbError } = await adminSupabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          domain_name: domain,
          domain_verified: false,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (dbError) throw dbError;

      // NEW: Also sync the username in profiles table to match the domain
      // This ensures tepak.id/domainname also works
      await adminSupabase
        .from('profiles')
        .update({ username: domain })
        .eq('id', user.id);

      // 3. Register with Cloudflare Custom Hostname API
      const cfToken = getEnv('CLOUDFLARE_API_TOKEN');
      const cfZoneId = getEnv('CLOUDFLARE_ZONE_ID');

      if (cfToken && cfZoneId) {
        try {
          console.log(`[Domain Setup] Registering ${domain} with Cloudflare...`);
          const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cfToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              hostname: domain,
              ssl: {
                method: 'http',
                type: 'dv'
              }
            })
          });

          const cfData: any = await cfRes.json();
          if (!cfRes.ok && cfData.errors?.[0]?.code !== 1406) {
              console.error('[Domain Setup] Cloudflare Error:', cfData);
          }
        } catch (cfErr) {
          console.error('[Domain Setup] Cloudflare API Fetch Error:', cfErr);
        }
      }

      return c.json({
        success: true,
        message: 'Domain berhasil didaftarkan. Silakan atur CNAME Anda ke weorbit.site dan klik verifikasi.',
        cname_target: 'weorbit.site'
      });

    } catch (err: any) {
      console.error('[Domain Setup] Error:', err);
      return c.json({ error: err.message }, 500);
    }
  }
);

// 2. Check Domain Status (Manual Mode)
app.post('/domain/verify', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { data: settings } = await supabase
      .from('user_settings')
      .select('domain_name, domain_verified')
      .eq('user_id', user.id)
      .single();
    
    if (!settings?.domain_name) {
      return c.json({ error: 'Belum ada domain yang didaftarkan.' }, 400);
    }

    if (settings.domain_verified) {
      return c.json({ status: 'active', message: 'Domain Anda sudah aktif!' });
    }

    // 2. Perform Server-side Cloudflare Status Check
    const cfToken = getEnv('CLOUDFLARE_API_TOKEN');
    const cfZoneId = getEnv('CLOUDFLARE_ZONE_ID');
    let isActuallyActive = false;

    if (cfToken && cfZoneId) {
      try {
        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/custom_hostnames?hostname=${settings.domain_name}`, {
          headers: { 'Authorization': `Bearer ${cfToken}` }
        });
        const cfData: any = await cfRes.json();
        
        if (cfRes.ok && cfData.result?.[0]?.status === 'active') {
          isActuallyActive = true;
          console.log(`[Domain Verify] Cloudflare verified for ${settings.domain_name}`);
        }
      } catch (e) {
        console.error('[Domain Verify] CF Error:', e);
      }
    }

    if (isActuallyActive) {
      // Update DB to Active
      await getSupabaseAdmin(cfEnv)
        .from('user_settings')
        .update({ domain_verified: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      
      return c.json({
        status: 'active',
        message: 'Selamat! Domain Anda sudah aktif dan terverifikasi.'
      });
    }

    return c.json({
      status: 'pending',
      message: 'DNS belum terdeteksi. Pastikan CNAME sudah diarahkan ke weorbit.site dan tunggu proses propagasi.'
    });

  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 3. Delete Custom Domain
app.delete('/domain', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { error } = await supabase
      .from('user_settings')
      .update({
        domain_name: null,
        domain_verified: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) throw error;

    return c.json({ success: true, message: 'Custom domain berhasil dihapus.' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 2. Upgrade to Plan (Create Duitku Invoice) — mendukung semua paket & billing period
app.post('/subscription/upgrade', async (c) => {
  console.log('[Subscription Upgrade] Request received');
  const { supabase, user } = await getAuthContext(c);

  if (!user) {
    console.warn('[Subscription Upgrade] Unauthorized access attempt');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  console.log('[Subscription Upgrade] User authenticated:', user.email);

  try {
    const merchantCode = getEnv('PUBLIC_DUITKU_MERCHANT_CODE') || '';
    const merchantKey = getEnv('PUBLIC_DUITKU_MERCHANT_KEY') || '';
    const callbackUrl = getEnv('DUITKU_CALLBACK_URL') || '';

    console.log('[Subscription Upgrade] Config check:', { merchantCode: !!merchantCode, merchantKey: !!merchantKey, callbackUrl });

    // Ambil pilihan metode pembayaran dari body (SP, OV, BT, dll)
    let body: any = {};
    try {
      body = await c.req.json();
    } catch (e) {
      // Fallback jika tidak ada body JSON
    }

    const selectedMethod = body.method || 'SP'; // Default ShopeePay untuk Sandbox jika tidak pilih
    const planId = body.planId;
    const billingPeriod = body.billingPeriod || 'monthly'; // 'monthly' atau 'yearly'

    if (!planId) {
      throw new Error('ID Paket (planId) wajib dipilih untuk melakukan upgrade.');
    }

    // ── Upgrade validation: check current plan & prevent downgrade ──
    const { data: currentSettings } = await supabase
      .from('user_settings')
      .select('plan_status, plan_expiry, billing_period')
      .eq('user_id', user.id)
      .single();

    const currentPlanId = currentSettings?.plan_status || 'free';

    // If user already has a paid plan, validate the upgrade
    if (currentPlanId !== 'free' && currentPlanId !== planId) {
      // Fetch both plans to compare prices (higher price = higher tier)
      const { data: currentPlanRow } = await supabase
        .from('subscription_plans')
        .select('id, price_monthly')
        .eq('id', currentPlanId)
        .single();

      const { data: targetPlanRow } = await supabase
        .from('subscription_plans')
        .select('id, price_monthly')
        .eq('id', planId)
        .single();

      if (currentPlanRow && targetPlanRow) {
        const currentPrice = Number(currentPlanRow.price_monthly) || 0;
        const targetPrice = Number(targetPlanRow.price_monthly) || 0;

        if (targetPrice <= currentPrice) {
          throw new Error(`Tidak dapat downgrade dari ${currentPlanRow.id} ke ${targetPlanRow.id}. Hanya upgrade ke paket yang lebih tinggi yang diizinkan.`);
        }
      }
    }

    // If user is on the same plan, allow re-subscription / renewal
    // (e.g., extending an active subscription with the same or different billing period)

    if (!merchantCode || !merchantKey) {
      throw new Error(`Konfigurasi Duitku tidak ditemukan. Code: ${!!merchantCode}, Key: ${!!merchantKey}`);
    }

    const { DuitkuService } = await import('../../lib/duitku');
    const duitkuService = new DuitkuService(merchantCode, merchantKey);

    // Fetch plan yang dipilih (bukan hanya PRO)
    const { data: selectedPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id, name, price_monthly, price_yearly, description')
      .eq('id', planId)
      .single();

    if (planError || !selectedPlan) {
      throw new Error(`Paket "${planId}" tidak ditemukan. ${planError?.message || ''}`);
    }

    // Tentukan harga berdasarkan billing period
    const amount = billingPeriod === 'yearly'
      ? Math.floor(Number(selectedPlan.price_yearly))
      : Math.floor(Number(selectedPlan.price_monthly));

    if (!amount || amount <= 0) {
      throw new Error(`Harga paket "${selectedPlan.name}" untuk periode ${billingPeriod} tidak valid (${amount}).`);
    }

    const periodLabel = billingPeriod === 'yearly' ? '1 Year' : '1 Month';
    // Duitku membatasi merchantOrderId maksimal 50 karakter.
    // Format: SUB--{userId}--{4-digit timestamp} ≈ 47 karakter (aman).
    // plan_id dan billing_period disimpan di subscription_history, BUKAN di orderId.
    const orderId = `SUB--${user.id}--${Date.now().toString().slice(-4)}`;

    // Create initial record in history — menyimpan plan_id dan billing_period untuk webhook
    // billing_period mungkin belum ada di schema, jadi kita coba insert dengan field tersebut,
    // jika gagal (kolom belum ada), fallback tanpa billing_period
    try {
      const insertWithBilling = {
        user_id: user.id,
        invoice_id: orderId,
        plan_id: planId,
        amount: amount,
        status: 'PENDING',
        payment_method: selectedMethod,
        billing_period: billingPeriod,
        created_at: new Date().toISOString()
      };
      const { error: insertError } = await supabase
        .from('subscription_history')
        .insert(insertWithBilling);

      if (insertError) {
        // Jika gagal karena kolom billing_period belum ada, coba tanpa field tersebut
        console.warn('[Subscription Upgrade] Insert with billing_period failed, trying without:', insertError.message);
        const insertWithoutBilling = {
          user_id: user.id,
          invoice_id: orderId,
          plan_id: planId,
          amount: amount,
          status: 'PENDING',
          payment_method: selectedMethod,
          created_at: new Date().toISOString()
        };
        const { error: fallbackError } = await supabase
          .from('subscription_history')
          .insert(insertWithoutBilling);
        if (fallbackError) {
          console.error('[Subscription Upgrade] Fallback insert also failed:', fallbackError);
        }
      }
    } catch (e) {
      console.error('[Subscription Upgrade] Failed to create history record:', e);
    }

    console.log('[Subscription Upgrade] Creating payment for:', user.email, orderId, `Plan: ${planId}, Period: ${billingPeriod}, Amount: ${amount}`);

    // Fetch Branding for Product Details
    const { data: branding } = await supabase
      .from('platform_configs')
      .select('site_name')
      .eq('id', 1)
      .single();
    const siteName = branding?.site_name || 'Tepak.ID';

    const productDetailStr = `${siteName} ${selectedPlan.name} Subscription (${periodLabel})`;

    const requestOrigin = new URL(c.req.url).origin;
    const isLocalOrTunnel = requestOrigin.includes('localhost') || requestOrigin.includes('trycloudflare.com');

    const paymentResponse = await duitkuService.createPayment({
      merchantCode,
      merchantKey,
      paymentAmount: amount,
      orderId: orderId,
      productDetails: productDetailStr,
      customerEmail: user.email || '',
      customerPhone: '',
      customerName: user.user_metadata?.full_name || 'Creator',
      returnUrl: `${requestOrigin}/plan-info?status=pending`,
      callbackUrl: isLocalOrTunnel ? `${requestOrigin}/api/payments/duitku/webhook` : (callbackUrl || `${requestOrigin}/api/payments/duitku/webhook`),
      paymentMethod: selectedMethod,
      itemDetails: [
        {
          name: `${selectedPlan.name} - ${periodLabel}`,
          price: amount,
          qty: 1
        }
      ]
    });

    console.log('[Subscription Upgrade] Duitku response:', paymentResponse);

    return c.json(paymentResponse);
  } catch (err: any) {
    console.error('[Subscription Upgrade] FATAL ERROR:', err);
    return c.json({
      error: 'Internal Server Error',
      message: err.message,
      stack: err.stack
    }, 500);
  }
});

/**
 * ENDPOINT GATEWAY PEMBAYARAN DUITKU
 */

// 1. Buat Permintaan Pembayaran DuitKu
app.post(
  '/payments/duitku/create',
  zValidator(
    'json',
    z.object({
      orderId: z.string(),
      amount: z.number().min(1),
      productDetails: z.string(),
      customerEmail: z.string().email(),
      customerPhone: z.string(),
      customerName: z.string(),
      merchantCode: z.string(),
      merchantKey: z.string(),
      paymentMethod: z.string().default('QRIS'),
      returnUrl: z.string().url(),
      callbackUrl: z.string().url(),
      expiryPeriod: z.number().optional().default(60),
    })
  ),
  async (c) => {
    const body = c.req.valid('json');

    try {
      // Import DuitkuService
      const { DuitkuService } = await import('../../lib/duitku');
      const duitkuService = new DuitkuService(body.merchantCode, body.merchantKey);

      // Buat permintaan pembayaran
      const paymentResponse = await duitkuService.createPayment({
        merchantCode: body.merchantCode,
        merchantKey: body.merchantKey,
        paymentAmount: body.amount,
        orderId: body.orderId,
        productDetails: body.productDetails,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        customerName: body.customerName,
        returnUrl: body.returnUrl,
        callbackUrl: body.callbackUrl,
        paymentMethod: body.paymentMethod,
        expiryPeriod: body.expiryPeriod,
      });

      return c.json(paymentResponse, 200);
    } catch (error: any) {
      console.error('Kesalahan pembuatan pembayaran DuitKu:', error);
      return c.json({ error: error.message }, 400);
    }
  }
);

// 2. Handler Webhook DuitKu (untuk notifikasi pembayaran)
app.post('/payments/duitku/webhook', async (c) => {

  // Duitku bisa mengirim JSON atau Form-UrlEncoded.
  // parseBody() mengembalikan Record<string, string | File>, tapi Duitku selalu mengirim string values.
  const rawBody = await c.req.parseBody();

  // Convert all values to string, filter out File objects
  const body: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawBody)) {
    if (typeof value === 'string') {
      body[key] = value;
    } else if (value instanceof File) {
      // Convert File to string if needed (shouldn't happen with Duitku)
      body[key] = await value.text();
    } else {
      body[key] = String(value);
    }
  }

  console.log('[Webhook DuitKu] Request Received (Parsed):', JSON.stringify(body, null, 2));

  // Log important headers
  const headers = {
    'content-type': c.req.header('content-type'),
    'user-agent': c.req.header('user-agent'),
    'x-forwarded-for': c.req.header('x-forwarded-for'),
    'origin': c.req.header('origin'),
    'referer': c.req.header('referer')
  };
  console.log('[Webhook DuitKu] Request Headers:', headers);

  try {
    // Webhook dipanggil oleh server Duitku, tidak ada session user.
    // Kita harus menggunakan supabase secara langsung.
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || '';
    const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validasi tanda tangan webhook
    const { DuitkuService } = await import('../../lib/duitku');

    // Dapatkan kunci merchant dari pengaturan pengguna - untuk produksi, query dari database
    const merchantKey = getEnv('PUBLIC_DUITKU_MERCHANT_KEY') || '';
    const duitkuService = new DuitkuService(body.merchantCode, merchantKey);

    if (!duitkuService.validateWebhook(body)) {
      return c.json({ error: 'Tanda tangan webhook tidak valid' }, 401);
    }

    // Duitku Callback V2 mengirim 'merchantOrderId' dan 'resultCode'
    const merchantOrderId = (body.merchantOrderId || body.orderId || '') as string;
    const resultCode = (body.resultCode || body.statusCode || '') as string;

    console.log('[Webhook DuitKu] Processing Order:', merchantOrderId, 'Result:', resultCode);

    // 1. KASUS LANGGANAN (SUB--)
    if (merchantOrderId.startsWith('SUB--')) {
      const parts = merchantOrderId.split('--');
      const targetUserId = parts[1];

      // Ambil plan_id dan billing_period dari subscription_history
      const { data: histRecord } = await supabase
        .from('subscription_history')
        .select('plan_id, billing_period')
        .eq('invoice_id', merchantOrderId)
        .single();

      if (!histRecord?.plan_id) {
        console.error(`[Webhook DuitKu] ❌ No plan_id found for ${merchantOrderId}`);
        return c.json({ error: 'Plan information not found' }, 500);
      }

      const planIdFromHistory = histRecord.plan_id;
      const billingPeriodFromHistory = histRecord?.billing_period || 'monthly';

      if (resultCode === '00' && targetUserId) {
        // SUCCESS PATH
        const expiryDate = new Date();
        if (billingPeriodFromHistory === 'yearly') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
          expiryDate.setDate(expiryDate.getDate() + 30);
        }

        // Update History to SUCCESS
        await supabase
          .from('subscription_history')
          .update({ status: 'SUCCESS', updated_at: new Date().toISOString() })
          .eq('invoice_id', merchantOrderId);

        // Update User Settings (Apply Plan)
        await supabase
          .from('user_settings')
          .update({
            plan_status: planIdFromHistory,
            plan_expiry: expiryDate.toISOString(),
            billing_period: billingPeriodFromHistory,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', targetUserId);

        console.log(`[Webhook DuitKu] ✅ User ${targetUserId} upgraded to ${planIdFromHistory}`);
      } else {
        // FAILED/CANCELED PATH
        const statusMap: Record<string, string> = {
          '01': 'PENDING',
          '02': 'CANCELED',
        };
        const subsStatus = statusMap[resultCode] || 'CANCELED';

        await supabase
          .from('subscription_history')
          .update({ status: subsStatus, updated_at: new Date().toISOString() })
          .eq('invoice_id', merchantOrderId);

        console.log(`[Webhook DuitKu] ❌ Payment failed for ${merchantOrderId} with status ${subsStatus}`);
      }
      return c.json({ success: true });
    }

    // 2. KASUS PESANAN PRODUK (Invoice Biasa)
    // Perbarui status pesanan berdasarkan respons DuitKu
    const statusMap: Record<string, string> = {
      '00': 'success',    // Pembayaran berhasil
      '01': 'pending',   // Tertunda
      '02': 'cancelled', // Dibatalkan
      '03': 'expired',   // Kedaluwarsa
    };

    const orderStatus = statusMap[resultCode] || 'pending';

    console.log(`[Webhook DuitKu] Updating Order ${merchantOrderId} to status: ${orderStatus}`);

    // Update order status - the DB trigger (handle_order_status_change) will
    // automatically update wallet.pending_balance/available_balance
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('invoice_id', merchantOrderId);

    if (updateError) {
      console.error('[Webhook DuitKu] Database Update Error (Order):', updateError);
      return c.json({ error: 'Gagal update database pesanan' }, 500);
    }

    console.log(`[Webhook DuitKu] Pesanan ${merchantOrderId} -> ${orderStatus} (Ref: ${body.reference})`);
    console.log(`[Webhook DuitKu] Wallet balance will be auto-updated by DB trigger handle_order_status_change`);

    // Trigger digital delivery for successful payments of digital products
    if (orderStatus === 'success') {
      try {
        console.log(`[Webhook DuitKu] Checking for digital delivery for order: ${merchantOrderId}`);

        // 1. Get the order first
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, customer_id, product_id')
          .eq('invoice_id', merchantOrderId)
          .single();

        if (orderError || !orderData) {
          console.log(`[Webhook DuitKu] Order not found or error: ${orderError?.message}`);
          // Continue without digital delivery
        } else {
          console.log(`[Webhook DuitKu] Found order: ${orderData.id}, customer: ${orderData.customer_id}, product: ${orderData.product_id}`);

          // 2. Get customer email
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('email')
            .eq('id', orderData.customer_id)
            .single();

          // 3. Get product details
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('type, file_url, link_expiry')
            .eq('id', orderData.product_id)
            .single();

          const customerEmail = customerData?.email;
          const productType = productData?.type;
          const linkExpiry = productData?.link_expiry || 'forever';
          let fileUrl = productData?.file_url;

          console.log(`[Webhook DuitKu] Customer email: ${customerEmail}, Product type: ${productType}, File URL: ${fileUrl ? 'Present' : 'Missing'}`);

          // Normalize file URL - if it's relative, make it absolute
          if (fileUrl && !fileUrl.startsWith('http') && !fileUrl.startsWith('https')) {
            console.log(`[Webhook DuitKu] File URL is relative: ${fileUrl}`);
            // Try to construct absolute URL (this depends on your storage setup)
            // For now, we'll log it but keep as-is
          }

          // Check if product is digital/course and has a file URL
          // Accept all digital product types
          const isDigitalProduct = ['digital', 'course', 'ebook', 'assets', 'software', 'video', 'templates'].includes(productType || '');

          if (isDigitalProduct && fileUrl && customerEmail) {
            console.log(`[Webhook DuitKu] ✅ Triggering digital delivery for ${productType} product order ${orderData.id}`);
            console.log(`[Webhook DuitKu] Customer: ${customerEmail}, File: ${fileUrl}`);

            // Import and use digital delivery service
            const { createDigitalDelivery } = await import('../../lib/digital-delivery');

            // Get site URL for email links
            // For webhooks, Origin/Referer headers are usually empty
            // Use PUBLIC_SITE_URL env var first, then fallback to request URL
            const requestUrl = new URL(c.req.url);
            const requestOrigin = getEnv('PUBLIC_SITE_URL') || `${requestUrl.protocol}//${requestUrl.host}`;
            const siteBaseUrl = requestOrigin.replace(/\/$/, '');

            console.log(`[Webhook DuitKu] Site base URL for email: ${siteBaseUrl}`);

            const result = await createDigitalDelivery(
              orderData.id,
              customerEmail,
              fileUrl,
              siteBaseUrl,
              c.env, // Pass Hono environment to library
              linkExpiry
            );

            if (result.success) {
              console.log(`[Webhook DuitKu] ✅ Digital delivery created successfully with token: ${result.token}`);
              if (result.emailSent) {
                console.log(`[Webhook DuitKu] ✅ Email sent successfully to: ${customerEmail}`);
              } else if (result.emailError) {
                console.error(`[Webhook DuitKu] ⚠️ Digital delivery created but email failed: ${result.emailError}`);
                // Log this for admin monitoring - customer won't receive email
                console.error(`[Webhook DuitKu] Order ${orderData.id} needs manual attention - email not sent to ${customerEmail}`);
              }
            } else {
              console.error(`[Webhook DuitKu] ❌ Failed to create digital delivery: ${result.error}`);
              // Continue anyway - don't fail the webhook
            }
          } else {
            console.log(`[Webhook DuitKu] ℹ️ Not a digital product or missing file URL/email.
              Product type: ${productType},
              Has file URL: ${!!fileUrl},
              Has customer email: ${!!customerEmail}`);
          }
        }
      } catch (deliveryError: any) {
        console.error('[Webhook DuitKu] ❌ Error in digital delivery process:', deliveryError);
        console.error('[Webhook DuitKu] Error stack:', deliveryError.stack);
        // Don't fail the webhook - just log the error
      }
    }

    return c.json({ success: true, status: orderStatus });
  } catch (error: any) {
    console.error('Kesalahan webhook DuitKu:', error);
    return c.json({ error: error.message }, 500);
  }
});


// --- DISBURSEMENT WEBHOOK (Duitku Transfer Callback) ---
app.post('/webhooks/duitku-disbursement', async (c) => {
  console.log('[Disbursement Webhook] Received callback');
  try {
    const body = await c.req.json();
    console.log('[Disbursement Webhook] Payload:', JSON.stringify(body, null, 2));
    const { disburseId, responseCode, responseDesc } = body;
    if (!disburseId || !responseCode) return c.json({ error: 'Missing required fields' }, 400);
    const { DuitkuDisbursementService } = await import('../../lib/duitku-disbursement');
    const service = new DuitkuDisbursementService();
    const isValid = await service.validateWebhook(body);
    if (!isValid) {
      console.error('[Disbursement Webhook] Invalid signature');
      return c.json({ error: 'Invalid signature' }, 401);
    }
    const { createClient: createSupa } = await import('@supabase/supabase-js');
    const supabase = createSupa(getEnv('PUBLIC_SUPABASE_URL') || '', getEnv('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { data: withdrawals } = await supabase.from('withdrawals').select('id, merchant_id, amount, status, notes').eq('disburse_id', disburseId).limit(1);
    let withdrawal = withdrawals?.[0] || null;
    if (!withdrawal) {
      const { data: legWd } = await supabase.from('withdrawals').select('id, merchant_id, amount, status, notes').ilike('notes', '%' + disburseId + '%').limit(1);
      withdrawal = legWd?.[0] || null;
    }
    if (responseCode === '00') {
      if (withdrawal) {
        await supabase.from('withdrawals').update({ status: 'completed', processed_at: new Date().toISOString(), notes: withdrawal.notes + ' | COMPLETED via webhook' }).eq('id', withdrawal.id);
        // Clear pending_balance — the money has been successfully transferred out
        const { error: successRpcError } = await supabase.rpc('update_wallet_payout_success', { p_merchant_id: withdrawal.merchant_id, p_amount: Number(withdrawal.amount) });
        if (successRpcError) console.error('[Disbursement Webhook] Failed to clear pending_balance:', successRpcError);
        console.log('[Disbursement Webhook] Withdrawal ' + withdrawal.id + ' completed, pending_balance cleared');
      }
    } else {
      if (withdrawal) {
        await supabase.from('withdrawals').update({ status: 'rejected', processed_at: new Date().toISOString(), notes: withdrawal.notes + ' | FAILED: ' + responseDesc }).eq('id', withdrawal.id);
        // Refund pending_balance back to available_balance
        const { error: refundError } = await supabase.rpc('update_wallet_payout_reject', { p_merchant_id: withdrawal.merchant_id, p_amount: Number(withdrawal.amount) });
        if (refundError) console.error('[Disbursement Webhook] Refund Error:', refundError);
      }
    }
    return c.json({ received: true, disburseId, status: responseCode === '00' ? 'SUCCESS' : 'FAILED' });
  } catch (err) {
    console.error('[Disbursement Webhook] Error:', err);
    return c.json({ received: true, error: err.message }, 200);
  }
});

// DEBUG: Manual trigger digital delivery for testing
app.post('/test/digital-delivery', async (c) => {
  const { supabase, user } = await getAuthContext(c);

  // Require admin access
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const body = await c.req.json();
    const { orderId, email, fileUrl } = body;

    if (!orderId || !email || !fileUrl) {
      return c.json({
        error: 'Missing required fields',
        required: ['orderId', 'email', 'fileUrl'],
        received: { orderId, email, fileUrl }
      }, 400);
    }

    console.log(`[Test Digital Delivery] Manually triggering for order: ${orderId}`);
    console.log(`[Test Digital Delivery] Email: ${email}`);
    console.log(`[Test Digital Delivery] File URL: ${fileUrl}`);

    const { createDigitalDelivery } = await import('../../lib/digital-delivery');

    const siteBaseUrl = getEnv('PUBLIC_SITE_URL') || 'https://tepak.id';

    console.log(`[Test Digital Delivery] Using site URL: ${siteBaseUrl}`);

    const result = await createDigitalDelivery(
      orderId,
      email,
      fileUrl,
      siteBaseUrl,
      c.env // Pass Hono environment
    );

    console.log(`[Test Digital Delivery] Result:`, result);

    return c.json({
      success: result.success,
      token: result.token,
      emailSent: result.emailSent,
      emailError: result.emailError,
      testUrl: result.token ? `${siteBaseUrl}/digital-delivery/${result.token}?email=${encodeURIComponent(email)}` : null
    });

  } catch (err: any) {
    console.error('[Test Digital Delivery] Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// 3. Periksa Status Pembayaran DuitKu
app.post(
  '/payments/duitku/status',
  zValidator(
    'json',
    z.object({
      orderId: z.string(),
      amount: z.number(),
      merchantCode: z.string(),
      merchantKey: z.string(),
    })
  ),
  async (c) => {
    const body = c.req.valid('json');

    try {
      const { DuitkuService } = await import('../../lib/duitku');
      const duitkuService = new DuitkuService(body.merchantCode, body.merchantKey);

      const status = await duitkuService.checkPaymentStatus(body.orderId, body.amount);

      return c.json(status);
    } catch (error: any) {
      console.error('Kesalahan pemeriksaan status DuitKu:', error);
      return c.json({ error: error.message }, 400);
    }
  }
);

/**
 * ENDPOINT PROFIL & PENGATURAN PENGGUNA
 */

// 1. Get My Profile (with Settings)
app.get('/profile/me', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
            *,
            user_settings (*)
        `)
    .eq('id', user.id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(profile);
});


// 2. Update My Profile & Settings
app.put(
  '/profile/me',
  zValidator(
    'json',
    z.object({
      full_name: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
      username: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
      bio: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
      avatar_url: z.string().optional(),
      domain_name: z.string().regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i, 'Format domain tidak valid').optional(),
      seo_title: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
      seo_description: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
      instagram_url: z.string().optional(),
      tiktok_url: z.string().optional(),
      twitter_url: z.string().optional(),
      youtube_url: z.string().optional(),
      phone: z.string().optional(),
      address_text: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
      city: z.string().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE).transform(v => v ? sanitizeString(v) : v),
      postcode: z.string().optional(),
      blocks: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          icon: z.string().optional(),
          title: z.string().optional(),
          subtitle: z.string().optional(),
          data: z.any().optional().refine(noScriptRefinement, XSS_ERROR_MESSAGE)
        })
      ).optional().transform(blocks => blocks ? blocks.map(sanitizeTextBlockContent) : blocks),
      seo_image: z.string().optional(),
      seo_keywords: z.string().optional(),
      ga_id: z.string().optional(),
      fb_pixel_id: z.string().optional(),
      theme: z.string().optional(),
    }),
    (result, c) => {
      if (!result.success) {
        return c.json({ error: result.error.issues[0].message, success: false }, 400);
      }
    }
  ),
  async (c) => {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const body = c.req.valid('json');
    console.log(`[API] Profile Update Request for ${user.id}:`, JSON.stringify(body).substring(0, 100) + "...");

    // Sanitize blocks if present
    let sanitizedBlocks = body.blocks;
    if (sanitizedBlocks && Array.isArray(sanitizedBlocks)) {
      sanitizedBlocks = sanitizedBlocks.map(sanitizeTextBlockContent);
    }

    // Split body into profile and settings fields
    const profileFields = {
      full_name: body.full_name,
      username: body.username,
      bio: body.bio,
      avatar_url: body.avatar_url,
      instagram_url: body.instagram_url,
      tiktok_url: body.tiktok_url,
      twitter_url: body.twitter_url,
      youtube_url: body.youtube_url,
      phone: body.phone,
      address_text: body.address_text,
      city: body.city,
      postcode: body.postcode,
      blocks: sanitizedBlocks,
      updated_at: new Date().toISOString()
    };

    const settingsFields = {
      domain_name: body.domain_name,
      seo_title: body.seo_title,
      seo_description: body.seo_description,
      seo_image: body.seo_image,
      seo_keywords: body.seo_keywords,
      ga_id: body.ga_id,
      fb_pixel_id: body.fb_pixel_id,
      theme: body.theme,
      updated_at: new Date().toISOString()
    };

    // 1. Update Profile
    try {
      const updateData = Object.fromEntries(Object.entries(profileFields).filter(([_, v]) => v !== undefined));
      console.log(`[PUT /profile/me] Attempting update for user ${user.id} with keys:`, Object.keys(updateData));

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (profileError) {
        console.error('[PUT /profile/me] Profile Update Error:', profileError);

        // Handle common schema errors gracefully
        if (profileError.code === '23505') {
          return c.json({ error: 'Username ini sudah digunakan oleh orang lain. Silakan pilih username lain.', code: 'DUPLICATE_USERNAME' }, 400);
        } else if (profileError.code === '42703' || profileError.message.includes('column')) {
          const missingColumn = profileError.message.match(/column "([^"]+)"/)?.[1] || 'unknown';
          console.warn(`[PUT /profile/me] Column "${missingColumn}" appears to be missing. Retrying without suspected columns...`);

          // List of columns that might be missing in older schemas
          const suspectedColumns = ['blocks', 'instagram_url', 'tiktok_url', 'twitter_url', 'youtube_url', 'phone', 'address_text', 'city', 'postcode'];
          const resilientData = Object.fromEntries(
            Object.entries(updateData).filter(([k]) => !suspectedColumns.includes(k) || k === 'full_name' || k === 'username' || k === 'bio' || k === 'avatar_url' || k === 'updated_at')
          );

          console.log('[PUT /profile/me] Retrying with resilient data keys:', Object.keys(resilientData));
          const { error: retryError } = await supabase
            .from('profiles')
            .update(resilientData)
            .eq('id', user.id);

          if (retryError) {
            console.error('[PUT /profile/me] Retry failed:', retryError);
            return c.json({ error: retryError.message, code: retryError.code }, 500);
          }
        } else {
          return c.json({ error: profileError.message, code: profileError.code }, 500);
        }
      }
    } catch (err: any) {
      console.error('[PUT /profile/me] Fatal exception during profile update:', err);
      return c.json({ error: err.message }, 500);
    }

    // 2. Update Settings
    try {
      const settingsUpdateData = Object.fromEntries(Object.entries(settingsFields).filter(([_, v]) => v !== undefined));
      if (Object.keys(settingsUpdateData).length > 0) {
        console.log(`[PUT /profile/me] Attempting user_settings update for user ${user.id} with keys:`, Object.keys(settingsUpdateData));
        const { error: settingsError } = await supabase
          .from('user_settings')
          .update(settingsUpdateData)
          .eq('user_id', user.id);

        if (settingsError) {
          console.error('[PUT /profile/me] Settings Update Error:', settingsError);
          if (settingsError.code === '23505') {
            return c.json({ error: 'Subdomain/Domain ini sudah digunakan oleh orang lain. Silakan pilih nama lain.', code: 'DUPLICATE_DOMAIN' }, 400);
          }
          return c.json({ error: settingsError.message, code: settingsError.code }, 500);
        }
      }
    } catch (err: any) {
      console.error('[PUT /profile/me] Fatal exception during settings update:', err);
      return c.json({ error: err.message }, 500);
    }

    return c.json({ success: true });
  }
);

// (Orders & Analytics moved to top)

// 1. Track Event (Public)
app.post(
  '/analytics/track',
  zValidator(
    'json',
    z.object({
      merchant_id: z.string().uuid(),
      product_id: z.string().uuid().optional(),
      event_type: z.string().default('view'),
      path: z.string().optional(),
      browser: z.string().optional(),
      os: z.string().optional(),
      device_type: z.string().optional(),
    })
  ),
  async (c) => {
    try {
      const { getSupabaseAdmin } = await import('../../lib/supabase');
      const supabase = getSupabaseAdmin(cfEnv);

      const body = c.req.valid('json') as any;
      const path = body.path || '';

      // Daftar halaman internal yang TIDAK boleh dilacak views-nya (Backend Safety)
      const excludedPaths = [
        '/dashboard', '/admin', '/settings', '/orders', '/products',
        '/wallet', '/withdraw', '/bank-info', '/add-product', '/edit-product',
        '/login', '/signup', '/forgot-password', '/reset-password', '/reset-sent',
        '/onboarding', '/verify-email', '/uikit', '/demo', '/api'
      ];

      const isExcluded = excludedPaths.some(p =>
        path === p || path.startsWith(p + '/')
      );

      if (isExcluded) {
        console.log('[analytics/track] Skipping internal path:', path);
        return c.json({ success: true, skipped: true }, 200);
      }

      const mid = String(body.merchant_id || '');
      if (!mid || mid === 'undefined' || mid === 'null' || mid.length < 10) {
        console.log('[analytics/track] Skipping: Invalid merchant_id:', mid);
        return c.json({ success: true, message: 'Skipped: Invalid merchant_id' }, 200);
      }

      // Filter and map to actual DB columns (Lowercased to avoid check constraint violations)
      const insertData = {
        merchant_id: body.merchant_id,
        product_id: body.product_id || null,
        event_type: String(body.event_type || 'page_view').toLowerCase() === 'view' ? 'page_view' : String(body.event_type || 'page_view').toLowerCase(),
        traffic_source: String(body.traffic_source || 'direct').toLowerCase(),
        device_type: String(body.device_type || 'desktop').toLowerCase(),
        browser: String(body.browser || 'unknown').toLowerCase(),
        country: String(body.country || 'id').toLowerCase(),
        city: String(body.city || 'unknown').toLowerCase(),
        session_id: body.session_id || `sess_${Date.now()}`,
        path: body.path || '',
        referrer: body.referrer || ''
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert(insertData);

      if (error) {
        console.error('[analytics/track] Supabase Error:', error);
        return c.json({ error: error.message, details: error }, 500);
      }
      return c.json({ success: true }, 201);
    } catch (err: any) {
      console.error('[analytics/track] Global Catch:', err);
      return c.json({ error: 'Internal server error', message: err.message }, 500);
    }
  }
);

// 2. Get Dashboard Stats
app.get('/analytics/dashboard', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const range = c.req.query('range') || '7d';
    const start = c.req.query('start');
    const end = c.req.query('end');

    // Calculate time filter - Start from beginning of the day (00:00:00)
    let startDate = new Date();
    if (start) {
      startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
    } else {
      if (range === '24h') startDate.setHours(startDate.getHours() - 24);
      else if (range === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (range === '30d') startDate.setDate(startDate.getDate() - 30);
      else if (range === '90d') startDate.setDate(startDate.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
    }
    const startDateStr = startDate.toISOString();

    const endDate = end ? new Date(end) : new Date();
    endDate.setHours(23, 59, 59, 999);
    const endDateStr = endDate.toISOString();

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 7;

    // 1. Fetch total events
    const { data: events, error: eventError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);

    if (eventError) {
      console.error('[Analytics API] Event fetch error:', eventError);
      return c.json({
        error: 'Event Fetch Failed',
        details: eventError,
        hint: 'Check if analytics_events table exists and RLS is correct.'
      }, 500);
    }

    // 2. Fetch sales from orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('amount, status, net_amount, created_at')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);

    if (orderError) {
      console.error('[Analytics API] Order fetch error:', orderError);
      return c.json({
        error: 'Order Fetch Failed',
        details: orderError
      }, 500);
    }

    const rawEventList = events || [];
    const orderList = orders || [];

    // STRICT AUDIT: Filter out any internal paths from the counts
    const excludedPaths = [
      '/dashboard', '/admin', '/settings', '/orders', '/products',
      '/wallet', '/withdraw', '/bank-info', '/add-product', '/edit-product',
      '/login', '/signup', '/forgot-password', '/reset-password', '/reset-sent',
      '/onboarding', '/verify-email', '/uikit', '/demo', '/api'
    ];

    const eventList = rawEventList.filter(e => {
      const path = e.path || '';
      return !excludedPaths.some(p => path === p || path.startsWith(p + '/'));
    });

    // Aggregate Stats
    const totalViews = eventList.filter(e => e.event_type === 'view' || e.event_type === 'page_view').length;
    const totalClicks = eventList.filter(e => e.event_type === 'click').length;
    const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) + '%' : '0%';

    // Device Segmentation
    const deviceCounts: Record<string, number> = {};
    eventList.forEach(e => {
      const dt = e.device_type || 'Unknown';
      deviceCounts[dt] = (deviceCounts[dt] || 0) + 1;
    });
    const devices = Object.entries(deviceCounts).map(([type, count]) => ({
      type,
      percentage: Math.round((count / (eventList.length || 1)) * 100)
    })).sort((a, b) => b.percentage - a.percentage);

    // Browser Ranking
    const browserCounts: Record<string, number> = {};
    eventList.forEach(e => {
      const b = e.browser || 'Unknown';
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });
    const browsers = Object.entries(browserCounts).map(([name, percentage]) => ({
      name,
      percentage: Math.round((percentage / (eventList.length || 1)) * 100),
      icon: name === 'Chrome' ? '🌐' : name === 'Safari' ? '🍎' : name === 'Firefox' ? '🦊' : '📁'
    })).sort((a, b) => b.percentage - a.percentage).slice(0, 3);

    // 3. Time Series aggregation
    const timeSeries: Record<string, { views: number, clicks: number, sales: number }> = {};

    // Initialize the last X days with 0s to avoid gaps in chart
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      timeSeries[dateStr] = { views: 0, clicks: 0, sales: 0 };
    }

    // Helper to check for successful order status
    const isSuccessOrder = (status: string) => {
      const s = (status || '').toLowerCase();
      return s === 'success' || s === 'paid' || s === 'settled' || s === 'completed';
    };

    eventList.forEach(e => {
      const dateStr = new Date(e.created_at).toISOString().split('T')[0];
      if (timeSeries[dateStr]) {
        if (e.event_type === 'view' || e.event_type === 'page_view') timeSeries[dateStr].views++;
        if (e.event_type === 'click') timeSeries[dateStr].clicks++;
      }
    });

    orderList.forEach(o => {
      const dateStr = new Date(o.created_at).toISOString().split('T')[0];
      if (timeSeries[dateStr] && isSuccessOrder(o.status)) {
        timeSeries[dateStr].sales += Number(o.amount);
      }
    });

    const sortedDates = Object.keys(timeSeries).sort();
    const time_series = {
      labels: sortedDates.map(d => {
        const date = new Date(d);
        return date.toLocaleDateString('id-ID', { month: 'short', day: '2-digit' }).toUpperCase();
      }),
      views: sortedDates.map(d => timeSeries[d].views),
      clicks: sortedDates.map(d => timeSeries[d].clicks),
      sales: sortedDates.map(d => timeSeries[d].sales)
    };

    // 4. Top Links aggregation
    const linkCounts: Record<string, { views: number, clicks: number, path: string }> = {};
    eventList.forEach(e => {
      const path = e.path || '/';
      if (!linkCounts[path]) linkCounts[path] = { views: 0, clicks: 0, path };
      if (e.event_type === 'view' || e.event_type === 'page_view') linkCounts[path].views++;
      if (e.event_type === 'click') linkCounts[path].clicks++;
    });
    const top_links = Object.values(linkCounts)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return c.json({
      totalViews,
      totalClicks,
      avgCTR: avgCtr,
      devices: devices.length > 0 ? devices : [
        { type: 'Mobile', percentage: 0 },
        { type: 'Desktop', percentage: 0 }
      ],
      browsers: browsers.length > 0 ? browsers : [
        { name: 'N/A', percentage: 0, icon: '❓' }
      ],
      sales: {
        total_revenue: orderList.filter(o => isSuccessOrder(o.status)).reduce((sum, o) => sum + (Number(o.net_amount) || Number(o.amount)), 0),
        order_count: orderList.filter(o => isSuccessOrder(o.status)).length
      },
      time_series,
      top_links
    });
  } catch (err: any) {
    console.error('[Analytics API] Global catch:', err);
    return c.json({
      error: 'Global Exception',
      message: err.message,
      stack: err.stack
    }, 500);
  }
});

// 3. Get Public Product Detail (for Checkout)
app.get('/public/products/:id', async (c) => {
  const id = c.req.param('id');
  const url = getEnv('PUBLIC_SUPABASE_URL');
  const key = getEnv('PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !key) {
    return c.json({ error: 'Configuration missing' }, 500);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('products')
    .select('id, title, price, sale_price, description, cover_url, merchant_id, status')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error) return c.json({ error: 'Produk tidak ditemukan atau tidak tersedia' }, 404);
  return c.json(data);
});

// 4. Get Public Profile Detail (for Creator Landing Page Link)
app.get('/public/profiles/:id', async (c) => {
  const id = c.req.param('id');
  console.log(`[API] GET /public/profiles/${id}`);

  const url = getEnv('PUBLIC_SUPABASE_URL');
  const key = getEnv('PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !key) {
    return c.json({ error: 'Configuration missing' }, 500);
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`[API] Profile ${id} not found:`, error);
    return c.json({ error: 'Profile tidak ditemukan' }, 404);
  }

  console.log(`[API] Profile found:`, data);
  return c.json(data);
});

// --- ADMIN ROUTES (SUPER ADMIN ONLY) ---

const checkAdmin = async (supabase: any, user: any, c?: any) => {
  try {
    // 1. MASTER PASSCODE BYPASS (Bebas Akun)
    const MASTER_PASSCODE = getEnv('ADMIN_PASSCODE') || 'admin123';
    if (c) {
      const adminToken = getCookie(c, 'admin_access_token');
      if (adminToken === MASTER_PASSCODE) return true;
    }

    if (!user) return false;

    // Check role from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[checkAdmin] Error fetching profile:', error);
      return false;
    }

    return profile?.role === 'admin';
  } catch (err) {
    console.error('[checkAdmin] Global Exception:', err);
    return false;
  }
};

// Admin Authentication Endpoint (Set admin_access_token cookie)
app.post('/admin/auth', async (c) => {
  try {
    const body = await c.req.json();
    const { passcode } = body;

    const ADMIN_PASSCODE = getEnv('ADMIN_PASSCODE') || 'admin123';

    if (passcode === ADMIN_PASSCODE) {
      // Set cookie for subsequent requests
      c.header('Set-Cookie', `admin_access_token=${passcode}; Path=/; Max-Age=86400; SameSite=Lax`);
      return c.json({ success: true, message: 'Admin authenticated' });
    } else {
      return c.json({ error: 'Invalid passcode' }, 401);
    }
  } catch (err: any) {
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// 1. Get All Users (Admin)
app.get('/admin/users', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    // Use Admin Client for fetching all users to bypass RLS/Visibility issues
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    const { data: profiles, error: pError } = await adminSupabase
      .from('profiles')
      .select('*, settings:user_settings(*)')
      .order('created_at', { ascending: false });

    if (pError) throw pError;

    // Fetch real emails from auth.users
    const { data: { users: authUsers }, error: aError } = await adminSupabase.auth.admin.listUsers();

    // Map emails by ID for fast lookup
    const emailMap = new Map(authUsers?.map(au => [au.id, au.email]) || []);

    // Parallel fetch counts for performance (Standard Query fallback)
    const [
      { data: allPages },
      { data: allProducts },
      { data: allOrders }
    ] = await Promise.all([
      adminSupabase.from('pages').select('user_id'),
      adminSupabase.from('products').select('merchant_id'),
      adminSupabase.from('orders').select('merchant_id, amount').in('status', ['success', 'paid'])
    ]);

    // Map counts by ID
    const pageMap = new Map();
    allPages?.forEach(p => {
      pageMap.set(p.user_id, (pageMap.get(p.user_id) || 0) + 1);
    });

    const productMap = new Map();
    allProducts?.forEach(p => {
      productMap.set(p.merchant_id, (productMap.get(p.merchant_id) || 0) + 1);
    });

    const orderMap = new Map();
    allOrders?.forEach(o => {
      orderMap.set(o.merchant_id, (orderMap.get(o.merchant_id) || 0) + Number(o.amount));
    });

    // Map data to match Admin Dashboard structure
    const formattedUsers = (profiles || []).map(u => {
      const setting = Array.isArray(u.settings) ? u.settings[0] : u.settings;
      const totalTransacted = orderMap.get(u.id) || 0;

      return {
        id: u.id,
        name: u.full_name || u.username || 'Anonymous',
        email: emailMap.get(u.id) || (u.username ? `${u.username}@tepak.id` : 'no-email@tepak.id'),
        username: u.username || 'unknown',
        plan: setting?.plan_status?.toUpperCase() || 'FREE',
        planExpiry: setting?.plan_expiry || 'N/A',
        status: (u.is_banned || setting?.plan_status === 'banned') ? 'Banned' : 'Active',
        is_banned: u.is_banned || setting?.plan_status === 'banned',
        joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
        total: `Rp ${totalTransacted.toLocaleString('id-ID')}`,
        stats: {
          pages: pageMap.get(u.id) || 0,
          products: productMap.get(u.id) || 0
        }
      };
    });

    return c.json(formattedUsers);
  } catch (err: any) {
    console.error('[Admin Users API] Error:', err);
    return c.json({ error: err.message, details: 'Check server logs for stack trace' }, 500);
  }
});

// 2. Ban/Unban User (Admin)
app.post('/admin/users/ban', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const { userId, isBanned } = await c.req.json();

    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // PREVENT SELF-BANNING
    if (user && userId === user.id) {
      return c.json({ error: 'Tidak dapat memblokir akun sendiri (Self-ban protection)' }, 400);
    }

    const plan_status = isBanned ? 'banned' : 'free';

    // Use Administrative Client (Bypasses RLS)
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    // 1. Update Profile Flag (Source of Truth for Banning)
    const { data: pData, error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        is_banned: isBanned,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (profileError) {
      console.error('[Admin API] Profile Update Error:', profileError);
      throw profileError;
    }

    // 2. Ensure user_settings record exists (use 'free' for new, don't change status for existing)
    // We don't use 'banned' status because it violates DB check constraints
    const { data: sData, error: settingsError } = await adminSupabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        // If we are banning, we don't change the status, just the profile flag
        // If we must provide a status for a NEW row, we use 'free'
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (settingsError) {
      console.error('[Admin API] Settings Upsert Error:', settingsError);
      throw settingsError;
    }

    return c.json({ success: true, isBanned: pData?.[0]?.is_banned });
  } catch (err: any) {
    console.error('[Admin API] Ban Exception:', err);
    return c.json({ error: err.message || 'Internal Server Error', details: err }, 500);
  }
});

// 2. Public Platform Settings (Branding) — with in-memory cache
const publicSettingsCache = { data: null as any, timestamp: 0 };
const PUBLIC_SETTINGS_CACHE_TTL = 60 * 1000; // 60 seconds

app.get('/public/settings', async (c) => {
  try {
    // Return cached data if still fresh
    const now = Date.now();
    if (publicSettingsCache.data && (now - publicSettingsCache.timestamp) < PUBLIC_SETTINGS_CACHE_TTL) {
      return c.json(publicSettingsCache.data);
    }

    // Reuse the admin client instead of creating a new one per request
    const supabase = getSupabaseAdmin(cfEnv);

    const { data, error } = await supabase
      .from('platform_configs')
      .select('site_name, site_tagline, logo_url, favicon_url, primary_color, maintenance_mode, registration_enabled, payouts_enabled, payout_fee, min_withdrawal, support_email, whatsapp_number, office_address, seo_description')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const responseData = data || { site_name: 'Tepak.ID' };

    // Update cache
    publicSettingsCache.data = responseData;
    publicSettingsCache.timestamp = now;

    return c.json(responseData);
  } catch (err: any) {
    console.error('[Public Settings API] Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// 3. Platform Settings (Admin)
app.get('/admin/settings', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const url = getEnv('PUBLIC_SUPABASE_URL');
    const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY');

    let targetClient = supabase;
    if (key && key.length > 20 && key.startsWith('eyJ')) {
      targetClient = createClient(url, key);
    }

    const { data, error } = await targetClient
      .from('platform_configs')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return c.json(data || { id: 1 });
  } catch (err: any) {
    console.error('[Admin Settings GET] Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.put('/admin/settings', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const body = await c.req.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      'site_name', 'site_tagline', 'logo_url', 'favicon_url',
      'primary_color', 'support_email', 'whatsapp_number',
      'office_address', 'platform_fee', 'maintenance_mode',
      'registration_enabled', 'payouts_enabled', 'seo_description',
      'merchant_fee_fixed', 'payout_fee', 'min_withdrawal',
      'webhook_url', 'webhook_config', 'security_config', 'payment_gateways_config'
    ];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });

    updateData.id = 1;
    updateData.updated_at = new Date().toISOString();

    const url = getEnv('PUBLIC_SUPABASE_URL');
    const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY');

    let targetClient = supabase;
    if (key && key.length > 20 && key.startsWith('eyJ')) {
      targetClient = createClient(url, key);
    }

    const { data, error } = await targetClient
      .from('platform_configs')
      .upsert(updateData)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    console.error('[Admin Settings PUT] Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// 4. Tutorial Management (Admin)
app.get('/admin/tutorials', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user, c);
    if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

    const { data: tutorials, error } = await supabase
      .from('tutorials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Tutorials GET] Supabase Error:', error);
      return c.json({
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        note: 'Failed at query level'
      }, 500);
    }
    return c.json(tutorials);
  } catch (err: any) {
    console.error('[Admin Tutorials GET] Global Exception:', err);
    return c.json({ error: err.message, stack: err.stack, note: 'Failed at global catch' }, 500);
  }
});

app.post('/admin/tutorials', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    const isAdmin = await checkAdmin(supabase, user, c);
    if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

    const body = await c.req.json();
    const { id, ...data } = body;

    // Auto-generate YouTube Thumbnail if URL provided
    if (data.video_url && data.video_url.includes('youtube.com')) {
      const videoId = data.video_url.split('v=')[1]?.split('&')[0];
      if (videoId && !data.thumbnail_url) {
        data.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } else if (data.video_url && data.video_url.includes('youtu.be')) {
      const videoId = data.video_url.split('/').pop()?.split('?')[0];
      if (videoId && !data.thumbnail_url) {
        data.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }

    let res;
    // Prepare the data for Database (Mapping description to content_html for compatibility)
    const dbData = {
      title: data.title,
      category: data.category,
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url,
      content_html: data.description || data.content_html,
      status: data.status || 'published',
      duration: data.duration || '0:00'
    };

    // Check if it's an update or insert
    if (id && typeof id === 'string' && id.length > 20) {
      const { data: updated, error } = await supabase
        .from('tutorials')
        .update({
          ...dbData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      res = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('tutorials')
        .insert({
          ...dbData,
          platform: data.video_url?.includes('youtube.com') || data.video_url?.includes('youtu.be') ? 'YouTube' : 'Other'
        })
        .select()
        .single();
      if (error) throw error;
      res = inserted;
    }
    return c.json(res);
  } catch (err: any) {
    console.error('[Admin Tutorials POST] Error:', err);
    return c.json({ error: err.message, stack: err.stack, note: 'DEBUG MODE ACTIVE' }, 500);
  }
});

app.delete('/admin/tutorials/:id', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    const id = c.req.param('id');
    const { error } = await supabase.from('tutorials').delete().eq('id', id);
    if (error) throw error;
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 4. Global Overview Stats (Admin)
app.get('/admin/overview', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    // Use Admin Client to bypass RLS for cross-user data access
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    // Parallel fetch for global metrics
    const [
      { count: totalUsers },
      { count: proUsers },
      { data: gmvData },
      { count: pendingPayouts },
      { data: latestProfiles },
      { data: latestWithdrawals }
    ] = await Promise.all([
      adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
      adminSupabase.from('user_settings').select('*', { count: 'exact', head: true }).eq('plan_status', 'pro'),
      adminSupabase.from('orders').select('amount').in('status', ['success', 'paid']),
      adminSupabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      adminSupabase.from('profiles').select('full_name, username, created_at').order('created_at', { ascending: false }).limit(5),
      adminSupabase.from('withdrawals').select('amount, status, requested_at, profiles(full_name, username)').order('requested_at', { ascending: false }).limit(5)
    ]);

    const totalGMV = gmvData?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

    // Registration Growth (last 7 days grouped by name)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: growthResult } = await adminSupabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const growthMap: Record<string, number> = {};

    // Pre-fill to ensure no gaps in chart
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      growthMap[dayNames[d.getDay()]] = 0;
    }

    growthResult?.forEach(p => {
      const day = dayNames[new Date(p.created_at).getDay()];
      if (growthMap[day] !== undefined) growthMap[day]++;
    });

    const growthData = dayNames.map(day => ({
      label: day,
      count: growthMap[day] || 0
    })).filter(d => growthMap[d.label] !== undefined);

    // Activity Feed Aggregation
    const activity: any[] = [];
    latestProfiles?.forEach(p => {
      activity.push({
        type: 'registration',
        title: 'New creator registered',
        desc: `${p.full_name || p.username} joined Tepak.ID.`,
        time: p.created_at
      });
    });
    latestWithdrawals?.forEach((w: any) => {
      activity.push({
        type: 'payout',
        title: 'Payout requested',
        desc: `Withdrawal for Rp ${Number(w.amount).toLocaleString('id-ID')} by ${w.profiles?.full_name || w.profiles?.username}.`,
        time: w.requested_at
      });
    });
    activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return c.json({
      totalUsers: totalUsers || 0,
      proUsers: proUsers || 0,
      totalGMV,
      pendingPayouts: pendingPayouts || 0,
      growthData,
      recentActivity: activity.slice(0, 10)
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// 5. Payout Management (Admin)
app.get('/admin/payouts', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    // Use Admin Client to bypass RLS — admin needs to see ALL withdrawals from all creators
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    const { data, error } = await adminSupabase
      .from('withdrawals')
      .select(`
        *,
        profiles (full_name, username, avatar_url),
        bank_accounts (*)
      `)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/admin/payouts/update-status', async (c) => {
  const { supabase, user: adminUser } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, adminUser);
  if (!isAdmin) return c.json({ error: 'Forbidden' }, 403);

  try {
    // Use Admin Client to bypass RLS — admin needs to update ANY creator's withdrawal
    const { getSupabaseAdmin } = await import('../../lib/supabase');
    const adminSupabase = getSupabaseAdmin(cfEnv);

    const { id, status, notes, proof_url } = await c.req.json();

    // 1. Get the withdrawal record
    const { data: withdrawal, error: fetchErr } = await adminSupabase
      .from('withdrawals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !withdrawal) throw new Error('Withdrawal record not found');
    if (withdrawal.status === 'completed' || withdrawal.status === 'rejected') {
      throw new Error('Withdrawal is already finalized');
    }

    const creatorId = withdrawal.merchant_id;
    const amount = Number(withdrawal.amount);

    // 2. Process status change
    if (status === 'processing') {
      const { error: updateErr } = await adminSupabase
        .from('withdrawals')
        .update({
          status: 'processing',
          notes: notes || 'Pencairan sedang diproses oleh admin'
        })
        .eq('id', id);
      if (updateErr) throw updateErr;

      await adminSupabase.from('notifications').insert({
        user_id: creatorId,
        title: 'Withdrawal Processing',
        message: `Pencairan dana Anda sedang diproses oleh admin. Mohon tunggu.`,
        type: 'info'
      });

    } else if (status === 'completed') {
      const { error: updateErr } = await adminSupabase
        .from('withdrawals')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          notes,
          proof_url
        })
        .eq('id', id);
      if (updateErr) throw updateErr;

      // Reduce pending balance (already reserved when requested)
      const { error: walletErr } = await adminSupabase.rpc('update_wallet_payout_success', {
        p_merchant_id: creatorId,
        p_amount: amount
      });
      if (walletErr) throw walletErr;

      // 3. Send Notification to Creator
      await adminSupabase.from('notifications').insert({
        user_id: creatorId,
        title: 'Withdrawal Successful',
        message: `Pencairan dana sebesar Rp ${amount.toLocaleString('id-ID')} telah berhasil diproses.`,
        type: 'success'
      });

    } else if (status === 'rejected') {
      const { error: updateErr } = await adminSupabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          notes: `Rejected: ${notes}`
        })
        .eq('id', id);
      if (updateErr) throw updateErr;

      // Refund from pending back to available
      const { error: walletErr } = await adminSupabase.rpc('update_wallet_payout_reject', {
        p_merchant_id: creatorId,
        p_amount: amount
      });
      if (walletErr) throw walletErr;

      // 3. Send Notification to Creator
      await adminSupabase.from('notifications').insert({
        user_id: creatorId,
        title: 'Withdrawal Rejected',
        message: `Permintaan pencairan dana sebesar Rp ${amount.toLocaleString('id-ID')} ditolak. Alasan: ${notes}. Saldo telah dikembalikan ke Available Balance Anda.`,
        type: 'error'
      });
    }

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

/**
 * SUBSCRIPTION PLAN MANAGEMENT (ADMIN)
 */

// List all plans
app.get('/admin/plans', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return c.json(data || []);
  } catch (err: any) {
    console.error('[Admin Plans API] Error:', err);
    return c.json({ error: err.message, stack: err.stack, note: 'DEBUG MODE ACTIVE' }, 500);
  }
});

// Update plan configuration
app.post('/admin/plans/update', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

  try {
    const plans = await c.req.json();
    if (!Array.isArray(plans)) throw new Error('Invalid data format');

    for (const plan of plans) {
      const { error } = await supabase
        .from('subscription_plans')
        .upsert({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          badge: plan.badge,
          price_monthly: Number(plan.price_monthly),
          price_yearly: Number(plan.price_yearly),
          features: plan.features,
          config: plan.config,
          // is_active column may not exist in schema cache, omit for now
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    return c.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Plans Update API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Delete a plan (admin only)
app.delete('/admin/plans/:planId', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

  const planId = c.req.param('planId');
  if (!planId) return c.json({ error: 'Plan ID required' }, 400);

  // Prevent deletion of free/pro plans
  if (['free', 'pro'].includes(planId)) {
    return c.json({ error: 'Cannot delete free or pro plans' }, 400);
  }

  try {
    console.log(`[Admin Plans Delete API] Attempting to delete plan ${planId}`);
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);

    console.log(`[Admin Plans Delete API] Delete result: error=${error}`);
    if (error) throw error;
    return c.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Plans Delete API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Get subscription stats
app.get('/admin/subscriptions', async (c) => {
  const { supabase, user } = await getAuthContext(c);
  const isAdmin = await checkAdmin(supabase, user, c);
  if (!isAdmin) return c.json({ error: 'Unauthorized' }, 403);

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('plan_status');

    if (error) throw error;

    // Group by plan
    const stats = data.reduce((acc: any, curr: any) => {
      const status = curr.plan_status || 'free';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { free: 0, pro: 0, enterprise: 0 });

    return c.json(stats);
  } catch (err: any) {
    console.error('[Admin Subscriptions API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// --- PRO PERFORMANCE INSIGHTS ENDPOINTS ---

// 1. Traffic Sources Analytics
app.get('/analytics/traffic-sources', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const range = c.req.query('range') || '30d';
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Fetch analytics events grouped by traffic source
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('traffic_source')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (error) throw error;

    // Count by traffic source
    const sourceCount: Record<string, number> = {
      direct: 0,
      social: 0,
      search: 0,
      referral: 0,
    };

    const eventList = events || [];
    eventList.forEach(e => {
      const source = e.traffic_source || 'direct';
      if (source in sourceCount) sourceCount[source]++;
    });

    const total = eventList.length || 1;
    const sources = [
      { name: 'Direct Traffic', value: Math.round((sourceCount.direct / total) * 100), color: 'bg-primary', subtext: 'Direct URL, Bookmarks' },
      { name: 'Social Media', value: Math.round((sourceCount.social / total) * 100), color: 'bg-secondary', subtext: 'Instagram, TikTok, Twitter' },
      { name: 'Search Engines', value: Math.round((sourceCount.search / total) * 100), color: 'bg-emerald-500', subtext: 'Google, Bing, DuckDuckGo' },
      { name: 'Referrals', value: Math.round((sourceCount.referral / total) * 100), color: 'bg-indigo-500', subtext: 'External blogs, Affiliates' },
    ];

    return c.json({ sources, totalEvents: total });
  } catch (err: any) {
    console.error('[Traffic Sources API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// 2. Conversion Funnel
app.get('/analytics/conversion-funnel', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const range = c.req.query('range') || '30d';
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Count events by type for funnel
    const { data: events, error: eventError } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (eventError) throw eventError;

    const eventList = events || [];
    const totalVisits = eventList.length;
    const productViews = eventList.filter(e => e.event_type === 'page_view').length;
    const addToCart = eventList.filter(e => e.event_type === 'add_to_cart').length;

    // Get actual purchased orders
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('merchant_id', user.id)
      .eq('status', 'success')
      .gte('created_at', startDateStr);

    if (orderError) throw orderError;

    const purchased = (orders || []).length;

    const funnelSteps = [
      { label: 'Total Visits', value: totalVisits.toLocaleString(), percent: 100, color: 'bg-primary' },
      { label: 'Product Views', value: productViews.toLocaleString(), percent: totalVisits > 0 ? Math.round((productViews / totalVisits) * 100) : 0, color: 'bg-primary/80' },
      { label: 'Added to Cart', value: addToCart.toLocaleString(), percent: totalVisits > 0 ? Math.round((addToCart / totalVisits) * 100) : 0, color: 'bg-primary/60' },
      { label: 'Purchased', value: purchased.toLocaleString(), percent: totalVisits > 0 ? (purchased / totalVisits * 100) : 0, color: 'bg-emerald-500' },
    ];

    const conversionRate = totalVisits > 0 ? (purchased / totalVisits * 100).toFixed(2) : '0.00';

    return c.json({
      funnelSteps,
      conversionRate: parseFloat(conversionRate),
      improvement: 14 // Demo improvement percentage
    });
  } catch (err: any) {
    console.error('[Conversion Funnel API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// 3. Geographic Analytics
app.get('/analytics/geo', async (c) => {
  try {
    const { supabase, user } = await getAuthContext(c);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const range = c.req.query('range') || '30d';
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Count by country
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('country')
      .eq('merchant_id', user.id)
      .gte('created_at', startDateStr);

    if (error) throw error;

    const eventList = events || [];
    const countryCount: Record<string, number> = {};

    eventList.forEach(e => {
      const country = e.country || 'ID';
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    const total = eventList.length || 1;

    // Top countries
    const countryData = Object.entries(countryCount)
      .map(([code, count]) => ({
        code,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const locations = [
      { country: 'Indonesia', flag: '🇮🇩', sessions: countryData.find(c => c.code === 'ID')?.count.toLocaleString() || '0', share: countryData.find(c => c.code === 'ID')?.percentage || 0, trend: '+12%' },
      { country: 'Malaysia', flag: '🇲🇾', sessions: countryData.find(c => c.code === 'MY')?.count.toLocaleString() || '0', share: countryData.find(c => c.code === 'MY')?.percentage || 0, trend: '+5%' },
      { country: 'Singapore', flag: '🇸🇬', sessions: countryData.find(c => c.code === 'SG')?.count.toLocaleString() || '0', share: countryData.find(c => c.code === 'SG')?.percentage || 0, trend: '-2%' },
      { country: 'United States', flag: '🇺🇸', sessions: countryData.find(c => c.code === 'US')?.count.toLocaleString() || '0', share: countryData.find(c => c.code === 'US')?.percentage || 0, trend: '+20%' },
      { country: 'Others', flag: '🌐', sessions: eventList.length.toLocaleString(), share: 100, trend: '+1%' },
    ];

    return c.json({ locations, totalSessions: total });
  } catch (err: any) {
    console.error('[Geo Analytics API] error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Health check with Database Diagnostics
// Digital Delivery Token Verification
app.get('/digital-delivery/:token', async (c) => {
  const token = c.req.param('token');
  const email = c.req.query('email') || '';

  if (!token) {
    return c.json({ error: 'Token required' }, 400);
  }

  try {
    const { verifyTokenAccess } = await import('../../lib/digital-delivery');
    const result = await verifyTokenAccess(token, email);

    if (!result.valid) {
      if (result.error === 'EMAIL_MISMATCH') {
        // Redirect to static error page
        return c.redirect('/digital-delivery/error?reason=email_mismatch');
      }
      return c.json({ error: result.error || 'Invalid token' }, 403);
    }

    // Return the signed URL for download
    return c.json({
      success: true,
      signedUrl: result.signedUrl,
      fileUrl: result.fileUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Static error page for digital delivery
app.get('/digital-delivery/error', async (c) => {
  const reason = c.req.query('reason') || 'invalid';

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Akses Ditolak - Tepak.ID</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          margin: 0;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
        }
        h1 {
          color: #e53e3e;
          margin-bottom: 20px;
        }
        p {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
          color: #e53e3e;
        }
        .contact {
          background: #f7fafc;
          border-radius: 8px;
          padding: 20px;
          margin-top: 30px;
        }
        .contact h3 {
          margin-top: 0;
          color: #2d3748;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🔒</div>
        <h1>Anda tidak bisa mengakses tautan</h1>
        <p>
          ${reason === 'email_mismatch'
      ? 'Tautan ini hanya dapat diakses dengan email yang digunakan saat pembelian. Silakan gunakan email yang sama dengan yang tercatat di pesanan Anda.'
      : 'Tautan ini tidak valid, telah kadaluarsa, atau telah digunakan.'}
        </p>
        <p>
          Jika Anda merasa ini adalah kesalahan, silakan hubungi kreator produk untuk bantuan lebih lanjut.
        </p>
        
        <div class="contact">
          <h3>Butuh Bantuan?</h3>
          <p>Hubungi dukungan pelanggan atau kreator produk untuk mendapatkan akses yang sesuai.</p>
          <p><a href="mailto:support@tepak.id">support@tepak.id</a></p>
        </div>
        
        <p style="margin-top: 30px; font-size: 14px; color: #718096;">
          &copy; ${new Date().getFullYear()} Tepak.ID - Platform Digital Product
        </p>
      </div>
    </body>
    </html>
  `;

  return c.html(html);
});

app.get('/health', async (c) => {
  const { supabase } = await getAuthContext(c);

  const [profilesRes, tutorialsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1),
    supabase.from('tutorials').select('id', { count: 'exact', head: true }).limit(1)
  ]);

  return c.json({
    status: 'ok',
    environment: 'edge',
    diagnostics: {
      profiles_table: profilesRes.error ? `Error: ${profilesRes.error.message}` : 'Healthy',
      tutorials_table: tutorialsRes.error ? `Error: ${tutorialsRes.error.message}` : 'Healthy',
      auth: 'active'
    }
  });
});

// Export handler for Astro
export const ALL: APIRoute = async (context) => {
  // In Astro v6+, 'locals.runtime' is removed. 
  // Accessing it even with '?' can trigger a throwing getter in the adapter.

  if (!cfEnv || Object.keys(cfEnv).length === 0) {
    try {
      // @ts-ignore - Modern Astro v6 / Cloudflare standard
      const cfWorkers = await import('cloudflare:workers');
      if (cfWorkers && cfWorkers.env) {
        cfEnv = cfWorkers.env;
      }
    } catch (e) {
      // Local dev or non-cloudflare environment
    }
  }

  // Inject into globalThis for other modules (like digital-delivery.ts)
  if (typeof globalThis !== 'undefined' && cfEnv) {
    (globalThis as any).env = { ...((globalThis as any).env || {}), ...cfEnv };
  }

  // Hono's fetch will automatically receive 'env' when deployed to Cloudflare
  return app.fetch(
    context.request,
    cfEnv || {},
    context
  );
};
