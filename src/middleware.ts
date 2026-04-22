import { defineMiddleware } from 'astro:middleware';
import { getServerClient } from './lib/supabase';

export const onRequest = defineMiddleware(async ({ locals, cookies, request, redirect }, next) => {
  try {
    const url = new URL(request.url);
    
    // Capture Environment
    const runtime = (locals as any).runtime;
    let runtimeEnv: Record<string, any> = runtime?.env || {};
    
    if (!runtimeEnv.PUBLIC_SUPABASE_URL) {
      // @ts-ignore
      runtimeEnv = import.meta.env || {};
    }

    // BYPASS: Jangan memblokir Webhook Duitku
    if (url.pathname.includes('/api/payments/duitku/webhook')) {
      return next();
    }
    
    let supabase: any;
    try {
      supabase = getServerClient(cookies, request, runtimeEnv);
    } catch (e) {
      supabase = null;
    }

    // Set supabase and getUser in locals
    locals.supabase = supabase;
    locals.getUser = async () => {
      if (!supabase) return null;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data) return null;
        return data.user;
      } catch (e) {
        return null;
      }
    };

    // Fetch Platform Configs
    let platformConfigs = { maintenance_mode: false, registration_enabled: true };
    if (supabase) {
      try {
        const { data: configs } = await supabase
          .from('platform_configs')
          .select('maintenance_mode, registration_enabled')
          .eq('id', 1)
          .single();
        if (configs) platformConfigs = configs;
      } catch (e) {}
    }

    const isAuthPage = ['/login', '/signup', '/forgot-password', '/callback'].includes(url.pathname);
    const isAdminGate = url.pathname === '/admin/auth';
    
    // Master Admin Passcode Check
    const adminAccessToken = cookies.get('admin_access_token')?.value;
    const MASTER_PASSCODE = runtimeEnv.ADMIN_PASSCODE || 'admin123';
    const isMasterAdmin = adminAccessToken === MASTER_PASSCODE;

    locals.isMasterAdmin = isMasterAdmin;

    const protectedPrefixes = ['/dashboard', '/admin', '/settings', '/products', '/orders', '/customers', '/wallet', '/academy', '/account-management', '/analytics', '/bank-info', '/domain-settings', '/seo-settings', '/add-product', '/edit-product'];
    const isProtectedPage = protectedPrefixes.some(prefix => url.pathname.startsWith(prefix));

    const user = await locals.getUser();
    let isBanned = false;
    let isAdmin = isMasterAdmin;

    if (user && supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_banned, role, settings:user_settings(plan_status)')
          .eq('id', user.id)
          .single();
        
        const settings = Array.isArray(profile?.settings) ? profile?.settings[0] : profile?.settings;
        const isAdminRole = profile?.role === 'admin';
        const isBannedFlag = profile?.is_banned || settings?.plan_status === 'banned';
        
        isBanned = isBannedFlag && !isAdminRole && !isMasterAdmin;
        isAdmin = isAdminRole || isMasterAdmin;
        locals.isAdmin = isAdmin;
      } catch (e) {}
    } else {
      locals.isAdmin = isMasterAdmin;
    }

    if (platformConfigs.maintenance_mode && !isAdmin && url.pathname !== '/maintenance' && !url.pathname.startsWith('/api')) {
      const returnUrl = encodeURIComponent(url.pathname + url.search);
      return redirect(`/maintenance?redirect_to=${returnUrl}`);
    }

    if (url.pathname === '/signup' && !platformConfigs.registration_enabled && !isAdmin) {
      return redirect('/login?error=registration_disabled');
    }

    if (isProtectedPage && !isAdminGate) {
      if (url.pathname.startsWith('/admin')) {
          if (isMasterAdmin) return next();
          if (!user) return redirect('/admin/auth');
          if (supabase) {
              const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
              if (profile?.role !== 'admin' && !isMasterAdmin) return redirect('/dashboard');
          }
      }
      if (!user && !isMasterAdmin) return redirect('/login');
      if (isBanned && url.pathname !== '/banned') return redirect('/banned');
    }

    if (isAuthPage && user && !isBanned) return redirect('/dashboard');

    return next();
  } catch (criticalError) {
    console.error('[Middleware Critical Failure]:', criticalError);
    return next(); // Fail gracefully to let the page try to load
  }
});
