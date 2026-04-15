import { useEffect } from 'react';

interface AnalyticsTrackerProps {
    merchantId: string;
    productId?: string;
    eventType?: 'view' | 'click';
}

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ 
    merchantId, 
    productId, 
    eventType = 'view' 
}) => {
    useEffect(() => {
        const trackEvent = async (type: string = eventType) => {
            if (typeof window === 'undefined') return;

            // Simple Device & Browser Detection
            const ua = navigator.userAgent;
            let deviceType = 'Desktop';
            if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
            else if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';

            let browser = 'Other';
            if (ua.includes('Chrome')) browser = 'Chrome';
            else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
            else if (ua.includes('Firefox')) browser = 'Firefox';
            else if (ua.includes('Edg')) browser = 'Edge';

            let os = 'Unknown';
            if (ua.includes('Win')) os = 'Windows';
            else if (ua.includes('Mac')) os = 'MacOS';
            else if (ua.includes('Linux')) os = 'Linux';
            else if (ua.includes('Android')) os = 'Android';
            else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        merchant_id: merchantId,
                        product_id: productId,
                        event_type: type,
                        path: window.location.pathname,
                        browser,
                        os,
                        device_type: deviceType
                    })
                });
                console.log('[Analytics] Tracked:', type);
            } catch (err) {
                // Silently fail to not disturb user experience
                console.warn('[Analytics] Tracking failed:', err);
            }
        };

        if (eventType === 'view') {
            // Track page view with delay
            const timer = setTimeout(() => trackEvent('view'), 1000);
            return () => clearTimeout(timer);
        } else if (eventType === 'click') {
            // For clicks - track immediately
            trackEvent('click');
        }
    }, [merchantId, productId, eventType]);

    return null;
};

export default AnalyticsTracker;
