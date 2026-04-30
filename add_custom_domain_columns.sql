-- ==============================================================================
-- CUSTOM DOMAIN SUPPORT FOR PRO USERS
-- ==============================================================================

-- 1. Add columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain_status TEXT DEFAULT 'none' CHECK (custom_domain_status IN ('none', 'pending', 'active', 'failed', 'deleted')),
ADD COLUMN IF NOT EXISTS custom_domain_config JSONB DEFAULT '{}'::jsonb;

-- 2. Add comment for documentation
COMMENT ON COLUMN public.profiles.custom_domain IS 'User custom domain (e.g. www.webku.com)';
COMMENT ON COLUMN public.profiles.custom_domain_status IS 'Status of the custom domain in Cloudflare';
COMMENT ON COLUMN public.profiles.custom_domain_config IS 'Additional configuration and CF IDs (hostname_id, ssl_status, etc.)';

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON public.profiles(custom_domain) WHERE custom_domain IS NOT NULL;
