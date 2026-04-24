-- ==============================================================================
-- ADD TIER CATEGORIES TO SUBSCRIPTION PLANS
-- ==============================================================================

-- Add tier_category and tier_description columns if they don't exist
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS tier_category TEXT DEFAULT 'Basic',
ADD COLUMN IF NOT EXISTS tier_description TEXT;

-- Update existing plans with tier information
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

-- Add comment for clarity
COMMENT ON COLUMN public.subscription_plans.tier_category IS 'Tier level: Starter, Professional, Enterprise';
COMMENT ON COLUMN public.subscription_plans.tier_description IS 'Detailed tier description for marketing purposes';
