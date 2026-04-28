-- ==============================================================================
-- MIGRATION: Transfer Proof Bucket & Orders Column
-- Date: 2026-04-28
--
-- Untuk fitur bukti transfer (manual bank transfer):
--   1. Konfigurasi bucket 'transfer' di Supabase Storage
--   2. Tambah kolom transfer_proof_url ke tabel orders
--   3. Update status constraint orders (tambah 'waiting_confirmation')
--   4. RLS policies untuk bucket 'transfer'
--   5. Helper function untuk generate path file
--
-- Prasyarat: Bucket 'transfer' sudah dibuat via Supabase Dashboard
-- ==============================================================================

-- ==============================================================================
-- 1. KONFIGURASI BUCKET 'transfer'
-- ==============================================================================
-- Update bucket yang sudah dibuat dengan settings yang tepat:
-- - public: false (bukti transfer bersifat privat, hanya customer & merchant)
-- - file_size_limit: 5MB (cukup untuk gambar bukti transfer)
-- - allowed_mime_types: hanya gambar

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 5242880,  -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
WHERE id = 'transfer';

-- Jika bucket belum terdaftar di storage.buckets (misal baru create via UI),
-- gunakan INSERT sebagai fallback:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transfer',
  'transfer',
  false,  -- PRIVATE: bukti transfer hanya bisa diakses oleh pihak terkait
  5242880,  -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 2. TAMBAH KOLOM transfer_proof_url KE TABEL orders
-- ==============================================================================
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS transfer_proof_url TEXT;

-- Comment untuk dokumentasi
COMMENT ON COLUMN public.orders.transfer_proof_url IS 'URL gambar bukti transfer dari bucket transfer. Diisi saat customer upload bukti pembayaran manual.';

-- ==============================================================================
-- 3. UPDATE STATUS CONSTRAINT PADA ORDERS
-- ==============================================================================
-- Drop existing check constraint dan recreate dengan status baru
-- Status flow: pending -> waiting_confirmation -> success / failed
--   pending              = Order baru dibuat, menunggu pembayaran
--   waiting_confirmation = Customer sudah upload bukti transfer, menunggu konfirmasi merchant
--   success              = Pembayaran dikonfirmasi
--   failed               = Pembayaran ditolak/gagal
--   refunded             = Pengembalian dana

-- Cari dan drop constraint CHECK yang ada pada kolom status
DO $$
DECLARE
  _constraint_name TEXT;
BEGIN
  -- Cari constraint CHECK yang mengandung 'status' pada tabel orders
  -- Menggunakan pg_get_constraintdef untuk mencari constraint yang relevan
  SELECT con.conname INTO _constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = con.connamespace
  WHERE rel.relname = 'orders'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%'
  LIMIT 1;

  IF _constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', _constraint_name);
    RAISE NOTICE 'Dropped existing constraint: %', _constraint_name;
  ELSE
    RAISE NOTICE 'No existing status constraint found on orders table';
  END IF;

  -- Add new constraint with 'waiting_confirmation' status
  ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'waiting_confirmation', 'success', 'paid', 'failed', 'refunded'));
END $$;

-- ==============================================================================
-- 4. RLS POLICIES UNTUK BUCKET 'transfer'
-- ==============================================================================
-- Catatan: storage.objects dimiliki oleh supabase_storage_admin.
-- Jika Anda mendapat error "must be owner of table objects", jalankan
-- policy creation melalui Supabase Dashboard > Storage > Policies.

-- 4a. Policy: Customer bisa upload bukti transfer ke folder sendiri
-- Struktur folder: transfer/{customer_id}/{order_id}/bukti.jpg
DO $$ BEGIN
  CREATE POLICY "Customers can upload transfer proof"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'transfer'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Customers can upload transfer proof" already exists';
END $$;

-- 4b. Policy: Customer bisa melihat bukti transfer miliknya sendiri
DO $$ BEGIN
  CREATE POLICY "Customers can view own transfer proof"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'transfer'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Customers can view own transfer proof" already exists';
END $$;

-- 4c. Policy: Merchant bisa melihat bukti transfer untuk ordernya
-- Merchant mengakses via folder: transfer/{customer_id}/{order_id}/
-- Karena merchant_id tidak ada di path, kita berikan akses SELECT ke semua
-- authenticated user di bucket transfer (RLS di level aplikasi yang filter)
DO $$ BEGIN
  CREATE POLICY "Merchants can view transfer proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'transfer');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Merchants can view transfer proofs" already exists';
END $$;

-- 4d. Policy: Service role bisa melakukan apa saja (untuk admin/system operations)
DO $$ BEGIN
  CREATE POLICY "Service role can manage transfer bucket"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'transfer')
  WITH CHECK (bucket_id = 'transfer');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Service role can manage transfer bucket" already exists';
END $$;

-- 4e. Policy: Admin bisa melihat dan mengelola semua bukti transfer
DO $$ BEGIN
  CREATE POLICY "Admin can manage transfer proofs"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'transfer'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'transfer'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Policy "Admin can manage transfer proofs" already exists';
END $$;

-- ==============================================================================
-- 5. HELPER FUNCTION: Generate path file bukti transfer
-- ==============================================================================
-- Fungsi untuk generate path yang konsisten untuk bukti transfer
-- Format: transfer/{customer_id}/{order_id}/{filename}
CREATE OR REPLACE FUNCTION generate_transfer_proof_path(
  customer_id UUID,
  order_id UUID,
  filename TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN 'transfer/' || customer_id::text || '/' || order_id::text || '/' || filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- STRUKTUR FOLDER YANG DIREKOMENDASIKAN:
-- ==============================================================================
-- transfer/
--   ├── {customer_id}/
--   │   ├── {order_id}/
--   │   │   ├── bukti-transfer.jpg
--   │   │   ├── bukti-transfer.png
--   │   │   └── ...
--   │   └── ...
--   └── ...
--
-- Contoh path:
--   transfer/550e8400-e29b-41d4-a716-446655440000/a1b2c3d4-e5f6-7890-abcd-ef1234567890/bukti-transfer.jpg
--
-- FLOW:
-- 1. Customer membuat order → status: 'pending'
-- 2. Customer upload bukti transfer → status: 'waiting_confirmation'
--    - Upload ke: transfer/{customer_id}/{order_id}/bukti-transfer.jpg
--    - Simpan URL ke: orders.transfer_proof_url
-- 3. Merchant konfirmasi → status: 'success'
--    - Merchant melihat bukti via signed URL
-- 4. Jika ditolak → status: 'failed'
--    - Customer bisa upload ulang bukti transfer
-- ==============================================================================

-- ==============================================================================
-- VERIFIKASI KONFIGURASI
-- ==============================================================================
-- Jalankan query berikut untuk memverifikasi setup:
--
-- SELECT * FROM storage.buckets WHERE id = 'transfer';
-- SELECT policyname, cmd, qual, with_check FROM pg_policies
--   WHERE tablename = 'objects' AND policyname LIKE '%transfer%';
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'orders' AND column_name = 'transfer_proof_url';
-- SELECT conname, pg_get_constraintdef(oid)
--   FROM pg_constraint WHERE conrelid = 'public.orders'::regclass AND contype = 'c';
-- ==============================================================================
