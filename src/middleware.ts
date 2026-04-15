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

  // Redirect logic
  if (isProtectedPage && !user) {
    return redirect('/login');
  }

  if (isAuthPage && user) {
    return redirect('/dashboard');
  }

  return next();
});
