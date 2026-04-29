-- Migration: Add billing_period column to user_settings
-- This stores the current subscription's billing period (monthly/yearly) so the UI
-- can display it and the upgrade logic can determine plan hierarchy correctly.

ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly';

-- Add comment for documentation
COMMENT ON COLUMN public.user_settings.billing_period IS 'Current subscription billing period: monthly or yearly. Used by UI to display plan info and by upgrade logic.';
