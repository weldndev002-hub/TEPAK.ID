-- ==============================================================================
-- ADD AA PLAN TO SUBSCRIPTION PLANS
-- This migration adds the 'aa' plan if it doesn't exist, with all PRO features
-- ==============================================================================

-- Insert AA plan if it doesn't exist
INSERT INTO public.subscription_plans (
    id,
    name,
    badge,
    price_monthly,
    price_yearly,
    description,
    features,
    config,
    is_active,
    tier_category,
    tier_description
)
SELECT
    'aa',
    'AA Plan',
    'PREMIUM',
    50000,  -- Adjust price as needed
    500000, -- Adjust yearly price as needed
    'Advanced plan with all premium features including digital product sales.',
    ARRAY[
        'All Standard Features',
        'Custom Domain (CNAME)',
        'Digital Product Sales',
        'WhatsApp Notification',
        'Facebook Pixel & GA4',
        'Analytics',
        'Customer Management',
        'Priority Support'
    ],
    '{"allowed_blocks": ["hero", "about", "testimonial", "faq", "gallery", "video", "countdown", "pricing", "order_form", "whatsapp_btn", "pixel_tracking", "custom_code"], "can_direct_order": true}',
    true,
    'Professional',
    'Advanced plan with full access to all premium features.'
WHERE NOT EXISTS (
    SELECT 1 FROM public.subscription_plans WHERE id = 'aa'
);

-- If AA plan already exists but is missing features, update it
UPDATE public.subscription_plans
SET
    features = ARRAY[
        'All Standard Features',
        'Custom Domain (CNAME)',
        'Digital Product Sales',
        'WhatsApp Notification',
        'Facebook Pixel & GA4',
        'Analytics',
        'Customer Management',
        'Priority Support'
    ],
    config = '{"allowed_blocks": ["hero", "about", "testimonial", "faq", "gallery", "video", "countdown", "pricing", "order_form", "whatsapp_btn", "pixel_tracking", "custom_code"], "can_direct_order": true}',
    is_active = true,
    tier_category = 'Professional',
    updated_at = NOW()
WHERE id = 'aa'
AND NOT ('Digital Product Sales' = ANY(features));

-- Also ensure 'pro' plan has Digital Product Sales (fix any existing issues)
UPDATE public.subscription_plans
SET
    features = ARRAY[
        'All Standard Features',
        'Custom Domain (CNAME)',
        'Digital Product Sales',
        'WhatsApp Notification',
        'Facebook Pixel & GA4',
        'Analytics',
        'Customer Management',
        'Priority Support'
    ],
    updated_at = NOW()
WHERE id = 'pro'
AND NOT ('Digital Product Sales' = ANY(features));

-- Verify the plans have correct features
SELECT
    id,
    name,
    features,
    is_active
FROM public.subscription_plans
WHERE id IN ('free', 'pro', 'aa')
ORDER BY price_monthly;
