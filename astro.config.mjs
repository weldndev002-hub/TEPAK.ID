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