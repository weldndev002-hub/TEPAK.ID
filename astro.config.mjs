// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// Load .env file properly (Astro v6 / Vite standard)
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    define: {
      // Avoid hardcoding empty strings at build time
    },
    ssr: {
      noExternal: ['@heroicons/react', 'lucide-react', '@supabase/supabase-js', '@supabase/ssr']
    },
    optimizeDeps: {
      include: ['@heroicons/react/24/outline', 'clsx', 'tailwind-merge']
    },
    server: {
      warmup: {
        clientFiles: ['./src/pages/**/*.{astro,tsx}']
      }
    }
  },

  output: 'server',
  adapter: cloudflare(),
  security: {
    checkOrigin: false
  }
});