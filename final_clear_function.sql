-- ==============================================================================
-- FINAL WORKING FUNCTION: clear_pending_balances
-- Menggunakan UPDATE dengan JOIN, tanpa FOR loop untuk menghindari ambiguous references
-- ==============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.clear_pending_balances(INTEGER);
DROP FUNCTION IF EXISTS public.clear_all_pending_now();
DROP FUNCTION IF EXISTS public.move_all_pending_to_available();

-- Function 1: Clear pending balances with threshold (SIMPLE VERSION)
CREATE OR REPLACE FUNCTION public.clear_pending_balances(
    p_days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
BEGIN
    -- Single UPDATE with RETURNING, no ambiguous references
    RETURN QUERY
    WITH orders_summary AS (
        SELECT 
            o.merchant_id,
            SUM(o.net_amount) as total_to_clear
        FROM public.orders o
        WHERE o.status IN ('success', 'paid')
          AND o.updated_at < NOW() - (p_days_threshold || ' days')::INTERVAL
        GROUP BY o.merchant_id
    ),
    wallet_updates AS (
        UPDATE public.wallets w
        SET 
            pending_balance = GREATEST(w.pending_balance - os.total_to_clear, 0),
            available_balance = w.available_balance + LEAST(os.total_to_clear, w.pending_balance),
            updated_at = NOW()
        FROM orders_summary os
        WHERE w.merchant_id = os.merchant_id
          AND w.pending_balance > 0
        RETURNING 
            w.merchant_id,
            LEAST(os.total_to_clear, w.pending_balance) as cleared_amount
    )
    SELECT * FROM wallet_updates;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Clear all pending now (admin use)
CREATE OR REPLACE FUNCTION public.clear_all_pending_now()
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
BEGIN
    RETURN QUERY
    UPDATE public.wallets
    SET 
        available_balance = available_balance + pending_balance,
        pending_balance = 0,
        updated_at = NOW()
    WHERE pending_balance > 0
    RETURNING merchant_id, pending_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Simple move all pending to available (no return)
CREATE OR REPLACE FUNCTION public.move_all_pending_to_available()
RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets
    SET 
        available_balance = available_balance + pending_balance,
        pending_balance = 0,
        updated_at = NOW()
    WHERE pending_balance > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.clear_pending_balances(INTEGER) 
TO postgres, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.clear_all_pending_now() 
TO postgres, service_role;

GRANT EXECUTE ON FUNCTION public.move_all_pending_to_available() 
TO postgres, authenticated, service_role;

-- ==============================================================================
-- EVEN SIMPLER VERSION: Basic clear function for testing
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.clear_pending_simple()
RETURNS VOID AS $$
BEGIN
    -- Just move all pending to available
    UPDATE public.wallets
    SET 
        available_balance = available_balance + pending_balance,
        pending_balance = 0
    WHERE pending_balance > 0;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.clear_pending_simple() 
TO postgres, authenticated, service_role;

-- ==============================================================================
-- TESTING COMMANDS
-- ==============================================================================

-- Test 1: Pindahkan semua pending ke available (paling sederhana)
-- SELECT public.clear_pending_simple();

-- Test 2: Clear dengan threshold
-- SELECT * FROM public.clear_pending_balances(7);

-- Test 3: Clear semua sekarang dengan return values
-- SELECT * FROM public.clear_all_pending_now();

-- Test 4: Manual SQL langsung (alternatif jika fungsi masih error)
/*
UPDATE public.wallets
SET 
    available_balance = available_balance + pending_balance,
    pending_balance = 0,
    updated_at = NOW()
WHERE pending_balance > 0;
*/

-- Cek status setelah clearing
/*
SELECT 
    merchant_id,
    pending_balance,
    available_balance,
    updated_at
FROM public.wallets 
ORDER BY pending_balance DESC 
LIMIT 10;
*/