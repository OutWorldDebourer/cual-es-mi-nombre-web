/**
 * ChatView Tests — "Cuál es mi nombre" Web
 *
 * Regression tests for the in-app chat view. Focus is the credits
 * propagation path after a successful `chat.send`: the backend returns
 * an updated `credits_remaining`, and `ChatView` must dispatch a
 * `credits:update` CustomEvent so every `<CreditsCard />` instance
 * (dashboard card + sidebar badge) re-renders with the new balance
 * without any Server Component refetch.
 *
 * See audit chat web 2026-04-17, Bug #1 (dashboard card stale after
 * sending a message until manual F5). Iter5 removed the
 * `refreshDashboard` Server Action and the client-side `router.refresh`
 * in favor of a window CustomEvent because the backend send response
 * already carries the fresh balance.
 *
 * @module __tests__/chat/chat-view.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── motion/react mock — avoid IntersectionObserver / animation frames ────

vi.mock("motion/react", () => ({
  motion: new Proxy(
    {},
    {
      get: () =>
        // Ignore Motion-specific props so the DOM doesn't receive unknown attrs.
        function MotionTag(props: Record<string, unknown>) {
          const {
            initial: _initial,
            animate: _animate,
            exit: _exit,
            transition: _transition,
            whileHover: _whileHover,
            whileTap: _whileTap,
            layout: _layout,
            ...rest
          } = props as Record<string, unknown>;
          void _initial;
          void _animate;
          void _exit;
          void _transition;
          void _whileHover;
          void _whileTap;
          void _layout;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (globalThis as any).React.createElement("div", rest);
        },
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useReducedMotion: () => true,
  useInView: () => true,
}));

// ── backendApi mock ───────────────────────────────────────────────────────

const mockSend = vi.fn();
const mockHistory = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    backendApi: () => ({
      chat: {
        send: mockSend,
        history: mockHistory,
      },
      whatsapp: {},
      google: {},
      payments: {},
      subscription: {},
    }),
  };
});

// Needs to be after mocks so the component picks them up.
import { ChatView } from "@/components/chat/chat-view";
import { CREDITS_UPDATE_EVENT } from "@/components/dashboard/credits-card";

// React namespace for the motion mock above.
import * as React from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).React = React;

// jsdom doesn't implement scrollIntoView — ChatMessageList uses it to
// auto-scroll to the latest message. Stub so effects don't throw.
if (!("scrollIntoView" in Element.prototype)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Element.prototype as any).scrollIntoView = vi.fn();
}

// ── Tests ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockHistory.mockResolvedValue({ messages: [], has_more: false });
});

describe("ChatView — credits propagation after send", () => {
  it("dispatches a `credits:update` CustomEvent carrying the fresh balance after a successful chat.send", async () => {
    mockSend.mockResolvedValue({
      response: "Hola, ¿en qué te ayudo?",
      intent: "smalltalk",
      agent_used: "router",
      credits_cost: 1,
      credits_remaining: 2808,
    });

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    const user = userEvent.setup();
    render(<ChatView assistantName="Asistente" />);

    // Wait for initial history to resolve.
    await waitFor(() => {
      expect(mockHistory).toHaveBeenCalled();
    });

    const textarea = await screen.findByLabelText("Mensaje");
    await user.type(textarea, "Hola");

    const submit = screen.getByRole("button", { name: /enviar mensaje/i });
    await user.click(submit);

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalledWith("Hola");
    });

    // Critical assertion: a `credits:update` CustomEvent must fire with
    // `detail === credits_remaining` so every subscribed CreditsCard
    // (dashboard card + sidebar badge) re-renders with the new balance.
    await waitFor(() => {
      const creditsEvents = dispatchSpy.mock.calls
        .map(([event]) => event)
        .filter(
          (event): event is CustomEvent<number> =>
            event instanceof CustomEvent &&
            event.type === CREDITS_UPDATE_EVENT,
        );

      expect(creditsEvents).toHaveLength(1);
      expect(creditsEvents[0].detail).toBe(2808);
    });

    dispatchSpy.mockRestore();
  });

  it("does NOT dispatch `credits:update` when chat.send fails", async () => {
    mockSend.mockRejectedValue(new Error("boom"));

    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    const user = userEvent.setup();
    render(<ChatView assistantName="Asistente" />);

    await waitFor(() => {
      expect(mockHistory).toHaveBeenCalled();
    });

    const textarea = await screen.findByLabelText("Mensaje");
    await user.type(textarea, "Hola");

    const submit = screen.getByRole("button", { name: /enviar mensaje/i });
    await user.click(submit);

    await waitFor(() => {
      expect(mockSend).toHaveBeenCalled();
    });

    // Explicitly flush pending microtasks so any stray dispatch would land.
    await new Promise((r) => setTimeout(r, 0));

    const stray = dispatchSpy.mock.calls
      .map(([event]) => event)
      .some(
        (event) =>
          event instanceof CustomEvent && event.type === CREDITS_UPDATE_EVENT,
      );

    expect(stray).toBe(false);

    dispatchSpy.mockRestore();
  });
});
