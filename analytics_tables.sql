-- Analytics Tables untuk Pro Performance Insights
-- Jalankan script ini di Supabase SQL Editor
-- ==============================================================================

-- Drop tables if exists (untuk reset clean)
DROP TABLE IF EXISTS public.analytics_daily_summary CASCADE;
DROP TABLE IF EXISTS public.analytics_conversions CASCADE;
DROP TABLE IF EXISTS public.analytics_events CASCADE;

-- ==============================================================================
-- 1. Tabel untuk mencatat traffic events
-- ==============================================================================
CREATE TABLE public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'page_view',
  traffic_source TEXT NOT NULL DEFAULT 'direct',
  device_type TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT DEFAULT 'unknown',
  country TEXT DEFAULT 'ID',
  city TEXT DEFAULT 'Unknown',
  session_id TEXT,
  visitor_ip TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT event_type_check CHECK (event_type IN ('page_view', 'click', 'add_to_cart', 'purchase', 'conversion')),
  CONSTRAINT traffic_source_check CHECK (traffic_source IN ('direct', 'social', 'search', 'referral', 'email', 'other')),
  CONSTRAINT device_type_check CHECK (device_type IN ('desktop', 'mobile', 'tablet'))
);

-- ==============================================================================
-- 2. Tabel untuk mencatat konversi & funnel
-- ==============================================================================
CREATE TABLE public.analytics_conversions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  visit_count INTEGER DEFAULT 1,
  page_views INTEGER DEFAULT 1,
  funnel_stage TEXT DEFAULT 'visit',
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint
  CONSTRAINT funnel_stage_check CHECK (funnel_stage IN ('visit', 'view_product', 'add_cart', 'checkout', 'paid'))
);

-- ==============================================================================
-- 3. Tabel untuk stats harian (untuk performa query)
-- ==============================================================================
CREATE TABLE public.analytics_daily_summary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  device_desktop INTEGER DEFAULT 0,
  device_mobile INTEGER DEFAULT 0,
  device_tablet INTEGER DEFAULT 0,
  UNIQUE(merchant_id, date)
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_summary ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES - Allow creators to view their own data
-- ==============================================================================
-- Analytics Events Policies
CREATE POLICY "analytics_events_select" ON public.analytics_events 
  FOR SELECT USING (auth.uid() = merchant_id);

CREATE POLICY "analytics_events_insert" ON public.analytics_events 
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- Analytics Conversions Policies
CREATE POLICY "analytics_conversions_select" ON public.analytics_conversions 
  FOR SELECT USING (auth.uid() = merchant_id);

CREATE POLICY "analytics_conversions_insert" ON public.analytics_conversions 
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- Analytics Daily Summary Policies
CREATE POLICY "analytics_daily_select" ON public.analytics_daily_summary 
  FOR SELECT USING (auth.uid() = merchant_id);

CREATE POLICY "analytics_daily_insert" ON public.analytics_daily_summary 
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- ==============================================================================
-- CREATE INDEXES untuk performa query
-- ==============================================================================
CREATE INDEX idx_analytics_events_merchant_date ON public.analytics_events(merchant_id, created_at DESC);
CREATE INDEX idx_analytics_events_traffic_source ON public.analytics_events(merchant_id, traffic_source);
CREATE INDEX idx_analytics_events_country ON public.analytics_events(merchant_id, country);
CREATE INDEX idx_analytics_events_device ON public.analytics_events(merchant_id, device_type);
CREATE INDEX idx_analytics_conversions_merchant_date ON public.analytics_conversions(merchant_id, created_at DESC);
CREATE INDEX idx_analytics_daily_merchant_date ON public.analytics_daily_summary(merchant_id, date DESC);

-- ==============================================================================
-- Helper Function: Auto-update timestamp
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analytics_conversions_set_updated_at 
  BEFORE UPDATE ON public.analytics_conversions 
  FOR EACH ROW EXECUTE PROCEDURE public.set_analytics_updated_at();

-- ==============================================================================
-- SUCCESS MESSAGE
-- ==============================================================================
-- Analytics tables created successfully!
-- Tables: analytics_events, analytics_conversions, analytics_daily_summary
-- RLS: Enabled for all tables
-- Indexes: Created for optimal query performance
