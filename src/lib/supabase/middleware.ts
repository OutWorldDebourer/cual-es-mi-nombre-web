/**
 * Supabase Middleware Helper — "Cuál es mi nombre" Web
 *
 * Refreshes the user session on every request and protects
 * /dashboard/* routes (redirects unauthenticated users to /login).
 *
 * This pattern follows @supabase/ssr best practices for Next.js 15+.
 *
 * @module lib/supabase/middleware
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT use supabase.auth.getSession() here.
  // getUser() triggers a server-side token refresh if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /dashboard routes — redirect to /login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages to dashboard.
  // All public auth routes — if a user already has a session, these are unreachable states.
  const AUTH_ROUTES = ["/login", "/signup", "/recovery", "/set-password"];
  if (user && AUTH_ROUTES.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
