/**
 * AuthFooterLink Tests — "Cuál es mi nombre" Web
 *
 * Tests for the auth-pages footer link that preserves the current
 * `?next=` param across lateral auth navigation (signup → login,
 * login → signup, recovery → login, etc.).
 *
 * @module __tests__/auth/auth-footer-link.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthFooterLink } from "@/components/auth/auth-footer-link";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

// Mutable search params override per test — reset in beforeEach
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/signup",
  useSearchParams: () => mockSearchParams,
  redirect: vi.fn(),
}));

beforeEach(() => {
  mockSearchParams = new URLSearchParams();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AuthFooterLink — ?next preservation", () => {
  it("renders href as-is when no ?next is present", () => {
    render(<AuthFooterLink href="/login">Inicia sesión</AuthFooterLink>);

    expect(screen.getByRole("link", { name: "Inicia sesión" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("preserves a valid internal ?next on the target href", () => {
    mockSearchParams = new URLSearchParams("next=/dashboard/plans");

    render(<AuthFooterLink href="/login">Inicia sesión</AuthFooterLink>);

    expect(screen.getByRole("link", { name: "Inicia sesión" })).toHaveAttribute(
      "href",
      "/login?next=%2Fdashboard%2Fplans",
    );
  });

  it("preserves ?next with query string (encoded round-trip)", () => {
    mockSearchParams = new URLSearchParams("next=/dashboard/plans?status=approved");

    render(<AuthFooterLink href="/signup">Regístrate</AuthFooterLink>);

    expect(screen.getByRole("link", { name: "Regístrate" })).toHaveAttribute(
      "href",
      "/signup?next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved",
    );
  });

  it("drops invalid external ?next (protocol-relative)", () => {
    mockSearchParams = new URLSearchParams("next=//evil.com/steal");

    render(<AuthFooterLink href="/login">Inicia sesión</AuthFooterLink>);

    expect(screen.getByRole("link", { name: "Inicia sesión" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("drops invalid external ?next (https absolute URL)", () => {
    mockSearchParams = new URLSearchParams("next=https://evil.com/steal");

    render(<AuthFooterLink href="/signup">Regístrate</AuthFooterLink>);

    expect(screen.getByRole("link", { name: "Regístrate" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("drops invalid ?next (javascript: scheme)", () => {
    mockSearchParams = new URLSearchParams("next=javascript:alert(1)");

    render(<AuthFooterLink href="/login">Inicia sesión</AuthFooterLink>);

    expect(screen.getByRole("link", { name: "Inicia sesión" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("applies the provided className", () => {
    render(
      <AuthFooterLink href="/login" className="text-primary underline">
        Inicia sesión
      </AuthFooterLink>,
    );

    expect(screen.getByRole("link", { name: "Inicia sesión" })).toHaveClass(
      "text-primary",
      "underline",
    );
  });
});
