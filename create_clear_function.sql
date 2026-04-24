-- ==============================================================================
-- CREATE CLEAR_PENDING_BALANCES FUNCTION
-- This function moves pending_balance to available_balance after clearing period
-- Default clearing period: 7 days (order must be at least 7 days old)
-- ==============================================================================

-- Drop function if exists
DROP FUNCTION IF EXISTS public.clear_pending_balances(INTEGER);

-- Create function
CREATE OR REPLACE FUNCTION public.clear_pending_balances(
    p_days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
DECLARE
    rec RECORD;
BEGIN
    -- For each merchant with successful orders older than threshold
    FOR rec IN 
        SELECT DISTINCT o.merchant_id, 
               SUM(o.net_amount) as total_to_clear
        FROM public.orders o
        WHERE o.status IN ('success', 'paid')
          AND o.updated_at < NOW() - (p_days_threshold || ' days')::INTERVAL
          -- Exclude orders that have already been cleared (tracked in a separate table if needed)
          -- For now, we'll rely on the fact that pending_balance already reflects uncleared amounts
        GROUP BY o.merchant_id
    LOOP
        -- Move from pending to available
        -- We only move up to the current pending_balance (safety check)
        UPDATE public.wallets
        SET 
            pending_balance = GREATEST(pending_balance - rec.total_to_clear, 0),
            available_balance = available_balance + LEAST(rec.total_to_clear, pending_balance),
            updated_at = NOW()
        WHERE merchant_id = rec.merchant_id
        AND pending_balance > 0
        RETURNING wallets.merchant_id, LEAST(rec.total_to_clear, pending_balance) INTO merchant_id, amount_cleared;
        
        RAISE NOTICE '[Wallet] Cleared % from pending to available for merchant %', 
            amount_cleared, rec.merchant_id;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.clear_pending_balances(INTEGER) TO postgres, authenticated, service_role;

-- ==============================================================================
-- ALTERNATIVE SIMPLER FUNCTION: clear_all_pending_now()
-- For immediate clearing (admin use only)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.clear_all_pending_now()
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
BEGIN
    RETURN QUERY
    UPDATE public.wallets
    SET 
        available_balance = available_balance + pending_balance,
        amount_cleared = pending_balance,
        pending_balance = 0,
        updated_at = NOW()
    WHERE pending_balance > 0
    RETURNING wallets.merchant_id, wallets.pending_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.clear_all_pending_now() TO postgres, service_role;

-- ==============================================================================
-- CREATE SCHEDULED JOB (Optional - can be set up in Supabase Dashboard)
-- ==============================================================================
-- To set up a scheduled job in Supabase:
-- 1. Go to Database → Functions
-- 2. Click "Schedule a new function"
-- 3. Function: clear_pending_balances
-- 4. Schedule: 0 0 * * * (every day at midnight)
-- 5. Timezone: Asia/Jakarta

-- Manual test: Run this function with 0 days threshold to clear all immediately
-- SELECT * FROM public.clear_pending_balances(0);

-- Test with default 7 days
-- SELECT * FROM public.clear_pending_balances(7);