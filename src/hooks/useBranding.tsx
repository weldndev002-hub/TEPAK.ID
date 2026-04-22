import React, { createContext, useContext, useEffect, useState } from 'react';

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

export const BrandingProvider: React.FC<{ children: React.ReactNode; initialData?: BrandingData | null }> = ({ children, initialData }) => {
  const [branding, setBranding] = useState<BrandingData | null>(initialData || null);
  const [loading, setLoading] = useState(!branding);

  const fetchBranding = async () => {
    try {
      // 1. Initial load from props or injected variable
      const injected = typeof window !== 'undefined' ? (window as any).__PLATFORM_BRANDING__ : null;
      const initial = initialData || injected;
      
      if (initial && (!branding || JSON.stringify(branding) !== JSON.stringify(initial))) {
        setBranding(initial);
      }

      // 2. Try to load from cache second (only if no initial data)
      if (!initial) {
        const cached = localStorage.getItem('platform_branding');
        if (cached && !branding) {
          setBranding(JSON.parse(cached));
        }
      }

      // 3. Always fetch from API in background to ensure freshness
      const res = await fetch('/api/public/settings');
      if (res.ok) {
        const data = await res.json();
        setBranding(data);
        localStorage.setItem('platform_branding', JSON.stringify(data));
      }
    } catch (err) {
      console.error('[Branding Context] Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  
  if (context === undefined) {
    // Return a safe default with injected branding if available
    let injectedBranding = null;
    if (typeof window !== 'undefined') {
        injectedBranding = (window as any).__PLATFORM_BRANDING__;
    }
    
    return { 
        branding: injectedBranding, 
        loading: false, 
        refreshBranding: async () => {} 
    };
  }
  return context;
};
