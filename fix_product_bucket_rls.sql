-- Fix RLS for 'product' bucket to allow authenticated users to upload
-- This script assumes the bucket 'product' already exists

-- 1. Ensure the bucket is public (optional, if already set)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product';

-- 2. Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload products" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own products" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own products" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to product files" ON storage.objects;

-- 3. Create Policy: Allow public to view (SELECT)
CREATE POLICY "Allow public access to product files"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product' );

-- 4. Create Policy: Allow authenticated users to upload (INSERT)
-- We check if the user is authenticated and if the folder path starts with their user ID
CREATE POLICY "Allow authenticated users to upload products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Create Policy: Allow users to update their own files (UPDATE)
CREATE POLICY "Allow users to update their own products"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Create Policy: Allow users to delete their own files (DELETE)
CREATE POLICY "Allow users to delete their own products"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'product' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
