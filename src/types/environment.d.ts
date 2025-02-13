// types/environment.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      OPENROUTER_API_KEY: string;
      SUPABASE_ADMIN_KEY_ROLE: string;
    }
  }
}

export {};
