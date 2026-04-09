"use server";

import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

/**
 * logout.ts — Server Action
 * -------------------------
 * Clears the Supabase session cookie on the server and redirects to /login.
 * This is the most reliable way to sign out in Next.js App Router because:
 * 1. It runs on the server → can properly clear HttpOnly cookies
 * 2. It bypasses any client-side state issues
 * 3. redirect() forces a hard navigation, clearing all React state
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
