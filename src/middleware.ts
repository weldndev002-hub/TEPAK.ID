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
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
    }
    locals.isAdmin = isAdmin;

    // ==========================================
    // DOMAIN & SUBDOMAIN ENGINE
    // ==========================================
    const hostname = url.hostname;
    // Define your primary domains here (local and production)
    const primaryDomains = [
        'localhost', 
        '127.0.0.1', 
        'tepak.id', 
        'tepakid.weldn-dev-002.workers.dev'
    ];
    
    const isPrimaryDomain = primaryDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    
    locals.detectedUser = null;
    locals.isCustomDomain = false;

    // If it's NOT a primary domain, it's a candidate for Custom Domain
    if (!primaryDomains.includes(hostname) && supabase) {
        // 1. Check if it's a Subdomain (e.g., acep.tepak.id)
        const isSubdomain = primaryDomains.some(pd => hostname.endsWith('.' + pd));
        
        if (isSubdomain) {
            const part = hostname.split('.')[0];
            if (part && part !== 'www') {
                const { data: profile } = await supabase.from('profiles').select('id, username').eq('username', part).single();
                if (profile) {
                    locals.detectedUser = profile;
                    console.log(`[Middleware] Subdomain detected: ${part} -> user ${profile.id}`);
                }
            }
        } 
        // 2. Check if it's a Custom Domain (e.g., mybrand.com)
        else {
            const { data: settings } = await supabase
                .from('user_settings')
                .select('user_id, profiles!inner(id, username)')
                .eq('domain_name', hostname)
                .single();
            
            if (settings) {
                locals.detectedUser = settings.profiles;
                locals.isCustomDomain = true;
                console.log(`[Middleware] Custom Domain detected: ${hostname} -> user ${settings.user_id}`);
            }
        }
    }

    // ==========================================
    // AUTHENTICATION PROTECTION
    // ==========================================
    const publicAuthRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
    const isAuthRoute = publicAuthRoutes.includes(url.pathname);

    const protectedRoutes = [
      '/dashboard',
      '/orders',
      '/products',
      '/customers',
      '/wallet',
      '/settings',
      '/profile',
      '/withdraw',
      '/domain-settings',
      '/seo-settings',
      '/admin',
      '/withdrawal-details',
      '/bank-info',
      '/plan-info',
      '/add-product',
      '/edit-product'
    ];

    const isProtectedRoute = protectedRoutes.some(route => 
      url.pathname === route || url.pathname.startsWith(route + '/')
    );

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
