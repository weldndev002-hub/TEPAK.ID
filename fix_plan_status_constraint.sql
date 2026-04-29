-- Remove the check constraint that restricts plan_status to 'free', 'pro', etc.
-- This allows using the dynamic UUID from the subscription_plans table.
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_plan_status_check;

-- Also check if there is any other constraint by similar name just in case
-- (Sometimes Supabase auto-generates names)
