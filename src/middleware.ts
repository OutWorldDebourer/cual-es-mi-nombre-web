/**
 * Next.js Root Middleware — "Cuál es mi nombre" Web
 *
 * Runs on every matched request to:
 * 1. Refresh Supabase auth session (via cookies)
 * 2. Protect /dashboard/* routes (redirect to /login if unauthenticated)
 * 3. Redirect authenticated users away from /login and /signup
 *
 * @module middleware
 */

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - Public assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
