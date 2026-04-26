import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

export interface BrandingData {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  payouts_enabled: boolean;
  support_email: string;
  whatsapp_number: string;
  office_address: string;
  seo_description: string;
}

interface BrandingContextType {
  branding: BrandingData | null;
  loading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

// Cache TTL for branding data in milliseconds (5 minutes)
const BRANDING_CACHE_TTL = 5 * 60 * 1000;
const BRANDING_CACHE_KEY = 'platform_branding';
const BRANDING_CACHE_TIMESTAMP_KEY = 'platform_branding_timestamp';

export const BrandingProvider: React.FC<{ children: React.ReactNode; initialData?: BrandingData | null }> = ({ children, initialData }) => {
  const [branding, setBranding] = useState<BrandingData | null>(initialData || null);
  const [loading, setLoading] = useState(!branding);
  const [isMounted, setIsMounted] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchBranding = async () => {
    try {
      // 1. Initial load from props or injected variable
      const injected = typeof window !== 'undefined' ? (window as any).__PLATFORM_BRANDING__ : null;
      const initial = initialData || injected;

      if (initial && (!branding || JSON.stringify(branding) !== JSON.stringify(initial))) {
        setBranding(initial);
      }

      // 2. Check if cache is still fresh — skip API call if within TTL
      const cachedTimestamp = localStorage.getItem(BRANDING_CACHE_TIMESTAMP_KEY);
      const cachedData = localStorage.getItem(BRANDING_CACHE_KEY);
      if (cachedTimestamp && cachedData) {
        const age = Date.now() - parseInt(cachedTimestamp, 10);
        if (age < BRANDING_CACHE_TTL) {
          // Cache is fresh — use it and skip the API call
          if (!branding) {
            setBranding(JSON.parse(cachedData));
          }
          setLoading(false);
          return;
        }
      }

      // 3. Cache is stale or missing — fetch from API
      const res = await fetch('/api/public/settings');
      if (res.ok) {
        const data = await res.json();
        setBranding(data);
        localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(BRANDING_CACHE_TIMESTAMP_KEY, Date.now().toString());
      } else if (cachedData && !branding) {
        // API failed but we have stale cache — use it as fallback
        setBranding(JSON.parse(cachedData));
      }
    } catch (err) {
      console.error('[Branding Context] Fetch Error:', err);
      // On error, try to use cached data as fallback
      const cached = localStorage.getItem(BRANDING_CACHE_KEY);
      if (cached && !branding) {
        setBranding(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch once per provider mount
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchBranding();
    }
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (context === undefined) {
    // Return a safe default with injected branding if available
    let injectedBranding = null;

    // CRITICAL: Only use dynamic injected branding after mounting to avoid hydration mismatch
    if (typeof window !== 'undefined' && isMounted) {
      injectedBranding = (window as any).__PLATFORM_BRANDING__;
    }

    return {
      branding: injectedBranding,
      loading: false,
      refreshBranding: async () => { }
    };
  }
  return context;
};
