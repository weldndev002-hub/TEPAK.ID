-- CRITICAL WALLET FIX FOR TEPAK.ID
-- Run this in Supabase SQL Editor to fix wallet synchronization
-- This will create the trigger that updates wallet balances automatically

-- ==============================================================================
-- 1. CREATE THE WALLET UPDATE FUNCTION
-- ==============================================================================
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. CREATE THE TRIGGER ON ORDERS TABLE
-- ==============================================================================
DROP TRIGGER IF EXISTS on_order_status_changed ON public.orders;
CREATE TRIGGER on_order_status_changed
    AFTER UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();

-- ==============================================================================
-- 3. FIX EXISTING SUCCESSFUL ORDERS (ONE-TIME UPDATE)
-- This updates wallet balances for all existing successful/paid orders
-- ==============================================================================
UPDATE public.wallets w
SET 
    pending_balance = COALESCE((
        SELECT SUM(net_amount) 
        FROM public.orders o 
        WHERE o.merchant_id = w.merchant_id 
        AND o.status IN ('success', 'paid')
    ), 0),
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.merchant_id = w.merchant_id 
    AND o.status IN ('success', 'paid')
);

-- ==============================================================================
-- 4. ENSURE PLATFORM CONFIG EXISTS WITH PROPER FEES
-- ==============================================================================
-- First, ensure the table has required columns
DO $$
BEGIN
    -- Add pg_fee column if not exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_configs' AND COLUMN_NAME = 'pg_fee') THEN
        ALTER TABLE public.platform_configs ADD COLUMN pg_fee DECIMAL DEFAULT 0;
    END IF;
    
    -- Add min_withdrawal column if not exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_configs' AND COLUMN_NAME = 'min_withdrawal') THEN
        ALTER TABLE public.platform_configs ADD COLUMN min_withdrawal DECIMAL DEFAULT 50000;
    END IF;
    
    -- Add payout_fee column if not exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_configs' AND COLUMN_NAME = 'payout_fee') THEN
        ALTER TABLE public.platform_configs ADD COLUMN payout_fee DECIMAL DEFAULT 5000;
    END IF;
    
    -- Add platform_fee_percent column if not exists
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'platform_configs' AND COLUMN_NAME = 'platform_fee_percent') THEN
        ALTER TABLE public.platform_configs ADD COLUMN platform_fee_percent DECIMAL DEFAULT 5;
    END IF;
END $$;

-- Now insert or update the config
INSERT INTO public.platform_configs (id, payout_fee, min_withdrawal, pg_fee, platform_fee_percent, updated_at)
VALUES (1, 5000, 50000, 0, 5, NOW())
ON CONFLICT (id) DO UPDATE SET
    payout_fee = EXCLUDED.payout_fee,
    min_withdrawal = EXCLUDED.min_withdrawal,
    pg_fee = EXCLUDED.pg_fee,
    platform_fee_percent = EXCLUDED.platform_fee_percent,
    updated_at = NOW();

-- ==============================================================================
-- 5. UPDATE NET_AMOUNT FOR EXISTING ORDERS IF MISSING
-- Ensures net_amount is calculated correctly for future transactions
-- ==============================================================================
-- First, ensure orders table has pg_fee column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'pg_fee') THEN
        ALTER TABLE public.orders ADD COLUMN pg_fee DECIMAL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'platform_fee') THEN
        ALTER TABLE public.orders ADD COLUMN platform_fee DECIMAL DEFAULT 5;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'net_amount') THEN
        ALTER TABLE public.orders ADD COLUMN net_amount DECIMAL;
    END IF;
END $$;

-- Now update the values
UPDATE public.orders
SET
    pg_fee = 0,
    net_amount = FLOOR(amount * (1 - (COALESCE(platform_fee, 5) / 100))) - pg_fee
WHERE (pg_fee = 0 OR pg_fee IS NULL OR net_amount IS NULL);

-- ==============================================================================
-- 6. VERIFICATION QUERIES (Optional - can be run separately)
-- ==============================================================================
-- Check if trigger was created successfully
SELECT 
    '✅ Function created' as check_1,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'on_order_status_changed') as trigger_exists,
    'Check wallet balances:' as check_2;

-- Show sample wallet balances after fix
SELECT 
    w.merchant_id,
    w.pending_balance as wallet_pending,
    w.available_balance as wallet_available,
    COALESCE(SUM(o.net_amount), 0) as total_successful_orders,
    CASE 
        WHEN w.pending_balance = COALESCE(SUM(o.net_amount), 0) THEN '✅ SYNCED'
        ELSE '❌ OUT OF SYNC'
    END as sync_status
FROM public.wallets w
LEFT JOIN public.orders o ON o.merchant_id = w.merchant_id AND o.status IN ('success', 'paid')
GROUP BY w.merchant_id, w.pending_balance, w.available_balance
LIMIT 10;

-- Show platform config
SELECT * FROM public.platform_configs WHERE id = 1;

-- ==============================================================================
-- 7. TEST THE TRIGGER WITH A SAMPLE UPDATE (Optional)
-- ==============================================================================
-- Uncomment and run this to test the trigger works:
/*
-- First, check current state of a pending order
SELECT id, invoice_id, merchant_id, status, net_amount 
FROM public.orders 
WHERE status = 'pending' 
LIMIT 1;

-- Then update it to 'success' to trigger wallet update
UPDATE public.orders 
SET status = 'success', updated_at = NOW()
WHERE id = 'your-order-id-here';

-- Check wallet balance was updated
SELECT * FROM public.wallets WHERE merchant_id = 'merchant-id-from-order';
*/