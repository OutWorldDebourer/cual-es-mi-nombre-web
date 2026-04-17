/**
 * ChatView Tests — "Cuál es mi nombre" Web
 *
 * Regression tests for the in-app chat view. Focus is the cache
 * invalidation after a successful `chat.send`, which guarantees that
 * the dashboard's "Créditos restantes" card and the sidebar credits
 * badge re-fetch `profile.credits_remaining` from the DB.
 *
 * See audit chat web 2026-04-17, Bug #1 (dashboard card stale after
 * sending a message until manual F5). Iter3 replaced the client-side
 * `router.refresh()` with the `refreshDashboard` Server Action, so
 * this suite now asserts the Server Action is invoked instead of the
 * router.
 *
 * @module __tests__/chat/chat-view.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Server Action mock ────────────────────────────────────────────────────

// `vi.mock` is hoisted to the top of the file, so referenced identifiers
// must also be hoisted via `vi.hoisted`. See
// https://vitest.dev/api/vi.html#vi-mock
const { mockRefreshDashboard } = vi.hoisted(() => ({
  mockRefreshDashboard: vi.fn(),
}));

vi.mock("@/app/dashboard/actions", () => ({
  refreshDashboard: mockRefreshDashboard,
}));

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
  mockRefreshDashboard.mockResolvedValue(undefined);
});

describe("ChatView — cache invalidation after send", () => {
  it("calls refreshDashboard() Server Action after a successful chat.send to re-fetch Server Component data (credits card + sidebar)", async () => {
    mockSend.mockResolvedValue({
      response: "Hola, ¿en qué te ayudo?",
      intent: "smalltalk",
      agent_used: "router",
      credits_cost: 1,
      credits_remaining: 2808,
    });

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

    // The critical assertion: the Server Action must run so the Full
    // Route Cache and Client Router Cache of /dashboard are invalidated
    // and the credits card + sidebar badge re-render with the new
    // balance instead of the stale prop.
    await waitFor(() => {
      expect(mockRefreshDashboard).toHaveBeenCalledTimes(1);
    });
  });

  it("does NOT call refreshDashboard() when chat.send fails", async () => {
    mockSend.mockRejectedValue(new Error("boom"));

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

    // Explicitly flush pending microtasks so any stray refresh would land.
    await new Promise((r) => setTimeout(r, 0));

    expect(mockRefreshDashboard).not.toHaveBeenCalled();
  });
});
