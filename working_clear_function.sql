-- ==============================================================================
-- WORKING CLEAR FUNCTION - SIMPLE AND GUARANTEED TO WORK
-- ==============================================================================

-- Option 1: SIMPLE UPDATE (Direct SQL - no function needed for scheduled job)
-- Just run this SQL directly in the scheduled job:

/*
UPDATE public.wallets w
SET 
    available_balance = available_balance + pending_balance,
    pending_balance = 0,
    updated_at = NOW()
WHERE pending_balance > 0;
*/

-- Option 2: Create a simple function without ambiguous references
CREATE OR REPLACE FUNCTION public.clear_pending_to_available()
RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    UPDATE public.wallets
    SET 
        available_balance = available_balance + pending_balance,
        pending_balance = 0,
        updated_at = NOW()
    WHERE pending_balance > 0;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Option 3: Function with threshold (for orders older than X days)
CREATE OR REPLACE FUNCTION public.clear_old_pending_balances(days_old INTEGER DEFAULT 7)
RETURNS TABLE(merchant_id UUID, amount_moved NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH old_orders AS (
        SELECT 
            o.merchant_id,
            SUM(o.net_amount) as total_amount
        FROM public.orders o
        WHERE o.status IN ('success', 'paid')
          AND o.updated_at < NOW() - (days_old || ' days')::INTERVAL
        GROUP BY o.merchant_id
    ),
    wallet_updates AS (
        UPDATE public.wallets w
        USING old_orders oo
        SET 
            pending_balance = w.pending_balance - LEAST(oo.total_amount, w.pending_balance),
            available_balance = w.available_balance + LEAST(oo.total_amount, w.pending_balance),
            updated_at = NOW()
        WHERE w.merchant_id = oo.merchant_id
          AND w.pending_balance > 0
        RETURNING 
            w.merchant_id,
            LEAST(oo.total_amount, w.pending_balance) as moved_amount
    )
    SELECT * FROM wallet_updates;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.clear_pending_to_available() 
TO postgres, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.clear_old_pending_balances(INTEGER) 
TO postgres, authenticated, service_role;

-- ==============================================================================
-- SETUP SCHEDULED JOB
-- ==============================================================================

-- For Supabase scheduled jobs, you can use either:

-- 1. Direct SQL (recommended for simplicity):
-- UPDATE public.wallets SET available_balance = available_balance + pending_balance, pending_balance = 0 WHERE pending_balance > 0;

-- 2. Or call the simple function:
-- SELECT public.clear_pending_to_available();

-- 3. Or call the threshold-based function:
-- SELECT * FROM public.clear_old_pending_balances(7);

-- ==============================================================================
-- TESTING
-- ==============================================================================

-- Test 1: Simple clear all
-- SELECT public.clear_pending_to_available();

-- Test 2: Clear orders older than 7 days
-- SELECT * FROM public.clear_old_pending_balances(7);

-- Test 3: Manual check
/*
SELECT 
    COUNT(*) as wallets_with_pending,
    SUM(pending_balance) as total_pending,
    SUM(available_balance) as total_available
FROM public.wallets;
*/

-- ==============================================================================
-- ALTERNATIVE: Use this simple UPDATE for scheduled job (no function needed)
-- ==============================================================================
-- Copy this exact SQL for your scheduled job:
/*
UPDATE public.wallets
SET 
    available_balance = available_balance + pending_balance,
    pending_balance = 0,
    updated_at = NOW()
WHERE pending_balance > 0;
*/