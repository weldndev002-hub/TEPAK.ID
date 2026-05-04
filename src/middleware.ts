import { defineMiddleware } from 'astro:middleware';
import { getServerClient } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, cookies, request, redirect } = context;
  try {
    const url = new URL(request.url);

    // Capture Environment - Aggressive detection for Astro/Cloudflare
    let runtimeEnv: Record<string, any> = { ...(import.meta.env || {}) };
    try {
      // @ts-ignore
      const locals = context.locals || {};
      // @ts-ignore
      const cfRuntime = locals.runtime || context.runtime || {};

      const envSources = [
        cfRuntime.env,
        (globalThis as any).process?.env,
        (globalThis as any).env
      ];

      for (const source of envSources) {
        if (source && typeof source === 'object') {
          runtimeEnv = { ...runtimeEnv, ...source };
        }
      }

      // Modern Cloudflare Standard (Internal import)
      try {
        // @ts-ignore
        const cf = await import('cloudflare:workers');
        if (cf?.env) runtimeEnv = { ...runtimeEnv, ...cf.env };
      } catch (e) { }
    } catch (e) { }

    // Try with PUBLIC prefix first, then without
    const supabaseUrl = runtimeEnv.PUBLIC_SUPABASE_URL || runtimeEnv.SUPABASE_URL;
    const supabaseAnonKey = runtimeEnv.PUBLIC_SUPABASE_ANON_KEY || runtimeEnv.SUPABASE_ANON_KEY;

    if (typeof globalThis !== 'undefined' && runtimeEnv) {
      (globalThis as any).env = {
        ...((globalThis as any).env || {}),
        ...runtimeEnv,
        // Ensure they are normalized for modules that expect PUBLIC_ prefix
        PUBLIC_SUPABASE_URL: supabaseUrl,
        PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey
      };
    }

    // Bypass Webhooks
    if (url.pathname.includes('/api/payments/duitku/webhook')) {
      return next();
    }

    let supabase: any = null;
    try {
      const cookieHeader = request.headers.get('Cookie') || '';
      const cookieNames = cookieHeader.split(';').map(c => c.split('=')[0].trim());
      console.log(`[Middleware] Path: ${url.pathname}, Cookies found: ${cookieNames.join(', ') || 'NONE'}`);

      supabase = getServerClient(cookies, request, runtimeEnv);
    } catch (e) {
      console.error('[Middleware] Supabase Init Failed:', e);
    }

    locals.supabase = supabase;
    locals.getUser = async () => {
      if (!supabase) return null;
      try {
        const { data } = await supabase.auth.getUser();
        return data?.user || null;
      } catch (e) {
        return null;
      }
    };

    // Platform Configs
    let platformConfigs = { maintenance_mode: false, registration_enabled: true };
    if (supabase) {
      try {
        const { data: configs } = await supabase.from('platform_configs').select('*').eq('id', 1).single();
        if (configs) platformConfigs = configs;
      } catch (e) { }
    }

    const adminAccessToken = cookies.get('admin_access_token')?.value;
    const isMasterAdmin = adminAccessToken === (runtimeEnv.ADMIN_PASSCODE || 'admin123');
    locals.isMasterAdmin = isMasterAdmin;

    const user = await locals.getUser();
    let isAdmin = isMasterAdmin;

    if (user && supabase) {
      try {
        const { data: profile } = await supabase.from('profiles').select('role, is_banned').eq('id', user.id).single();

        // Handle Banned Users
        if (profile?.is_banned && !url.pathname.startsWith('/banned')) {
          console.warn(`[Middleware] Banned user detected: ${user.id}, redirecting to /banned`);

          return redirect('/banned');
        }

        if (profile?.role === 'admin' || isMasterAdmin) isAdmin = true;
      } catch (e) { }
    }
    locals.isAdmin = isAdmin;

    // ==========================================
    // DOMAIN & SUBDOMAIN ENGINE (SaaS Logic)
    // Updated: May 2, 2026 - Cloudflare Worker Proxy Support
    // ==========================================
    const hostname = request.headers.get('X-Forwarded-Host') || url.hostname;
    
    // Default system domain logic - Switched to Worker domain as requested
    let PRIMARY_DOMAIN = 'staging.weorbit.site';
    if (runtimeEnv.PUBLIC_SITE_URL) {
      try {
        PRIMARY_DOMAIN = new URL(runtimeEnv.PUBLIC_SITE_URL).hostname;
      } catch (e) {
        PRIMARY_DOMAIN = 'staging.weorbit.site';
      }
    }

    // Define your primary domains here (local and production)
    const primaryDomains = [
      'localhost',
      '127.0.0.1',
      'staging.weorbit.site',
      'weorbit.site',
      'tepak-id.tepak-web.workers.dev',
      'tepakiid.weldn-dev-002.workers.dev',
      PRIMARY_DOMAIN
    ];

    const isPrimaryDomain = primaryDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));

    locals.detectedUser = null;
    locals.isCustomDomain = false;

    // 1. Resolve Identity
    if (supabase) {
      // A. Subdomain Logic (e.g., acep.tepak.id)
      const isSubdomain = primaryDomains.some(pd => hostname.endsWith('.' + pd) && hostname !== pd);

      if (isSubdomain) {
        const part = hostname.split('.')[0];
        if (part && part !== 'www' && part !== 'tepak' && part !== 'tepakid') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name, bio, avatar_url')
            .eq('username', part)
            .single();

          if (profile) {
            const { data: settings } = await supabase
              .from('user_settings')
              .select('seo_title, seo_description, seo_image, ga_id, fb_pixel_id')
              .eq('user_id', profile.id)
              .single();

            locals.detectedUser = {
              ...profile,
              seo_title: settings?.seo_title,
              seo_description: settings?.seo_description,
              og_image: settings?.seo_image,
              ga_id: settings?.ga_id,
              fb_pixel_id: settings?.fb_pixel_id
            };
            console.log(`[Middleware] Subdomain: ${part} -> ${profile.id}`);
          }
        }
      }
      else if (!primaryDomains.includes(hostname)) {
        console.log(`[Middleware] Custom Domain Detection for: ${hostname}`);
        const { data: settings, error: settingsError } = await supabase
          .from('user_settings')
          .select('user_id, domain_name, domain_verified, seo_title, seo_description, seo_image, ga_id, fb_pixel_id')
          .eq('domain_name', hostname)
          .single();

        if (settingsError) {
            console.error(`[Middleware] Domain Lookup Error for ${hostname}:`, settingsError.message);
        }

        if (settings) {
          console.log(`[Middleware] Domain Found! Verified: ${settings.domain_verified}, User: ${settings.user_id}`);
          
          if (settings.domain_verified) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, username, full_name, bio, avatar_url')
                .eq('id', settings.user_id)
                .single();

              if (profile) {
                locals.detectedUser = {
                  ...profile,
                  seo_title: settings.seo_title,
                  seo_description: settings.seo_description,
                  og_image: settings.seo_image,
                  ga_id: settings.ga_id,
                  fb_pixel_id: settings.fb_pixel_id
                };
                locals.isCustomDomain = true;
                console.log(`[Middleware] Custom Domain Resolved: ${hostname} -> ${profile.username}`);
              } else {
                console.warn(`[Middleware] Settings found for ${hostname} but Profile missing or blocked by RLS!`);
              }
          } else {
            console.warn(`[Middleware] Domain ${hostname} found but NOT VERIFIED.`);
          }
        } else {
          console.warn(`[Middleware] No settings found for domain: ${hostname}`);
        }
      }
    }

    // ==========================================
    // ROUTE CONFIGURATION & SECURITY
    // ==========================================
    const publicAuthRoutes = ['/login', '/signup', '/forgot-password', '/verify-email'];
    const protectedRoutes = [
      '/dashboard', '/orders', '/products', '/customers', '/wallet', '/settings',
      '/profile', '/withdraw', '/domain-settings', '/seo-settings', '/admin',
      '/withdrawal-details', '/bank-info', '/plan-info', '/add-product', '/edit-product',
      '/onboarding'
    ];

    const isAuthRoute = publicAuthRoutes.includes(url.pathname);
    const isProtectedRoute = protectedRoutes.some(route =>
      url.pathname === route || url.pathname.startsWith(route + '/')
    );

    // 1. SaaS Security: Force System Routes to Primary Domain
    const isSystemRoute = isAuthRoute || isProtectedRoute;
    if (locals.isCustomDomain && isSystemRoute) {
      console.log(`[Middleware] Redirecting system route ${url.pathname} from custom domain to primary`);
      const primaryUrl = new URL(url.pathname + url.search, runtimeEnv.PUBLIC_SITE_URL || `https://${PRIMARY_DOMAIN}`);
      return redirect(primaryUrl.toString());
    }

    // ==========================================
    // AUTHENTICATION PROTECTION
    // ==========================================

    // 1. Jika sudah login dan mencoba akses halaman login/signup -> Lempar ke dashboard
    if (isAuthRoute && user) {
      console.log(`[Middleware] User ${user.email} already logged in, redirecting from ${url.pathname} to /dashboard`);
      return redirect('/dashboard');
    }

    // 2. Jika belum login dan akses rute terproteksi -> Lempar ke login
    if (isProtectedRoute && !user) {
      console.log(`[Middleware] Unauthorized access to ${url.pathname}, redirecting to /login`);
      return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
    }

    // Maintenance logic
    if (platformConfigs.maintenance_mode && !isAdmin && url.pathname !== '/maintenance' && !url.pathname.startsWith('/api')) {
      return redirect('/maintenance');
    }

    return next();
  } catch (err) {
    console.error('[Middleware Critical Error]:', err);
    return next();
  }
});
