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
      // Make env vars available at build time (must be set in environment)
      'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify(process.env.PUBLIC_SUPABASE_URL || ''),
      'import.meta.env.PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.PUBLIC_SUPABASE_ANON_KEY || ''),
      'import.meta.env.PUBLIC_DUITKU_MERCHANT_CODE': JSON.stringify(process.env.PUBLIC_DUITKU_MERCHANT_CODE || ''),
    },
    ssr: {
      noExternal: ['@heroicons/react', 'lucide-react', '@supabase/supabase-js', '@supabase/ssr']
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