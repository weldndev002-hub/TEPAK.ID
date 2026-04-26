-- Migration: Add billing_period column to subscription_history
-- This column stores the billing period ('monthly' or 'yearly') for each subscription purchase
-- so the webhook handler can determine the correct plan expiry duration.

ALTER TABLE subscription_history
ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20) DEFAULT 'monthly';

-- Add comment for documentation
COMMENT ON COLUMN subscription_history.billing_period IS 'Billing period for the subscription: monthly or yearly. Used by webhook to determine expiry duration.';
