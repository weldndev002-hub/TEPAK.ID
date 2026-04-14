/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare global {
  namespace App {
    interface Locals {
      supabase: import('@supabase/ssr').SupabaseClient;
      getUser: () => Promise<import('@supabase/supabase-js').User | null>;
    }
  }
}

export {};
