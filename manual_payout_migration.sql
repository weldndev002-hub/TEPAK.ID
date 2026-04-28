-- ==============================================================================
-- COMBINED MIGRATION: Manual Payout Flow
-- Date: 2026-04-28
-- 
-- This migration consolidates all SQL changes needed for the manual payout
-- approval flow (no Duitku auto-transfer). Admin reviews, transfers manually,
-- and approves/rejects via /admin/payouts dashboard.
--
-- Includes:
--   1. bank_accounts: add updated_at column
--   2. withdrawals: add proof_url, disburse_id, cust_ref_number columns
--   3. notifications table + RLS policies
--   4. Storage bucket for payout-proofs
--   5. RPC functions: initiate_withdrawal, update_wallet_payout_success,
--      update_wallet_payout_reject
--   6. Indexes for faster webhook/payout lookups
-- ==============================================================================

-- ==============================================================================
-- 1. bank_accounts: add updated_at column
-- ==============================================================================
ALTER TABLE public.bank_accounts
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill existing rows with current timestamp
UPDATE public.bank_accounts
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- ==============================================================================
-- 2. withdrawals: add proof_url, disburse_id, cust_ref_number columns
-- ==============================================================================
ALTER TABLE public.withdrawals
ADD COLUMN IF NOT EXISTS proof_url TEXT;

ALTER TABLE public.withdrawals
ADD COLUMN IF NOT EXISTS disburse_id TEXT;

ALTER TABLE public.withdrawals
ADD COLUMN IF NOT EXISTS cust_ref_number TEXT;

-- ==============================================================================
-- 3. notifications table + RLS policies
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',  -- 'success', 'warning', 'info', 'error'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications'
    ) THEN
        CREATE POLICY "Users can view own notifications" ON public.notifications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Users can update their own notifications (mark as read)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications'
    ) THEN
        CREATE POLICY "Users can update own notifications" ON public.notifications
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Service role can insert notifications (for admin actions)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Service role can insert notifications'
    ) THEN
        CREATE POLICY "Service role can insert notifications" ON public.notifications
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- ==============================================================================
-- 4. Storage bucket for payout-proofs (bukti transfer)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('payout-proofs', 'payout-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. RPC Functions
-- ==============================================================================

-- 5a. initiate_withdrawal: Create pending withdrawal + move available → pending
--     Called when user requests a withdrawal (POST /api/wallet/withdraw)
CREATE OR REPLACE FUNCTION public.initiate_withdrawal(
    p_merchant_id UUID,
    p_amount NUMERIC,
    p_bank_account_id UUID
) RETURNS UUID AS $$
DECLARE
    v_withdrawal_id UUID;
    v_available_balance NUMERIC;
BEGIN
    -- Lock the wallet row for this merchant and retrieve current balance
    SELECT available_balance INTO v_available_balance
    FROM public.wallets
    WHERE merchant_id = p_merchant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet not found';
    END IF;

    IF v_available_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Create withdrawal record (status: pending)
    INSERT INTO public.withdrawals (merchant_id, amount, bank_account_id, status)
    VALUES (p_merchant_id, p_amount, p_bank_account_id, 'pending')
    RETURNING id INTO v_withdrawal_id;

    -- Deduct from available_balance, add to pending_balance
    UPDATE public.wallets
    SET
        available_balance = available_balance - p_amount,
        pending_balance = pending_balance + p_amount,
        updated_at = NOW()
    WHERE merchant_id = p_merchant_id;

    RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5b. update_wallet_payout_success: Admin approves payout → clear pending balance
--     Called when admin approves (POST /api/admin/payouts/update-status status=completed)
CREATE OR REPLACE FUNCTION public.update_wallet_payout_success(
    p_merchant_id UUID,
    p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets
    SET
        pending_balance = pending_balance - p_amount,
        updated_at = NOW()
    WHERE merchant_id = p_merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5c. update_wallet_payout_reject: Admin rejects payout → refund pending → available
--     Called when admin rejects (POST /api/admin/payouts/update-status status=rejected)
--     Also used by Duitku webhook when transfer fails
CREATE OR REPLACE FUNCTION public.update_wallet_payout_reject(
    p_merchant_id UUID,
    p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets
    SET
        pending_balance = pending_balance - p_amount,
        available_balance = available_balance + p_amount,
        updated_at = NOW()
    WHERE merchant_id = p_merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to relevant roles
GRANT EXECUTE ON FUNCTION public.initiate_withdrawal(UUID, NUMERIC, UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_wallet_payout_success(UUID, NUMERIC) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_wallet_payout_reject(UUID, NUMERIC) TO postgres, anon, authenticated, service_role;

-- ==============================================================================
-- 6. Indexes for faster lookups
-- ==============================================================================

-- Index on disburse_id for Duitku webhook callback lookups
CREATE INDEX IF NOT EXISTS idx_withdrawals_disburse_id ON public.withdrawals(disburse_id);

-- Index on merchant_id for faster user withdrawal history queries
CREATE INDEX IF NOT EXISTS idx_withdrawals_merchant_id ON public.withdrawals(merchant_id);

-- Index on status for admin payout filtering (pending/completed/rejected)
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- Index on notifications user_id for faster per-user queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ==============================================================================
-- MIGRATION COMPLETE
-- ==============================================================================
-- After running this migration, the manual payout flow is:
--
-- 1. User requests withdrawal → POST /api/wallet/withdraw
--    → initiate_withdrawal RPC creates pending record + moves available→pending
--
-- 2. Admin reviews in /admin/payouts dashboard
--    → Can Approve (upload proof) or Reject (with reason)
--
-- 3a. Admin Approves → POST /api/admin/payouts/update-status {status: 'completed'}
--     → update_wallet_payout_success RPC clears pending_balance
--     → Notification sent to creator
--
-- 3b. Admin Rejects → POST /api/admin/payouts/update-status {status: 'rejected'}
--     → update_wallet_payout_reject RPC refunds pending→available
--     → Notification sent to creator
-- ==============================================================================
