/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly ADMIN_PASSCODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace App {
    interface Locals {
      supabase: import('@supabase/supabase-js').SupabaseClient;
      getUser: () => Promise<import('@supabase/supabase-js').User | null>;
      isAdmin: boolean;
      isMasterAdmin: boolean;
      runtime: {
        env: Record<string, any>;
        cf: any;
        ctx: any;
      };
    }
  }
}

export {};
