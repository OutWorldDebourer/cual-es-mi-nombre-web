/**
 * Credit Balance Tests — "Cuál es mi nombre" Web
 *
 * Tests for the CreditBalance component: rendering, progress bar,
 * low credit warning, zero credit message, upgrade button.
 *
 * @module __tests__/credits/credit-balance.test
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CreditBalance } from "@/components/credits/credit-balance";

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
});
