-- ==============================================================================
-- ADD MISSING SUBSCRIPTION COLUMNS TO user_settings
-- ==============================================================================

-- Add plan_expiry column to track when subscription expires
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS plan_expiry TIMESTAMPTZ DEFAULT NULL;

-- Add auto_renewal column to track auto-renewal preference
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT false;

-- Create index for faster queries on plan_expiry (for checking expired subscriptions)
CREATE INDEX IF NOT EXISTS idx_user_settings_plan_expiry ON public.user_settings(plan_expiry);

-- Create index for faster queries on plan_status
CREATE INDEX IF NOT EXISTS idx_user_settings_plan_status ON public.user_settings(plan_status);

-- Add comment to explain columns
COMMENT ON COLUMN public.user_settings.plan_expiry IS 'Timestamp when the current subscription plan expires';
COMMENT ON COLUMN public.user_settings.auto_renewal IS 'Whether the subscription should automatically renew when it expires';

-- Verification queries (run these to confirm)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_settings' AND column_name IN ('plan_expiry', 'auto_renewal');
