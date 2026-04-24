-- ==============================================================================
-- SUBSCRIPTION PLANS MANAGEMENT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY, -- 'free', 'pro', 'enterprise'
    name TEXT NOT NULL,
    badge TEXT,
    price_monthly NUMERIC DEFAULT 0,
    price_yearly NUMERIC DEFAULT 0,
    description TEXT,
    features TEXT[] DEFAULT '{}', -- Human readable feature list
    config JSONB DEFAULT '{}', -- Technical config: { "allowed_blocks": [...], "limits": {...} }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can view active plans, only Admin can manage
CREATE POLICY "Public can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
-- Admins can manage all subscription plans
CREATE POLICY "Admins can manage all subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seed Initial Data
INSERT INTO public.subscription_plans (id, name, badge, price_monthly, price_yearly, description, features, config)
VALUES 
('free', 'Standard Plan', 'DEFAULT', 0, 0, 'Essential features for creators starting their digital journey.', 
 ARRAY['Landing Page Builder', 'Basic Analytics', 'Unlimited Links'], 
 '{"allowed_blocks": ["hero", "about", "testimonial", "faq", "gallery"], "can_direct_order": false}'),
('pro', 'PRO Plan', 'POPULAR', 29000, 290000, 'Advanced tools, deeper analytics, and premium integrations.', 
 ARRAY['All Standard Features', 'Custom Domain (CNAME)', 'Digital Product Sales', 'WhatsApp Notification', 'Facebook Pixel & GA4'], 
 '{"allowed_blocks": ["hero", "about", "testimonial", "faq", "gallery", "video", "countdown", "pricing", "order_form", "whatsapp_btn", "pixel_tracking", "custom_code"], "can_direct_order": true}');

-- Update Trigger
CREATE TRIGGER set_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
