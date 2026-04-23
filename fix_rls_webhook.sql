-- ==============================================================================
-- FIX RLS POLICY UNTUK WEBHOOK SERVICE ROLE UPDATE
-- ==============================================================================

-- Drop existing overly restrictive policy
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

-- Recreate with two scenarios:
-- 1. Users can update their own settings
CREATE POLICY "Users can update own settings" ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Service role (webhook) can update any settings (bypassed via is_service_role auth)
-- Note: Service Role inherently bypasses RLS, so we just verify the first policy works
-- If you want explicit control, use a separate function with SECURITY DEFINER

-- ALTERNATIVELY: Create a secure stored procedure for subscription updates
-- This allows webhook to call the function instead of direct UPDATE
CREATE OR REPLACE FUNCTION public.webhook_update_subscription(
  p_user_id UUID,
  p_plan_status TEXT,
  p_plan_expiry TIMESTAMPTZ,
  p_auto_renewal BOOLEAN
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  UPDATE public.user_settings
  SET 
    plan_status = p_plan_status,
    plan_expiry = p_plan_expiry,
    auto_renewal = p_auto_renewal,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  v_result := json_build_object(
    'success', true,
    'message', 'Subscription updated successfully',
    'user_id', p_user_id,
    'plan_status', p_plan_status
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.webhook_update_subscription TO anon, authenticated, service_role;

-- ==============================================================================
-- VERIFY RLS IS NOW CORRECT
-- ==============================================================================
-- Run these to verify:
-- SELECT policydesc FROM pg_policies WHERE tablename = 'user_settings';
-- SELECT * FROM public.user_settings LIMIT 1; -- Should work with service role
