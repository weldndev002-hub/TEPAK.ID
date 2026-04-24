-- ==============================================================================
-- WALLET & PAYOUT FIX MIGRATION
-- Fixes: CHECK constraint, wallet auto-update, PG fee, config columns
-- ==============================================================================

-- 1. FIX: Drop old CHECK constraint on orders.status and add expanded one
-- The old constraint only allowed: 'pending', 'success', 'failed', 'refunded'
-- We need to add: 'cancelled', 'expired', 'paid'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'success', 'failed', 'refunded', 'cancelled', 'expired', 'paid'));

-- 2. Add pg_fee column to orders table (Payment Gateway fee)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'pg_fee') THEN
        ALTER TABLE public.orders ADD COLUMN pg_fee DECIMAL DEFAULT 0;
    END IF;
END $$;

-- 3. Add pg_fee and min_withdrawal columns to platform_configs if not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_configs' AND COLUMN_NAME = 'pg_fee') THEN
        ALTER TABLE public.platform_configs ADD COLUMN pg_fee DECIMAL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_configs' AND COLUMN_NAME = 'min_withdrawal') THEN
        ALTER TABLE public.platform_configs ADD COLUMN min_withdrawal DECIMAL DEFAULT 50000;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_configs' AND COLUMN_NAME = 'payout_fee') THEN
        ALTER TABLE public.platform_configs ADD COLUMN payout_fee DECIMAL DEFAULT 5000;
    END IF;
END $$;

-- 4. Set default pg_fee if not configured (e.g. Rp 2.000 flat for QRIS)
-- This can be updated via Admin settings later
UPDATE public.platform_configs SET pg_fee = 2000 WHERE pg_fee = 0 OR pg_fee IS NULL;

-- 5. Recalculate net_amount for existing orders that don't have pg_fee factored in
-- net_amount = amount - (platform_fee% of amount) - pg_fee
UPDATE public.orders
SET pg_fee = 2000,
    net_amount = FLOOR(amount * (1 - (COALESCE(platform_fee, 5) / 100))) - 2000
WHERE pg_fee = 0 OR pg_fee IS NULL;

-- 6. Create function: handle_order_status_change()
-- Automatically updates wallet balances when order status changes
-- - 'success'/'paid' → add net_amount to pending_balance
-- - 'cancelled'/'expired' → subtract net_amount from pending_balance (if was previously success/paid)
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

    -- CASE: Order became successful/paid → Add net_amount to pending_balance
    IF (NEW.status IN ('success', 'paid')) AND (OLD.status NOT IN ('success', 'paid')) THEN
        UPDATE public.wallets
        SET 
            pending_balance = pending_balance + v_net_amount,
            updated_at = NOW()
        WHERE merchant_id = v_merchant_id;
        
        RAISE NOTICE '[Wallet] Added % to pending_balance for merchant % (order %)', 
            v_net_amount, v_merchant_id, NEW.id;
    END IF;

    -- CASE: Order was success/paid but now cancelled/expired → Subtract net_amount from pending_balance
    IF (NEW.status IN ('cancelled', 'expired', 'failed')) AND (OLD.status IN ('success', 'paid')) THEN
        UPDATE public.wallets
        SET 
            pending_balance = GREATEST(pending_balance - v_net_amount, 0),
            updated_at = NOW()
        WHERE merchant_id = v_merchant_id;
            
        RAISE NOTICE '[Wallet] Subtracted % from pending_balance for merchant % (order %)', 
            v_net_amount, v_merchant_id, NEW.id;
    END IF;

    -- CASE: Order was pending and now cancelled/expired → No wallet change needed
    -- (pending orders don't add to wallet until they succeed)
    IF (NEW.status IN ('cancelled', 'expired')) AND (OLD.status = 'pending') THEN
        RAISE NOTICE '[Wallet] Order % was pending and is now % - no wallet change needed', 
            NEW.id, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger on orders table
DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;
CREATE TRIGGER on_order_status_changed
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();

-- 8. Fix existing orders that are stuck in wrong statuses
-- Orders that Duitku reported as 'cancelled' or 'expired' but couldn't be updated
-- due to the old CHECK constraint will need manual review, but we can log them:
-- (This is informational only - run manually if needed)
-- SELECT id, invoice_id, status, created_at FROM public.orders 
--   WHERE status = 'pending' AND created_at < NOW() - INTERVAL '7 days';

-- 9. Function to move pending_balance to available_balance after clearing period
-- Called by a scheduled job or manually by admin
CREATE OR REPLACE FUNCTION public.clear_pending_balances(
    p_days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE(merchant_id UUID, amount_cleared NUMERIC) AS $$
DECLARE
    rec RECORD;
    v_cleared NUMERIC;
BEGIN
    FOR rec IN 
        SELECT DISTINCT o.merchant_id, 
               SUM(o.net_amount) as total_to_clear
        FROM public.orders o
        WHERE o.status IN ('success', 'paid')
          AND o.updated_at < NOW() - (p_days_threshold || ' days')::INTERVAL
          AND o.id NOT IN (
              SELECT DISTINCT json_array_elements_text(
                  COALESCE((SELECT json_build_array()::json), '[]'::json)
              ) FROM public.wallets
          )
        GROUP BY o.merchant_id
    LOOP
        -- Move from pending to available
        UPDATE public.wallets
        SET 
            pending_balance = GREATEST(pending_balance - rec.total_to_clear, 0),
            available_balance = available_balance + rec.total_to_clear,
            updated_at = NOW()
        WHERE merchant_id = rec.merchant_id
        RETURNING wallets.merchant_id, rec.total_to_clear INTO merchant_id, amount_cleared;
        
        RAISE NOTICE '[Wallet] Cleared % from pending to available for merchant %', 
            rec.total_to_clear, rec.merchant_id;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.handle_order_status_change() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clear_pending_balances(INTEGER) TO postgres, authenticated, service_role;
