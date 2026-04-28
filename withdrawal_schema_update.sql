-- ==============================================================================
-- WITHDRAWAL SCHEMA UPDATE
-- Add columns to support Duitku Disbursement tracking
-- ==============================================================================

-- 1. Add disburse_id and cust_ref_number columns to withdrawals table
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS disburse_id TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS cust_ref_number TEXT;

-- 2. Create indexes for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_withdrawals_disburse_id ON public.withdrawals(disburse_id);

-- 3. Update the initiate_withdrawal function to handle these if necessary
-- Actually, initiate_withdrawal only creates a pending record before inquiry/transfer is done.
-- The API will update the record with disburse_id and cust_ref_number later.
-- Let's redefine initiate_withdrawal to be safe and ensure it returns the ID.

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
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    IF v_available_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Create withdrawal record
    INSERT INTO public.withdrawals (merchant_id, amount, bank_account_id, status)
    VALUES (p_merchant_id, p_amount, p_bank_account_id, 'pending')
    RETURNING id INTO v_withdrawal_id;

    -- Update wallet (same row already locked)
    -- Deduct from available, add to pending (representing money locked for payout)
    UPDATE public.wallets
    SET
        available_balance = available_balance - p_amount,
        pending_balance = pending_balance + p_amount,
        updated_at = NOW()
    WHERE merchant_id = p_merchant_id;

    RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update the update_wallet_payout_reject function
-- To handle refunding a failed/rejected withdrawal
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

GRANT EXECUTE ON FUNCTION public.initiate_withdrawal(UUID, NUMERIC, UUID) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_wallet_payout_reject(UUID, NUMERIC) TO postgres, anon, authenticated, service_role;
