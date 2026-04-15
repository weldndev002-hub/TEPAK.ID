import { useEffect } from 'react';
import { trackPageView } from '../../lib/analytics';

/**
 * Hook untuk auto-track page views
 * Gunakan di setiap halaman atau layout utama
 */
export const useAnalyticsTracking = () => {
  useEffect(() => {
    // Track page view when component mounts
    trackPageView();
  }, []);
};

export default useAnalyticsTracking;
