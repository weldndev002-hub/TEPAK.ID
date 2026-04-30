-- Migration: Add sale_price column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sale_price NUMERIC DEFAULT NULL;

-- Update comment for clarity
COMMENT ON COLUMN public.products.sale_price IS 'Harga diskon produk. Jika null, maka menggunakan harga normal.';
