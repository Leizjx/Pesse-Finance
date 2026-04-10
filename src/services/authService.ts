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
// PASSWORD RESET
// ─────────────────────────────────────────────

/**
 * Initiates the password reset flow by sending a recovery email.
 */
export async function resetPasswordForEmail(email: string) {
  const supabase = createClient();
  
  // Use current origin to build the redirect URL
  // The user should land on the /update-password page after clicking the link
  const redirectTo = `${window.location.origin}/update-password`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  return { data, error };
}

/**
 * Updates the user's password.
 * This should be called when the user is already signed in (e.g., via a recovery link).
 */
export async function updateUserPassword(password: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  return { data, error };
}

/**
 * Verifies an OTP (One-Time Password) for signup or recovery.
 */
export async function verifyOtp(email: string, token: string, type: 'signup' | 'recovery' | 'magiclink' | 'invite' | 'email_change' | 'email') {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type,
  });

  return { data, error };
}

// ─────────────────────────────────────────────
// SOCIAL AUTH LOGINS
// ─────────────────────────────────────────────

export async function signInWithSocial(provider: 'google' | 'facebook') {
  const supabase = createClient();
  
  // Use current origin to dynamically build the redirect URL
  const redirectTo = `${window.location.origin}/auth/callback`;
  
  interface OAuthOptions {
    redirectTo: string;
    queryParams?: Record<string, string>;
    scopes?: string;
  }

  let options: OAuthOptions = { redirectTo };

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
