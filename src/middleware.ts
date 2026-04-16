import { defineMiddleware } from 'astro:middleware';
import { getServerClient } from './lib/supabase';

export const onRequest = defineMiddleware(async ({ locals, cookies, request, redirect }, next) => {
  const supabase = getServerClient(cookies, request);

  // Set supabase and getUser in locals for use in .astro files
  locals.supabase = supabase;
  locals.getUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data) return null;
      return data.user;
    } catch (e) {
      console.error('[Middleware] getUser error:', e);
      return null;
    }
  };

  const url = new URL(request.url);
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

  if (user) {
    // ... logic for banned users ...
    if (isMasterAdmin) {
        isBanned = false;
    } else {
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('is_banned, role, settings:user_settings(plan_status)')
          .eq('id', user.id)
          .single();
        
        const settings = Array.isArray(profile?.settings) ? profile?.settings[0] : profile?.settings;
        const isAdminRole = profile?.role === 'admin';
        const isBannedFlag = profile?.is_banned || settings?.plan_status === 'banned';
        
        isBanned = isBannedFlag && !isAdminRole && !isMasterAdmin;
    }
  }

  // Redirect logic
  if (isProtectedPage && !isAdminGate) {
    // If accessing /admin, allow if Master Admin OR Logged In Admin
    if (url.pathname.startsWith('/admin')) {
        if (isMasterAdmin) return next(); // Full bypass for master
        if (!user) return redirect('/admin/auth');
        
        // Final role check for admin pages
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (profile?.role !== 'admin' && !isMasterAdmin) {
          return redirect('/dashboard');
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
