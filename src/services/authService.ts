/**
 * authService.ts
 * --------------
 * All Supabase Auth calls isolated in one place.
 * UI components never interact with Supabase directly — they call these functions.
 *
 * Pattern: Each function returns { data, error } so callers can handle errors
 * uniformly without try/catch boilerplate everywhere.
 */

import { createClient } from "@/lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { LoginInput, RegisterInput } from "@/types/database.types";

// ─────────────────────────────────────────────
// SIGN IN
// ─────────────────────────────────────────────

export async function signIn({ email, password }: LoginInput) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

// ─────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────

export async function signUp({
  email,
  password,
  full_name,
}: RegisterInput & { full_name: string }) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  return { data, error };
}

// ─────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ─────────────────────────────────────────────
// GET CURRENT USER (client-side)
// ─────────────────────────────────────────────

export async function getUser() {
  const supabase = createClient();

  // Use getUser() not getSession() — validates JWT against server
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
}

// ─────────────────────────────────────────────
// AUTH STATE CHANGE LISTENER
// ─────────────────────────────────────────────

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * Usage:
 * ```ts
 * const unsubscribe = onAuthStateChange((user) => setUser(user));
 * return () => unsubscribe();
 * ```
 */
export function onAuthStateChange(
  callback: (user: ReturnType<typeof getUser> extends Promise<infer T> ? T : never) => void
) {
  const supabase = createClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
    if (session?.user) {
      callback({ user: session.user, error: null } as Parameters<typeof callback>[0]);
    } else {
      callback({ user: null, error: null } as Parameters<typeof callback>[0]);
    }
  });

  return () => subscription.unsubscribe();
}

// ─────────────────────────────────────────────
// SOCIAL AUTH LOGINS
// ─────────────────────────────────────────────

export async function signInWithSocial(provider: 'google' | 'facebook') {
  const supabase = createClient();
  
  // Use current origin to dynamically build the redirect URL
  const redirectTo = `${window.location.origin}/auth/callback`;
  
  let options: any = { redirectTo };

  if (provider === 'google') {
    options = {
      ...options,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      scopes: 'https://www.googleapis.com/auth/gmail.readonly',
    };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options,
  });

  return { data, error };
}
