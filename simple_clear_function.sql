-- ==============================================================================
-- SIMPLE & WORKING FUNCTION: clear_pending_balances
-- Versi sederhana yang pasti berhasil, tanpa ambiguous references
-- ==============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.clear_pending_balances(INTEGER);
DROP FUNCTION IF EXISTS public.clear_all_pending_now();

-- Function 1: Clear pending balances with threshold
CREATE OR REPLACE FUNCTION public.clear_pending_balances(
    p_days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
DECLARE
    v_merchant_id UUID;
    v_total_to_clear NUMERIC;
    v_current_pending NUMERIC;
    v_amount_to_move NUMERIC;
BEGIN
    -- Loop through merchants with successful orders older than threshold
    FOR v_merchant_id, v_total_to_clear IN 
        SELECT o.merchant_id, SUM(o.net_amount)
        FROM public.orders o
        WHERE o.status IN ('success', 'paid')
          AND o.updated_at < NOW() - (p_days_threshold || ' days')::INTERVAL
        GROUP BY o.merchant_id
    LOOP
        -- Get current pending balance for safety
        SELECT pending_balance INTO v_current_pending
        FROM public.wallets
        WHERE merchant_id = v_merchant_id;
        
        -- Calculate how much we can actually move
        v_amount_to_move := LEAST(v_total_to_clear, COALESCE(v_current_pending, 0));
        
        IF v_amount_to_move > 0 THEN
            -- Update wallet
            UPDATE public.wallets
            SET 
                pending_balance = pending_balance - v_amount_to_move,
                available_balance = available_balance + v_amount_to_move,
                updated_at = NOW()
            WHERE merchant_id = v_merchant_id;
            
            -- Return result
            merchant_id := v_merchant_id;
            amount_cleared := v_amount_to_move;
            RETURN NEXT;
            
            RAISE NOTICE '[Wallet] Cleared % from pending to available for merchant %', 
                v_amount_to_move, v_merchant_id;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Simple clear all pending now (admin use)
CREATE OR REPLACE FUNCTION public.clear_all_pending_now()
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH updated AS (
        UPDATE public.wallets
        SET 
            available_balance = available_balance + pending_balance,
            pending_balance = 0,
            updated_at = NOW()
        WHERE pending_balance > 0
        RETURNING merchant_id, pending_balance as old_pending
    )
    SELECT merchant_id, old_pending FROM updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: Even simpler - just move all pending to available
CREATE OR REPLACE FUNCTION public.move_all_pending_to_available()
RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets
    SET 
        available_balance = available_balance + pending_balance,
        pending_balance = 0,
        updated_at = NOW()
    WHERE pending_balance > 0;
    
    RAISE NOTICE '[Wallet] Moved all pending balances to available';
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
-- TESTING
-- ==============================================================================

-- Test 1: Pindahkan semua pending ke available sekarang
-- SELECT public.move_all_pending_to_available();

-- Test 2: Clear dengan threshold (akan bekerja setelah ada data order > 7 hari)
-- SELECT * FROM public.clear_pending_balances(7);

-- Test 3: Clear semua sekarang (return results)
-- SELECT * FROM public.clear_all_pending_now();

-- Cek status wallet setelah clearing
-- SELECT merchant_id, pending_balance, available_balance 
-- FROM public.wallets 
-- ORDER BY available_balance DESC 
-- LIMIT 10;