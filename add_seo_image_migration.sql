-- ==============================================================================
-- ADD SEO IMAGE COLUMN TO user_settings
-- ==============================================================================

-- Add seo_image column to store the URL of the OG Image from the SEO bucket
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS seo_image TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT DEFAULT NULL;

-- Add comment to explain the columns
COMMENT ON COLUMN public.user_settings.seo_image IS 'URL for the Open Graph (OG) Image stored in the SEO bucket';
COMMENT ON COLUMN public.user_settings.seo_keywords IS 'Comma separated keywords for SEO metadata';

-- Verification query
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_settings' AND column_name = 'seo_image';
