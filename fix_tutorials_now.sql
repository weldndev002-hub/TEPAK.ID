-- 1. Tambahkan kolom description jika belum ada
ALTER TABLE public.tutorials ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Pastikan RLS aktif
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- 3. Hapus kebijakan lama agar tidak bentrok
DROP POLICY IF EXISTS "Public can view published tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admins can manage tutorials" ON public.tutorials;

-- 4. Izinkan Publik melihat tutorial yang sudah dipublish
CREATE POLICY "Public can view published tutorials" 
ON public.tutorials FOR SELECT 
USING (status = 'published');

-- 5. Izinkan Admin (Pemilik/Acep) mengelola SEMUA tutorial (CRUD)
CREATE POLICY "Admins can manage tutorials" 
ON public.tutorials FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'admin' OR username = 'acepali')
  )
);
