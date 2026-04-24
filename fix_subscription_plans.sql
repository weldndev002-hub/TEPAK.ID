-- ==============================================================================
-- FIX SUBSCRIPTION PLANS - Add Missing Columns and Data
-- ==============================================================================
-- Run this in Supabase SQL Editor if apply_plan_migrations.js fails
-- ==============================================================================

-- 1. Add missing columns to subscription_plans
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS tier_category TEXT DEFAULT 'Basic',
ADD COLUMN IF NOT EXISTS tier_description TEXT;

-- 2. Update existing plans with tier information
UPDATE public.subscription_plans
SET 
  tier_category = 'Starter',
  tier_description = 'Perfect for creators just starting their digital journey. Includes essential features to build your online presence with unlimited links and basic analytics.'
WHERE id = 'free';

UPDATE public.subscription_plans
SET 
  tier_category = 'Professional',
  tier_description = 'For growing digital businesses. Unlock premium features like custom domain, digital product sales, and advanced integrations to scale your business.'
WHERE id = 'pro';

-- 3. Ensure is_active is set to true for main plans
UPDATE public.subscription_plans
SET is_active = true
WHERE id IN ('free', 'pro');

-- 4. Verify the updates
SELECT 
  id,
  name,
  badge,
  price_monthly,
  is_active,
  tier_category,
  tier_description,
  features,
  created_at
FROM public.subscription_plans
ORDER BY price_monthly ASC;
