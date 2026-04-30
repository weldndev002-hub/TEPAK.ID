-- 1. Fungsi saat Payout Berhasil (Dipotong dari Pending Balance)
CREATE OR REPLACE FUNCTION update_wallet_payout_success(p_merchant_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets
    SET 
        pending_balance = pending_balance - p_amount,
        updated_at = NOW()
    WHERE merchant_id = p_merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fungsi saat Payout Ditolak (Refund dari Pending ke Available Balance)
CREATE OR REPLACE FUNCTION update_wallet_payout_reject(p_merchant_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
    UPDATE public.wallets
    SET 
        pending_balance = pending_balance - p_amount,
        available_balance = available_balance + p_amount,
        updated_at = NOW()
    WHERE merchant_id = p_merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Memastikan RLS untuk Bukti Transfer
-- Payout-proofs bucket harus ada dan dapat diakses publik/authenticated
