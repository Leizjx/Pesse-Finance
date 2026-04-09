/**
 * supabaseServer.ts
 * -----------------
 * Server-side Supabase client for use in:
 *   - React Server Components (RSC)
 *   - Server Actions
 *   - Route Handlers (app/api/...)
 *
 * SECURITY: This client reads/writes cookies() via Next.js headers.
 * It validates the JWT on every request — NOT relying on localStorage.
 * Never expose server client methods to the browser.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll() is called from Server Components which are read-only.
            // This is expected — the Middleware handles cookie refresh.
          }
        },
      },
    }
  );
}
