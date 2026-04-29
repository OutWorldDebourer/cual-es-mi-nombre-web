/**
 * Credit Balance Tests — "Cuál es mi nombre" Web
 *
 * Tests for the CreditBalance component: rendering, progress bar,
 * low credit warning, zero credit message, upgrade button, free-tier
 * expiry badge and throttle window banner.
 *
 * @module __tests__/credits/credit-balance.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CreditBalance } from "@/components/credits/credit-balance";
import type { CreditWindow } from "@/lib/api";

vi.mock("@/components/dashboard/count-up", () => ({
  CountUp: ({ end, suffix, className }: { end: number; suffix?: string; className?: string }) => (
    <span className={className}>{end}{suffix}</span>
  ),
}));

// Configurable mock for backendApi.credits.getWindow + payments.createTopupPreference
const getWindowMock = vi.fn<() => Promise<CreditWindow>>();
const createTopupPreferenceMock = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    backendApi: () => ({
      credits: { getWindow: getWindowMock },
      payments: { createTopupPreference: createTopupPreferenceMock },
    }),
  };
});

beforeEach(() => {
  getWindowMock.mockReset();
  createTopupPreferenceMock.mockReset();
});

describe("CreditBalance", () => {
  it("renders credit count and plan", () => {
    render(
      <CreditBalance
        creditsRemaining={250}
        creditsTotal={300}
        plan="basic"
      />,
    );

    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("/ 300")).toBeInTheDocument();
    expect(screen.getByText("basic")).toBeInTheDocument();
  });

  it("shows low credit warning when below 20%", () => {
    render(
      <CreditBalance
        creditsRemaining={50}
        creditsTotal={300}
        plan="basic"
      />,
    );

    expect(
      screen.getByText(/Te quedan pocos créditos/),
    ).toBeInTheDocument();
  });

  it("shows zero credit message when at 0", () => {
    render(
      <CreditBalance
        creditsRemaining={0}
        creditsTotal={300}
        plan="basic"
      />,
    );

    expect(screen.getByText(/Sin créditos restantes/)).toBeInTheDocument();
  });

  it("hides upgrade button for premium plan", () => {
    render(
      <CreditBalance
        creditsRemaining={2500}
        creditsTotal={3000}
        plan="premium"
      />,
    );

    expect(screen.queryByText("Mejorar plan")).not.toBeInTheDocument();
  });

  it("shows upgrade button for non-premium plans", () => {
    render(
      <CreditBalance
        creditsRemaining={100}
        creditsTotal={300}
        plan="basic"
      />,
    );

    expect(screen.getByText("Mejorar plan")).toBeInTheDocument();
  });

  it("renders expiry badge when free and expires_at set", () => {
    // Pretend window fetch never resolves so the badge is the only free-tier
    // signal under test.
    getWindowMock.mockReturnValue(new Promise(() => {}));

    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    render(
      <CreditBalance
        creditsRemaining={20}
        creditsTotal={50}
        plan="free"
        freeCreditsExpiresAt={future}
      />,
    );

    expect(screen.getByText(/Expira en \d+ días/)).toBeInTheDocument();
  });

  it("renders throttle banner when window not allowed", async () => {
    getWindowMock.mockResolvedValue({
      credits_used: 5,
      credits_limit: 5,
      window_seconds: 600,
      retry_after_seconds: 180,
      resets_at_epoch: 0,
      allowed: false,
    });

    render(
      <CreditBalance
        creditsRemaining={0}
        creditsTotal={50}
        plan="free"
        freeCreditsExpiresAt={null}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Has usado tus 5 créditos de esta ventana/),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/Vuelve en 3 min/)).toBeInTheDocument();
  });

  it("does not render expiry badge when plan basic", () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    render(
      <CreditBalance
        creditsRemaining={100}
        creditsTotal={300}
        plan="basic"
        freeCreditsExpiresAt={future}
      />,
    );

    expect(screen.queryByText(/Expira en/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Expirado/)).not.toBeInTheDocument();
  });
});
