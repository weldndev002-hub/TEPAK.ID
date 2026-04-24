-- Add missing RLS policy for admin management of subscription_plans
-- This fixes the bug where admin cannot delete plans due to missing DELETE policy.
-- Run this script in Supabase SQL Editor.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscription_plans' 
        AND policyname = 'Admins can manage all subscription plans'
    ) THEN
        CREATE POLICY "Admins can manage all subscription plans" ON public.subscription_plans
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );
        RAISE NOTICE 'Policy added successfully.';
    ELSE
        RAISE NOTICE 'Policy already exists.';
    END IF;
END
$$;