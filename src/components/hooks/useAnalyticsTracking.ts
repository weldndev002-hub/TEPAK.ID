import { useEffect } from 'react';
import { trackPageView } from '../../lib/analytics';

/**
 * Hook untuk auto-track page views
 * Gunakan di setiap halaman atau layout utama
 */
export const useAnalyticsTracking = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pathname = window.location.pathname;
    
    // Daftar halaman internal yang TIDAK boleh dilacak views-nya
    const excludedPaths = [
      '/dashboard',
      '/admin',
      '/settings',
      '/orders',
      '/products',
      '/wallet',
      '/withdraw',
      '/bank-info',
      '/add-product',
      '/edit-product',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/reset-sent',
      '/onboarding',
      '/verify-email',
      '/uikit',
      '/demo',
      '/api'
    ];

    // Cek apakah halaman saat ini diawali dengan salah satu excludedPaths
    const isExcluded = excludedPaths.some(path => 
      pathname === path || pathname.startsWith(path + '/')
    );

    if (isExcluded) {
      console.debug('[Analytics] Skipping internal path:', pathname);
      return;
    }

    // Track page view only for public pages
    trackPageView();
  }, []);
};

export default useAnalyticsTracking;
