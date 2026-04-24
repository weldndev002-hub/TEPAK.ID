-- ==============================================================================
-- FIXED FUNCTION: clear_pending_balances
-- Mengatasi error "column reference merchant_id is ambiguous"
-- ==============================================================================

-- Drop function jika sudah ada
DROP FUNCTION IF EXISTS public.clear_pending_balances(INTEGER);

-- Create fixed function
CREATE OR REPLACE FUNCTION public.clear_pending_balances(
    p_days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE(cleared_merchant_id UUID, cleared_amount NUMERIC) AS $$
DECLARE
    rec RECORD;
    v_merchant_id UUID;
    v_amount_cleared NUMERIC;
BEGIN
    -- Untuk setiap merchant dengan order sukses yang sudah lebih dari threshold hari
    FOR rec IN 
        SELECT DISTINCT o.merchant_id, 
               SUM(o.net_amount) as total_to_clear
        FROM public.orders o
        WHERE o.status IN ('success', 'paid')
          AND o.updated_at < NOW() - (p_days_threshold || ' days')::INTERVAL
        GROUP BY o.merchant_id
    LOOP
        -- Pindahkan dari pending ke available
        -- Gunakan alias yang berbeda untuk menghindari ambiguous reference
        UPDATE public.wallets w
        SET 
            pending_balance = GREATEST(w.pending_balance - rec.total_to_clear, 0),
            available_balance = w.available_balance + LEAST(rec.total_to_clear, w.pending_balance),
            updated_at = NOW()
        WHERE w.merchant_id = rec.merchant_id
        AND w.pending_balance > 0
        RETURNING w.merchant_id, LEAST(rec.total_to_clear, w.pending_balance) 
        INTO v_merchant_id, v_amount_cleared;
        
        -- Assign ke output parameters
        cleared_merchant_id := v_merchant_id;
        cleared_amount := v_amount_cleared;
        
        -- Return row
        RETURN NEXT;
        
        RAISE NOTICE '[Wallet] Cleared % from pending to available for merchant %', 
            v_amount_cleared, v_merchant_id;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Berikan izin eksekusi
GRANT EXECUTE ON FUNCTION public.clear_pending_balances(INTEGER) 
TO postgres, authenticated, service_role;

-- ==============================================================================
-- SIMPLER ALTERNATIVE: clear_all_pending_now
-- Untuk clearing manual tanpa threshold
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.clear_all_pending_now()
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
BEGIN
    RETURN QUERY
    UPDATE public.wallets w
    SET 
        available_balance = w.available_balance + w.pending_balance,
        amount_cleared = w.pending_balance,
        pending_balance = 0,
        updated_at = NOW()
    WHERE w.pending_balance > 0
    RETURNING w.merchant_id, w.pending_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.clear_all_pending_now() 
TO postgres, service_role;

-- ==============================================================================
-- TEST THE FUNCTION
-- ==============================================================================

-- Test 1: Clear semua pending sekarang (tanpa threshold)
-- SELECT * FROM public.clear_all_pending_now();

-- Test 2: Clear dengan threshold 7 hari
-- SELECT * FROM public.clear_pending_balances(7);

-- Test 3: Clear dengan threshold 0 hari (debug)
-- SELECT * FROM public.clear_pending_balances(0);

-- Cek hasil
-- SELECT 
--     merchant_id,
--     pending_balance,
--     available_balance,
--     updated_at
-- FROM public.wallets 
-- ORDER BY pending_balance DESC 
-- LIMIT 10;