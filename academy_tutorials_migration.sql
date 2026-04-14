-- ==========================================
-- ACADEMY TUTORIALS ENHANCEMENT MIGRATION
-- ==========================================

-- 1. Update table structure
-- We add 'description' to match the frontend and keep 'content_html' for future rich text.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tutorials' AND COLUMN_NAME = 'description') THEN
        ALTER TABLE public.tutorials ADD COLUMN description TEXT;
    END IF;
END $$;

-- 2. Ensure RLS is enabled
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- 3. Update RLS Policies
-- Drop existing to avoid conflicts
DROP POLICY IF EXISTS "Public can view published tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admins can manage tutorials" ON public.tutorials;

-- Public/Creators can view published tutorials
CREATE POLICY "Public can view published tutorials" 
ON public.tutorials FOR SELECT 
USING (status = 'published');

-- Admins can do everything
-- Note: We use the logic from profiles to check if user is admin
CREATE POLICY "Admins can manage tutorials" 
ON public.tutorials FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'admin' OR username = 'acepali') 
    -- 'acepali' or the owner email whitelist logic also applies via role check
  )
);

-- 4. Initial Dummy Data (Optional, if table is empty)
INSERT INTO public.tutorials (title, category, video_url, description, thumbnail_url, duration, status)
SELECT 'Setting Up Your Tepak.ID Profile', 'Onboarding', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Pelajari cara melengkapi profil Anda agar terlihat profesional di mata pelanggan.', 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', '05:30', 'published'
WHERE NOT EXISTS (SELECT 1 FROM public.tutorials WHERE title = 'Setting Up Your Tepak.ID Profile');
