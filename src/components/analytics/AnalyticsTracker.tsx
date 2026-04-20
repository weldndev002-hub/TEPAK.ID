import { useEffect } from 'react';

interface AnalyticsTrackerProps {
    merchantId: string;
    productId?: string;
    eventType?: 'view' | 'click' | 'page_view';
}

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ 
    merchantId, 
    productId, 
    eventType = 'page_view' 
}) => {
    useEffect(() => {
        const trackEvent = async (type: string = eventType) => {
            if (typeof window === 'undefined') return;

            // DEDUPLICATION LOGIC: Prevent counting multiple times in the same session
            const path = window.location.pathname;
            const trackKey = `track_${merchantId}_${productId || 'profile'}_${type}_${path}`;
            const hasTracked = sessionStorage.getItem(trackKey);

            if (hasTracked) {
                // Already tracked in this session, skip
                return;
            }

            // Simple Device & Browser Detection
            const ua = navigator.userAgent;
            let deviceType = 'desktop';
            if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
            else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

            let browser = 'other';
            if (ua.includes('Chrome')) browser = 'chrome';
            else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'safari';
            else if (ua.includes('Firefox')) browser = 'firefox';
            else if (ua.includes('Edg')) browser = 'edge';

            // Map 'view' to 'page_view' for DB compatibility
            const finalType = type === 'view' ? 'page_view' : type;

            try {
                const response = await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        merchant_id: merchantId,
                        product_id: productId,
                        event_type: finalType,
                        path: path,
                        browser,
                        device_type: deviceType,
                        referrer: document.referrer || ''
                    })
                });
                
                if (response.ok) {
                    // Mark as tracked in this session
                    sessionStorage.setItem(trackKey, 'true');
                    console.log('[Analytics] Tracked successfully:', finalType);
                }
            } catch (err) {
                console.warn('[Analytics] Tracking failed:', err);
            }
        };

        if (eventType === 'page_view' || eventType === 'view') {
            const timer = setTimeout(() => trackEvent('page_view'), 1000);
            return () => clearTimeout(timer);
        } else if (eventType === 'click') {
            trackEvent('click');
        }
    }, [merchantId, productId, eventType]);

    return null;
};

export default AnalyticsTracker;
