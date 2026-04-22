// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    define: {
      // Explicitly make env vars available at build time
      'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL || 'https://aaqguhxonwpsnpwjjdrv.supabase.co'),
      'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_c35EcVd0HpFsfaQZNq_uvA_mRJes_BO'),
      'import.meta.env.PUBLIC_DUITKU_MERCHANT_CODE': JSON.stringify(process.env.PUBLIC_DUITKU_MERCHANT_CODE || 'DS29376'),
    },
    ssr: {
      noExternal: ['@heroicons/react', 'lucide-react', '@supabase/supabase-js', '@supabase/ssr', 'react', 'react-dom']
    },
    optimizeDeps: {
      include: ['@heroicons/react/24/outline', 'clsx', 'tailwind-merge']
    }
  },

  output: 'server',
  adapter: cloudflare(),
  security: {
    checkOrigin: false
  }
});