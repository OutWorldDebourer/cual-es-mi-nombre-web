/**
 * CreditsCard Tests — "Cuál es mi nombre" Web
 *
 * Tests for the live-updating credits display used by both the
 * dashboard credits card and the sidebar badge. The component seeds
 * its state from an `initial` prop and re-renders when a
 * `credits:update` CustomEvent is dispatched on `window`.
 *
 * See audit chat web 2026-04-17, Bug #1 (iter5).
 *
 * @module __tests__/dashboard/credits-card.test
 */

import { describe, it, expect, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import {
  CreditsCard,
  CREDITS_UPDATE_EVENT,
} from "@/components/dashboard/credits-card";

// Stub CountUp so the animated path renders the final number synchronously,
// avoiding requestAnimationFrame timing in tests.
vi.mock("@/components/dashboard/count-up", () => ({
  CountUp: ({ end, className }: { end: number; className?: string }) => (
    <span className={className} data-testid="count-up">
      {end}
    </span>
  ),
}));

describe("CreditsCard", () => {
  it("renders the initial balance passed via props", () => {
    render(<CreditsCard initial={2808} />);
    expect(screen.getByTestId("count-up")).toHaveTextContent("2808");
  });

  it("renders plain text in compact mode (no CountUp wrapper)", () => {
    render(<CreditsCard initial={42} compact />);
    const span = screen.getByTestId("credits-card-compact");
    expect(span).toHaveTextContent("42");
    expect(screen.queryByTestId("count-up")).not.toBeInTheDocument();
  });

  it("updates when a `credits:update` CustomEvent is dispatched on window", () => {
    render(<CreditsCard initial={100} />);
    expect(screen.getByTestId("count-up")).toHaveTextContent("100");

    act(() => {
      window.dispatchEvent(
        new CustomEvent(CREDITS_UPDATE_EVENT, { detail: 77 }),
      );
    });

    expect(screen.getByTestId("count-up")).toHaveTextContent("77");
  });

  it("updates the compact render path on `credits:update`", () => {
    render(<CreditsCard initial={5} compact />);
    expect(screen.getByTestId("credits-card-compact")).toHaveTextContent("5");

    act(() => {
      window.dispatchEvent(
        new CustomEvent(CREDITS_UPDATE_EVENT, { detail: 12 }),
      );
    });

    expect(screen.getByTestId("credits-card-compact")).toHaveTextContent("12");
  });

  it("ignores events whose `detail` is not a finite number", () => {
    render(<CreditsCard initial={200} />);

    act(() => {
      window.dispatchEvent(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new CustomEvent(CREDITS_UPDATE_EVENT, { detail: "not a number" as any }),
      );
    });

    expect(screen.getByTestId("count-up")).toHaveTextContent("200");

    act(() => {
      window.dispatchEvent(
        new CustomEvent(CREDITS_UPDATE_EVENT, { detail: Number.NaN }),
      );
    });

    expect(screen.getByTestId("count-up")).toHaveTextContent("200");
  });

  it("removes the window listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<CreditsCard initial={1} />);

    const addedHandler = addSpy.mock.calls.find(
      ([evt]) => evt === CREDITS_UPDATE_EVENT,
    )?.[1];
    expect(addedHandler).toBeDefined();

    unmount();

    const removedHandler = removeSpy.mock.calls.find(
      ([evt]) => evt === CREDITS_UPDATE_EVENT,
    )?.[1];
    expect(removedHandler).toBe(addedHandler);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("adopts a new `initial` prop value when the parent re-renders", () => {
    const { rerender } = render(<CreditsCard initial={10} />);
    expect(screen.getByTestId("count-up")).toHaveTextContent("10");

    rerender(<CreditsCard initial={99} />);
    expect(screen.getByTestId("count-up")).toHaveTextContent("99");
  });
});
