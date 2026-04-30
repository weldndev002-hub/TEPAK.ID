-- ==============================================================================
-- IMMEDIATE BALANCE ACCESS & RESET PENDING BALANCES
-- ==============================================================================

-- 1. Fix the trigger function to use available_balance directly
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_merchant_id UUID;
    v_net_amount NUMERIC;
BEGIN
    -- Only act when status changes
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    v_merchant_id := NEW.merchant_id;
    v_net_amount := COALESCE(NEW.net_amount, 0);

    -- CASE: Order became successful/paid -> Add net_amount directly to available_balance
    IF (NEW.status IN ('success', 'paid')) AND (OLD.status NOT IN ('success', 'paid')) THEN
        UPDATE public.wallets
        SET 
            available_balance = available_balance + v_net_amount,
            updated_at = NOW()
        WHERE merchant_id = v_merchant_id;
        
        RAISE NOTICE '[Wallet] Added % to available_balance for merchant % (order %)', 
            v_net_amount, v_merchant_id, NEW.id;
    END IF;

    -- CASE: Order was success/paid but now cancelled/expired -> Subtract net_amount from available_balance
    IF (NEW.status IN ('cancelled', 'expired', 'failed')) AND (OLD.status IN ('success', 'paid')) THEN
        UPDATE public.wallets
        SET 
            available_balance = GREATEST(available_balance - v_net_amount, 0),
            updated_at = NOW()
        WHERE merchant_id = v_merchant_id;
            
        RAISE NOTICE '[Wallet] Subtracted % from available_balance for merchant % (order %)', 
            v_net_amount, v_merchant_id, NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Migrate existing pending_balance to available_balance (safely)
-- Move everything to available EXCEPT what is currently in a pending withdrawal
UPDATE public.wallets w
SET 
    available_balance = w.available_balance + (w.pending_balance - COALESCE((
        SELECT SUM(amount) 
        FROM public.withdrawals 
        WHERE merchant_id = w.merchant_id 
        AND status = 'pending'
    ), 0)),
    pending_balance = COALESCE((
        SELECT SUM(amount) 
        FROM public.withdrawals 
        WHERE merchant_id = w.merchant_id 
        AND status = 'pending'
    ), 0),
    updated_at = NOW();

-- 3. Re-grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_order_status_change() TO postgres, anon, authenticated, service_role;
