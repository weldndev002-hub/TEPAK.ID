import { defineMiddleware } from 'astro:middleware';
import { getServerClient } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, cookies, request, redirect } = context;
  try {
    const url = new URL(request.url);
    
    // Capture Environment - Safe detection for Astro/Cloudflare
    let runtimeEnv: Record<string, any> = { ...(import.meta.env || {}) };
    try {
      // 1. Try context.locals.runtime (Older/Standard Astro pattern)
      // @ts-ignore
      if (context.locals?.runtime?.env) {
        runtimeEnv = { ...runtimeEnv, ...context.locals.runtime.env };
      } 
      // 2. Try direct import (Modern Cloudflare standard)
      else {
        try {
          // @ts-ignore
          const cf = await import('cloudflare:workers');
          if (cf?.env) {
            runtimeEnv = { ...runtimeEnv, ...cf.env };
          }
        } catch (e) {}
      }
    } catch (e) { }

    // Inject into globalThis for modules like lib/supabase.ts to pick up
    if (typeof globalThis !== 'undefined' && runtimeEnv) {
      (globalThis as any).env = { ...((globalThis as any).env || {}), ...runtimeEnv };
    }

    // Bypass Webhooks
    if (url.pathname.includes('/api/payments/duitku/webhook')) {
      return next();
    }
    
    let supabase: any = null;
    try {
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
        if (profile?.role === 'admin' || isMasterAdmin) isAdmin = true;
      } catch (e) {}
    }
    locals.isAdmin = isAdmin;

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
