/**
 * supabaseClient.ts
 * -----------------
 * Browser-side Supabase client.
 * Uses `createBrowserClient` from @supabase/ssr which automatically
 * manages cookies for SSR-compatible session persistence.
 *
 * SECURITY: Never import this in Server Components or API routes.
 * Use `supabaseServer.ts` for server-side operations.
 */

import { createBrowserClient } from "@supabase/ssr";

// Validate env vars at module load (fail fast in dev)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[Pesse] Missing Supabase environment variables.\n" +
      "Please copy .env.local.example to .env.local and fill in your values."
  );
}

/**
 * Singleton browser client.
 * We MUST memoize it to prevent multiple GoTrueClient instances from fighting over the auth lock.
 */
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  return browserClient;
}
