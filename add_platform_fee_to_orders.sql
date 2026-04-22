-- =============================================
-- PLATFORM FEE & NET AMOUNT ENHANCEMENT
-- =============================================

-- 1. Tambahkan kolom ke tabel orders
-- platform_fee: Persentase biaya (e.g. 5)
-- net_amount: Jumlah yang diterima creator setelah dipotong fee
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'platform_fee') THEN
        ALTER TABLE public.orders ADD COLUMN platform_fee DECIMAL DEFAULT 5;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'net_amount') THEN
        ALTER TABLE public.orders ADD COLUMN net_amount DECIMAL;
    END IF;
END $$;

-- 2. Migrasi data lama (Opsional: asumsikan biaya 5% untuk pesanan yang sudah ada)
UPDATE public.orders 
SET platform_fee = 5, net_amount = FLOOR(amount * 0.95) 
WHERE net_amount IS NULL;

-- 3. Pastikan kolom net_amount tidak null untuk masa depan
-- ALTER TABLE public.orders ALTER COLUMN net_amount SET NOT NULL; -- Hubungi admin jika ingin memaksa ini
