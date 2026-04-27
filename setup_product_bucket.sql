-- ==============================================================================
-- KONFIGURASI BUCKET PRODUCT UNTUK DIGITAL DELIVERY
-- ==============================================================================
-- Script ini untuk mengkonfigurasi bucket 'product' agar:
-- 1. Creator bisa upload file
-- 2. Pembeli bisa download file setelah order
-- 3. File aman dengan RLS (Row Level Security)
-- ==============================================================================

-- 1. Buat bucket 'product' (jika belum ada)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product',
  'product',
  true, -- public agar bisa diakses untuk download
  104857600, -- 100MB max file size
  ARRAY['application/pdf', 'application/zip', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg']
) ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS pada bucket product
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Creator bisa upload file ke bucket product
CREATE POLICY "Creators can upload to product bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Policy: Creator bisa update file miliknya
CREATE POLICY "Creators can update own files in product bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Policy: Creator bisa delete file miliknya
CREATE POLICY "Creators can delete own files in product bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Policy: Public bisa download file dari bucket product (untuk digital delivery)
CREATE POLICY "Public can download files from product bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product');

-- 7. Policy: Authenticated users bisa download file (fallback)
CREATE POLICY "Authenticated can download files from product bucket"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product');

-- 8. Policy: Service role bisa melakukan apa saja (untuk system operations)
CREATE POLICY "Service role can manage product bucket"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'product');

-- ==============================================================================
-- STRUKTUR FOLDER YANG DIREKOMENDASIKAN:
-- product/
--   ├── {user_id}/
--   │   ├── {product_id}/
--   │   │   ├── file.pdf
--   │   │   ├── preview.jpg
--   │   │   └── ...
--   │   └── ...
--   └── ...
--
-- Contoh path: product/550e8400-e29b-41d4-a716-446655440000/ad84f1bb-530f-430e-ab28-c144bc877aac/file.pdf
-- ==============================================================================

-- ==============================================================================
-- FUNGSI BANTUAN UNTUK PATH FILE
-- ==============================================================================

-- Fungsi untuk generate path file yang konsisten
CREATE OR REPLACE FUNCTION generate_product_file_path(
  user_id UUID,
  product_id UUID,
  filename TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN 'product/' || user_id::text || '/' || product_id::text || '/' || filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- VERIFIKASI KONFIGURASI
-- ==============================================================================

-- Cek apakah bucket sudah dibuat
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product'
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    RAISE NOTICE '✅ Bucket "product" berhasil dikonfigurasi';
  ELSE
    RAISE NOTICE '❌ Bucket "product" gagal dibuat';
  END IF;
END $$;

-- Tampilkan policies yang sudah dibuat
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%product%';

-- ==============================================================================
-- CATATAN PENTING:
-- 1. Pastikan folder structure mengikuti pattern: product/{user_id}/{product_id}/{filename}
-- 2. File akan disimpan dengan path yang unik per user dan product
-- 3. Public download diizinkan untuk mendukung digital delivery
-- 4. Creator hanya bisa mengelola file di folder mereka sendiri
-- ==============================================================================