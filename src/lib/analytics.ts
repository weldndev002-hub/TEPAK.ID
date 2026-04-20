import { supabase } from './supabase';

export interface TrackEventOptions {
  eventType?: 'page_view' | 'click' | 'add_to_cart' | 'purchase' | 'conversion' | 'view';
  trafficSource?: 'direct' | 'social' | 'search' | 'referral' | 'email' | 'other';
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  productId?: string;
  path?: string;
  metadata?: Record<string, any>;
}

/**
 * Detect traffic source dari referrer atau custom parameter
 */
function detectTrafficSource(): string {
  if (typeof window === 'undefined') return 'direct';

  const referrer = document.referrer;
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source');

  // Check UTM parameter
  if (utm_source) {
    if (utm_source.includes('google')) return 'search';
    if (utm_source.includes('facebook') || utm_source.includes('instagram') || utm_source.includes('tiktok')) return 'social';
    if (utm_source.includes('email')) return 'email';
  }

  // Check referrer
  if (referrer) {
    if (referrer.includes('google') || referrer.includes('bing') || referrer.includes('duckduckgo')) return 'search';
    if (referrer.includes('facebook') || referrer.includes('instagram') || referrer.includes('tiktok') || referrer.includes('twitter')) return 'social';
    if (referrer.includes('linkedin')) return 'referral';
    return 'referral';
  }

  return 'direct';
}

/**
 * Detect device type dari user agent
 */
function detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk|(android(?!.*mobi|.*opera(?!.* mobi)))/.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Detect browser name
 */
function detectBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  
  return 'Other';
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  const SESSION_KEY = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Track analytics event (untuk authenticated users)
 */
export async function trackAnalyticsEvent(options: TrackEventOptions = {}) {
  try {
    // Get current user
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const excludedPaths = [
        '/dashboard', '/admin', '/settings', '/orders', '/products', 
        '/wallet', '/withdraw', '/bank-info', '/add-product', '/edit-product', 
        '/login', '/signup', '/forgot-password', '/reset-password', '/reset-sent', 
        '/onboarding', '/verify-email', '/uikit', '/demo', '/api'
      ];
      
      const isExcluded = excludedPaths.some(path => 
        pathname === path || pathname.startsWith(path + '/')
      );

      if (isExcluded) {
        return; // Silent return for internal paths
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.debug('[Analytics] No user authenticated, skipping event');
      return;
    }

    const merchantId = session.user.id;
    const eventType = options.eventType || 'page_view';
    const trafficSource = options.trafficSource || detectTrafficSource();
    const deviceType = options.deviceType || detectDeviceType();
    const browser = detectBrowser();
    const sessionId = getSessionId();

    // Get geolocation (simplified - you can use a geo IP service for production)
    let country = 'ID'; // Default Indonesia
    if (typeof navigator !== 'undefined' && (navigator as any).language) {
      const lang = (navigator as any).language;
      if (lang.includes('in')) country = 'ID';
      else if (lang.includes('ms')) country = 'MY';
      else if (lang.includes('zh')) country = 'CN';
      else if (lang.includes('en')) country = 'US';
    }

    console.log('[Analytics] Preparing event:', {
      merchantId,
      eventType,
      trafficSource,
      deviceType,
      browser,
      country,
      sessionId
    });

    // Insert event to database
    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        merchant_id: merchantId,
        product_id: options.productId || null,
        event_type: eventType,
        traffic_source: trafficSource,
        device_type: deviceType,
        browser: browser,
        country: country,
        city: 'Unknown',
        session_id: sessionId,
        path: options.path || (typeof window !== 'undefined' ? window.location.pathname : null),
        referrer: typeof document !== 'undefined' ? document.referrer : null,
      });

    if (error) {
      console.error('[Analytics] Insert error:', error);
      console.error('[Analytics] Error details:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code
      });
    } else {
      console.log(`[Analytics] ✅ Event tracked successfully: ${eventType} from ${trafficSource}`);
      console.log('[Analytics] Response:', data);
    }
  } catch (err) {
    console.error('[Analytics] Tracking failed:', err);
  }
}

/**
 * Track page view (auto-called)
 */
export function trackPageView() {
  trackAnalyticsEvent({ eventType: 'page_view' });
}

/**
 * Track click event
 */
export function trackClick(label?: string) {
  trackAnalyticsEvent({ eventType: 'click', metadata: { label } });
}

/**
 * Track add to cart
 */
export function trackAddToCart(productId: string, productName: string, price: number) {
  trackAnalyticsEvent({
    eventType: 'add_to_cart',
    metadata: { productId, productName, price },
  });
}

/**
 * Track purchase
 */
export function trackPurchase(orderId: string, amount: number) {
  trackAnalyticsEvent({
    eventType: 'purchase',
    metadata: { orderId, amount },
  });
}
