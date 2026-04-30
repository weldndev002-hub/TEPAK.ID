-- Migration: Add download_expiry_type to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS download_expiry_type TEXT DEFAULT 'unlimited';

-- Update existing products to have 'unlimited' by default
UPDATE public.products SET download_expiry_type = 'unlimited' WHERE download_expiry_type IS NULL;

COMMENT ON COLUMN public.products.download_expiry_type IS 'Masa berlaku link download: 24h, 7d, atau unlimited';
