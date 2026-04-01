/**
 * Test Setup — "Cuál es mi nombre" Web
 *
 * Configures the testing environment:
 * - Extends matchers with jest-dom (toBeInTheDocument, etc.)
 * - Mocks Supabase client (browser + server)
 * - Mocks next/navigation
 *
 * @module __tests__/setup
 */

import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// ── Mock: window.matchMedia (required by useIsMobile hook & useReducedMotion) ─

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    // Return true for reduced-motion so CountUp shows final values immediately
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── Mock: IntersectionObserver (required by motion's useInView) ──────────

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(private cb: IntersectionObserverCallback) {
    // Immediately report all observed elements as intersecting
    setTimeout(() => this.cb([] as unknown as IntersectionObserverEntry[], this), 0);
  }
  observe() { /* noop */ }
  unobserve() { /* noop */ }
  disconnect() { /* noop */ }
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

// ── Mock: Supabase browser client ────────────────────────────────────────

export const mockSupabaseClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          access_token: "mock-token",
          user: { id: "test-user-id", email: "test@example.com" },
        },
      },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn(),
  }),
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabaseClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => Promise.resolve(mockSupabaseClient),
}));

// ── Mock: next/navigation ────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// ── Mock: next/headers ───────────────────────────────────────────────────

vi.mock("next/headers", () => ({
  cookies: () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));
