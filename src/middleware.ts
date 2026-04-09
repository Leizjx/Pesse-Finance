/**
 * middleware.ts
 * ------------
 * Next.js Middleware — runs on the Edge before every matched request.
 *
 * SECURITY MODEL:
 * - Uses `supabase.auth.getUser()` for JWT validation (not `getSession()`)
 *   because getSession() only reads from the cookie without re-validating
 *   against the Supabase server. getUser() performs a network check.
 * - Automatically refreshes the session cookie if the access token is
 *   near expiry (Supabase SSR handles this transparently via setAll).
 * - Unauthenticated users hitting protected routes are redirected to /login.
 * - Authenticated users hitting /login or /register are redirected to /dashboard.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ⚠️ IMPORTANT: Do NOT add any logic between createServerClient and
  // supabase.auth.getUser() — it could break session refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes — require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

  // Auth routes — redirect authenticated users away
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // If user is authenticated, prevent showing them the generic landing page
  if (pathname === "/" && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (isProtectedRoute && !user) {
    // Not authenticated → redirect to login, preserve intended destination
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is accessing protected routes, ensure they have a profile created!
  if (isProtectedRoute && user) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      // Profile is missing, redirect to sync-profile
      const syncUrl = request.nextUrl.clone();
      syncUrl.pathname = "/sync-profile";
      syncUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(syncUrl);
    }
  }

  if (isAuthRoute && user) {
    // Already authenticated → redirect to dashboard
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // IMPORTANT: Return supabaseResponse (not NextResponse.next()) so that
  // updated cookies are forwarded to the browser.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
