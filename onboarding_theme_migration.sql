-- ==============================================================================
-- MIGRATION: Onboarding Theme & Completion Tracking
-- Date: 2026-04-28
--
-- Menambahkan kolom theme dan onboarding_completed ke tabel user_settings:
--   1. theme: menyimpan pilihan tema user saat onboarding
--   2. onboarding_completed: flag untuk menandai user sudah selesai onboarding
--
-- Tanpa kolom ini:
--   - Theme hanya dikirim via URL param dan hilang setelah navigasi
--   - Tidak ada cara untuk mendeteksi apakah user sudah onboarding
-- ==============================================================================

-- 1. Tambah kolom theme ke user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'atelier-dark';

-- 2. Tambah kolom onboarding_completed ke user_settings
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Comment untuk dokumentasi
COMMENT ON COLUMN public.user_settings.theme IS 'Tema yang dipilih user saat onboarding. Default: atelier-dark. Nilai: atelier-dark, minimal-light, sunrise-glow';
COMMENT ON COLUMN public.user_settings.onboarding_completed IS 'Flag yang menandai user sudah menyelesaikan onboarding. Digunakan untuk redirect dan pre-fill data.';

-- Backfill: Set onboarding_completed = true untuk user yang sudah punya domain_name
UPDATE public.user_settings
SET onboarding_completed = true
WHERE domain_name IS NOT NULL AND domain_name != '';

-- ==============================================================================
-- VERIFIKASI
-- ==============================================================================
-- SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'user_settings'
--   AND column_name IN ('theme', 'onboarding_completed');
-- ==============================================================================
