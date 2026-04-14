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
        const trackEvent = async () => {
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
                        event_type: eventType,
                        path: window.location.pathname,
                        browser,
                        os,
                        device_type: deviceType
                    })
                });
            } catch (err) {
                // Silently fail to not disturb user experience
                console.warn('[Analytics] Tracking failed:', err);
            }
        };

        // Delay tracking slightly to prioritize page load
        const timer = setTimeout(trackEvent, 1000);
        return () => clearTimeout(timer);
    }, [merchantId, productId, eventType]);

    return null;
};

export default AnalyticsTracker;
