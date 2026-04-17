/**
 * Chat Message Tests — "Cuál es mi nombre" Web
 *
 * Ensures message bubbles render a consistent relative Spanish timestamp
 * (delegated to `formatRelativeTime`) instead of mixing short-date and
 * "Ahora" formats. Also locks the <time dateTime> accessibility contract.
 *
 * @module __tests__/chat/chat-message.test
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "@/components/chat/chat-message";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

function makeMessage(overrides: Partial<ChatMessageType> = {}): ChatMessageType {
  return {
    id: "msg-1",
    role: "user",
    content: "Hola",
    agent: null,
    created_at: "2026-03-01T12:00:00Z",
    metadata: null,
    ...overrides,
  };
}

describe("ChatMessage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a relative 'hace un momento' timestamp for fresh messages", () => {
    const now = new Date("2026-03-01T12:00:10Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);

    render(<ChatMessage message={makeMessage()} />);

    expect(screen.getByText("hace un momento")).toBeInTheDocument();
  });

  it("renders 'hace X min' for minute-old messages, not a short date", () => {
    const now = new Date("2026-03-01T12:05:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);

    render(<ChatMessage message={makeMessage()} />);

    expect(screen.getByText("hace 5 min")).toBeInTheDocument();
    // Must not fall back to the old short-date format
    expect(screen.queryByText(/mar/i)).not.toBeInTheDocument();
  });

  it("renders 'hace Xh' for hour-old messages", () => {
    const now = new Date("2026-03-01T15:00:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);

    render(<ChatMessage message={makeMessage()} />);

    expect(screen.getByText("hace 3h")).toBeInTheDocument();
  });

  it("exposes the raw ISO via <time dateTime> for screen readers", () => {
    const message = makeMessage({ created_at: "2026-03-01T12:00:00Z" });
    const { container } = render(<ChatMessage message={message} />);

    const timeEl = container.querySelector("time");
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute("datetime")).toBe("2026-03-01T12:00:00Z");
  });

  it("falls back gracefully when the timestamp is invalid", () => {
    const message = makeMessage({ created_at: "not-a-date" });
    const { container } = render(<ChatMessage message={message} />);

    const timeEl = container.querySelector("time");
    expect(timeEl?.textContent).toBe("");
  });
});
