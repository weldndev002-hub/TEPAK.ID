-- ==============================================================================
-- FIX: RLS Policies untuk bucket 'payout-proofs'
-- Date: 2026-04-28
--
-- Masalah: Upload ke bucket payout-proofs menghasilkan 400 Bad Request
-- Penyebab: Tidak ada RLS policy INSERT pada storage.objects untuk bucket ini
--
-- Fix: Tambahkan RLS policies yang benar menggunakan CREATE POLICY
--       (bukan INSERT ke storage.policies yang sudah deprecated)
--
-- Catatan: storage.objects dimiliki oleh supabase_storage_admin.
-- Jika Anda mendapat error "must be owner of table objects", jalankan
-- policy creation melalui Supabase Dashboard > Storage > Policies.
-- ==============================================================================

-- 1. Pastikan bucket payout-proofs ada dan terkonfigurasi dengan benar
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payout-proofs',
  'payout-proofs',
  true,  -- public agar URL bisa diakses langsung
  10485760,  -- 10MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];

-- 2. Drop policy lama jika ada (dari percobaan sebelumnya)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view payout-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload payout-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload payout-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update payout-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete payout-proofs" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage payout-proofs" ON storage.objects;

-- 3. Policy: Publik bisa melihat (SELECT) file bukti transfer
--    Ini penting karena bucket public dan merchant perlu melihat bukti transfer
DO $$ BEGIN
  CREATE POLICY "Anyone can view payout-proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payout-proofs');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Anyone can view payout-proofs" already exists';
END $$;

-- 4. Policy: Authenticated user (admin) bisa upload (INSERT)
--    Path yang digunakan: receipts/{filename}
--    Tidak ada pengecekan folder user_id karena admin yang upload
DO $$ BEGIN
  CREATE POLICY "Authenticated can upload payout-proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'payout-proofs');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Authenticated can upload payout-proofs" already exists';
END $$;

-- 5. Policy: Authenticated user (admin) bisa update (UPDATE)
DO $$ BEGIN
  CREATE POLICY "Authenticated can update payout-proofs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'payout-proofs')
  WITH CHECK (bucket_id = 'payout-proofs');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Authenticated can update payout-proofs" already exists';
END $$;

-- 6. Policy: Authenticated user (admin) bisa delete (DELETE)
DO $$ BEGIN
  CREATE POLICY "Authenticated can delete payout-proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'payout-proofs');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Authenticated can delete payout-proofs" already exists';
END $$;

-- 7. Policy: Service role full access
DO $$ BEGIN
  CREATE POLICY "Service role can manage payout-proofs"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'payout-proofs')
  WITH CHECK (bucket_id = 'payout-proofs');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Service role can manage payout-proofs" already exists';
END $$;

-- ==============================================================================
-- VERIFIKASI
-- ==============================================================================
-- Jalankan query berikut untuk memverifikasi:
--
-- SELECT * FROM storage.buckets WHERE id = 'payout-proofs';
-- SELECT policyname, cmd, qual, with_check FROM pg_policies
--   WHERE tablename = 'objects' AND policyname LIKE '%payout%';
-- ==============================================================================
