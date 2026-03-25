/**
 * Middleware Tests — updateSession route protection (A8.1.13.2)
 *
 * Tests verify:
 * - Unauthenticated users are redirected away from /dashboard/*
 * - Authenticated users are redirected away from auth pages
 * - Passthrough for allowed routes
 *
 * @module __tests__/auth/middleware.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// ── Mock @supabase/ssr before importing the module under test ───────────

const mockGetUser = vi.fn();

// Ensure env vars exist so .trim() doesn't blow up
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://localhost:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= "test-anon-key";

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

// ── Import after mocks are set up ───────────────────────────────────────

import { updateSession } from "@/lib/supabase/middleware";

// ── Helpers ─────────────────────────────────────────────────────────────

function makeRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

function setAuthenticated(authenticated: boolean) {
  if (authenticated) {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "test@example.com" },
      },
      error: null,
    });
  } else {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
  }
}

function isRedirect(response: NextResponse, to: string): boolean {
  // NextResponse.redirect sets status 307 and Location header
  const location = response.headers.get("location");
  if (!location) return false;
  const url = new URL(location);
  return url.pathname === to && (response.status === 307 || response.status === 308);
}

// ── Tests ───────────────────────────────────────────────────────────────

describe("updateSession middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Unauthenticated: protected routes redirect to /login ────────────

  it("redirects unauthenticated user from /dashboard to /login", async () => {
    setAuthenticated(false);
    const response = await updateSession(makeRequest("/dashboard"));
    expect(isRedirect(response, "/login")).toBe(true);
  });

  it("redirects unauthenticated user from /dashboard/settings to /login", async () => {
    setAuthenticated(false);
    const response = await updateSession(makeRequest("/dashboard/settings"));
    expect(isRedirect(response, "/login")).toBe(true);
  });

  // ── Authenticated: auth pages redirect to /dashboard ────────────────

  it("redirects authenticated user from /login to /dashboard", async () => {
    setAuthenticated(true);
    const response = await updateSession(makeRequest("/login"));
    expect(isRedirect(response, "/dashboard")).toBe(true);
  });

  it("redirects authenticated user from /signup to /dashboard", async () => {
    setAuthenticated(true);
    const response = await updateSession(makeRequest("/signup"));
    expect(isRedirect(response, "/dashboard")).toBe(true);
  });

  it("redirects authenticated user from /recovery to /dashboard", async () => {
    setAuthenticated(true);
    const response = await updateSession(makeRequest("/recovery"));
    expect(isRedirect(response, "/dashboard")).toBe(true);
  });

  it("redirects authenticated user from /set-password to /dashboard", async () => {
    setAuthenticated(true);
    const response = await updateSession(makeRequest("/set-password"));
    expect(isRedirect(response, "/dashboard")).toBe(true);
  });

  // ── Passthrough: unauthenticated on public routes ───────────────────

  it("allows unauthenticated user to access /login (no redirect)", async () => {
    setAuthenticated(false);
    const response = await updateSession(makeRequest("/login"));
    // No redirect — response is a passthrough (200)
    const location = response.headers.get("location");
    expect(location).toBeNull();
    expect(response.status).toBe(200);
  });
});
