/**
 * useAuth.ts
 * ----------
 * Custom hook for authentication state and actions.
 *
 * Responsibilities:
 * - Syncs Supabase auth state → Zustand store on mount
 * - Exposes signIn / signUp / signOut actions with loading + error state
 * - Handles post-auth redirects via Next.js router
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, signIn, signOut, isLoading } = useAuth();
 * ```
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPasswordForEmail as authSignInReset,
  updateUserPassword as authUpdatePassword,
  verifyOtp as authVerifyOtp,
} from "@/services/authService";
import { fetchProfile } from "@/services/transactionService";
import type { LoginInput, RegisterInput } from "@/types/database.types";
import { createClient } from "@/lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoadingUser, setUser, setLoadingUser, reset } =
    useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Sync auth state on mount ──────────────────────────────────────────────
  useEffect(() => {
    // If the global store has already initialized OR is currently loading, don't run loadUser again.
    // This strictly prevents race conditions where multiple components mount simultaneously.
    if (useAppStore.getState().isInitialized) return;
    
    // Mark as initialized immediately to lock out other components from starting a parallel fetch
    useAppStore.getState().setInitialized(true);

    const supabase = createClient();
    let mounted = true;

    const ensureProfile = async (authUser: { id: string; email?: string; user_metadata?: Record<string, string> }) => {
      try {
        const profile = await fetchProfile(authUser.id);
        return profile;
      } catch {
        // Profile not found — upsert one for legacy accounts

        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            id: authUser.id,
            email: authUser.email ?? "",
            full_name: authUser.user_metadata?.full_name ?? authUser.email ?? "Người dùng",
            total_balance: 0,
          }, { onConflict: "id", ignoreDuplicates: true });

        if (upsertError) return null;
        
        try {
          return await fetchProfile(authUser.id);
        } catch {
          return null;
        }
      }
    };

    // Only rely on onAuthStateChange which fires INITIAL_SESSION synchronously
    // This strictly prevents Supabase Auth deadlocks caused by concurrent getUser() and listener firing.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session?.user) {
        if (mounted) {
          setUser(null);
          setLoadingUser(false);
          reset();
        }
        return;
      }

      if (session?.user) {
        const currentUser = useAppStore.getState().user;
        // If we just hydrated this exact user from AuthBootstrap, skip the redundant fetch!
        if (currentUser?.id === session.user.id) {
          setLoadingUser(false);
          return;
        }

        setLoadingUser(true);
        // CRITICAL FIX: Break out of the onAuthStateChange execution stack using setTimeout.
        // If we await fetchProfile here, PostgREST tries to acquire the auth token lock 
        // which is currently held by GoTrue during this listener, causing a dead-lock!
        setTimeout(async () => {
          const profile = await ensureProfile(session.user);
          if (mounted) {
            setUser(profile);
            setLoadingUser(false);
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setLoadingUser, reset]);

  // ── Sign In ───────────────────────────────────────────────────────────────
  const signIn = useCallback(
    async (input: LoginInput, redirectTo?: string) => {
      setError(null);
      setIsSubmitting(true);

      const { error: authError } = await authSignIn(input);

      setIsSubmitting(false);

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Email hoặc mật khẩu không đúng."
            : authError.message
        );
        return { success: false };
      }

      router.refresh(); // Force Next.js Server Components to fetch new cookies
      router.push(redirectTo ?? "/dashboard");
      return { success: true };
    },
    [router]
  );

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (input: RegisterInput) => {
      setError(null);
      setIsSubmitting(true);

      const { data, error: authError } = await authSignUp({
        email: input.email,
        password: input.password,
        full_name: input.full_name,
        confirm_password: input.confirm_password,
      });

      setIsSubmitting(false);

      if (authError) {
        setError(authError.message);
        return { success: false };
      }

      // Force registration logic:
      // Even if email verification is off and Supabase creates a session gracefully,
      // the business requirement dictates users must manually log in afterward.
      if (data?.session) {
        await authSignOut();
      }

      router.push(`/verify-otp?email=${encodeURIComponent(input.email)}`);
      return { success: true };
    },
    [router]
  );

  // ── Sign Out ──────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await authSignOut();
    reset();
    router.push("/login");
  }, [router, reset]);

  // ── Password Reset ───────────────────────────────────────────────────────
  const sendPasswordResetEmail = useCallback(async (email: string) => {
    setError(null);
    setIsSubmitting(true);
    const { error: authError } = await authSignInReset(email);
    setIsSubmitting(false);
    if (authError) {
      setError(authError.message);
      return { success: false };
    }
    return { success: true };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    setError(null);
    setIsSubmitting(true);
    const { error: authError } = await authUpdatePassword(password);
    setIsSubmitting(false);
    if (authError) {
      setError(authError.message);
      return { success: false };
    }
    return { success: true };
  }, []);

  // ── OTP Verification ────────────────────────────────────────────────────
  const verifyEmailOtp = useCallback(async (email: string, token: string) => {
    setError(null);
    setIsSubmitting(true);
    const { error: authError } = await authVerifyOtp(email, token, 'signup');
    setIsSubmitting(false);
    if (authError) {
      setError(authError.message);
      return { success: false };
    }
    
    // Automatically refresh and push to dashboard upon success
    router.refresh();
    router.push("/dashboard");
    return { success: true };
  }, [router]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoadingUser,
    isSubmitting,
    error,
    clearError: () => setError(null),
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    verifyEmailOtp,
  };
}
