import { defineMiddleware } from 'astro:middleware';
import { getServerClient } from './lib/supabase';

let runtimeEnv: any = {};
try {
  // @ts-ignore
  const { env } = await import('cloudflare:workers');
  runtimeEnv = env;
} catch (e) {
  // Fallback to import.meta.env for local development
  runtimeEnv = import.meta.env;
}

export const onRequest = defineMiddleware(async ({ locals, cookies, request, redirect }, next) => {
  const url = new URL(request.url);
  
  // BYPASS: Jangan memblokir Webhook Duitku (harus bisa dihubungi server luar)
  if (url.pathname.includes('/api/payments/duitku/webhook')) {
    return next();
  }
  
  let supabase: any;
  try {
    supabase = getServerClient(cookies, request, runtimeEnv);
  } catch (e) {
    console.error('[Middleware] Supabase Init Failed:', e);
    // Return early or continue with dummy if it's not a protected page
    // But for safety, we let it throw if it's a critical error
    supabase = null;
  }

  // Set supabase and getUser in locals for use in .astro files
  locals.supabase = supabase;
  locals.getUser = async () => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data) return null;
      return data.user;
    } catch (e) {
      console.error('[Middleware] getUser error:', e);
      return null;
    }
  };

  // Fetch Platform Configs (Maintenance & Registration Toggles)
  let platformConfigs = { maintenance_mode: false, registration_enabled: true };
  if (supabase) {
    try {
      const { data: configs } = await supabase
        .from('platform_configs')
        .select('maintenance_mode, registration_enabled')
        .eq('id', 1)
        .single();
      if (configs) platformConfigs = configs;
    } catch (e) {
      console.error('[Middleware] Config fetch error:', e);
    }
  }

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/callback'].includes(url.pathname);
  const isAdminGate = url.pathname === '/admin/auth';
  
  // Master Admin Passcode Check
  const adminAccessToken = cookies.get('admin_access_token')?.value;
  const MASTER_PASSCODE = import.meta.env.ADMIN_PASSCODE || 'admin123';
  const isMasterAdmin = adminAccessToken === MASTER_PASSCODE;

  // Set in locals
  locals.isMasterAdmin = isMasterAdmin;

  // Define protected prefixes
  const protectedPrefixes = [
    '/dashboard', 
    '/admin', 
    '/settings', 
    '/products', 
    '/orders', 
    '/customers', 
    '/wallet', 
    '/academy',
    '/account-management',
    '/analytics',
    '/bank-info',
    '/domain-settings',
    '/seo-settings',
    '/add-product',
    '/edit-product'
  ];
  
  const isProtectedPage = protectedPrefixes.some(prefix => url.pathname.startsWith(prefix));

  const user = await locals.getUser();
  let isBanned = false;
  let isAdmin = isMasterAdmin;

  if (user && supabase) {
    const { data: profile, error: pError } = await supabase
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
  } else {
    locals.isAdmin = isMasterAdmin;
  }

  // --- MAINTENANCE MODE CHECK ---
  if (platformConfigs.maintenance_mode && !isAdmin && url.pathname !== '/maintenance' && !url.pathname.startsWith('/api')) {
    const returnUrl = encodeURIComponent(url.pathname + url.search);
    return redirect(`/maintenance?redirect_to=${returnUrl}`);
  }

  // --- REGISTRATION TOGGLE CHECK ---
  if (url.pathname === '/signup' && !platformConfigs.registration_enabled && !isAdmin) {
    return redirect('/login?error=registration_disabled');
  }

  // Redirect logic
  if (isProtectedPage && !isAdminGate) {
    // If accessing /admin, allow if Master Admin OR Logged In Admin
    if (url.pathname.startsWith('/admin')) {
        if (isMasterAdmin) return next(); // Full bypass for master
        if (!user) return redirect('/admin/auth');
        
        // Final role check for admin pages
        if (supabase) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single();
              
            if (profile?.role !== 'admin' && !isMasterAdmin) {
              return redirect('/dashboard');
            }
        }
    }

    if (!user && !isMasterAdmin) {
      return redirect('/login');
    }

    // FINAL FAILSAFE
    const isAccessingAdmin = url.pathname.startsWith('/admin');
    const shouldBypass = isMasterAdmin && isAccessingAdmin;

    if (isBanned && !shouldBypass && url.pathname !== '/banned') {
      return redirect('/banned');
    }
  }

  if (isAuthPage && user && !isBanned) {
    return redirect('/dashboard');
  }

  return next();
});
