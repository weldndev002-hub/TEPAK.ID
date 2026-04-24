-- ==============================================================================
-- WALLET TRANSACTION FUNCTIONS
-- ==============================================================================

-- 1. Function to process successful withdrawal (Clear pending balance)
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

-- 2. Function to process rejected withdrawal (Refund to available balance)
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

-- 3. Function to initiate withdrawal (Move available to pending) with row locking
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
    UPDATE public.wallets
    SET
        available_balance = available_balance - p_amount,
        pending_balance = pending_balance + p_amount,
        updated_at = NOW()
    WHERE merchant_id = p_merchant_id;

    RETURN v_withdrawal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
