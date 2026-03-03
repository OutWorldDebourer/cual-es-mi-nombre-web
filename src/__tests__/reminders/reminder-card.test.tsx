/**
 * Reminder Card Tests — "Cuál es mi nombre" Web
 *
 * Tests for the ReminderCard component: status badge rendering,
 * overdue indication, cancel button visibility.
 *
 * @module __tests__/reminders/reminder-card.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReminderCard } from "@/components/reminders/reminder-card";
import type { Reminder } from "@/types/database";

function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  // Default: a future pending reminder
  const future = new Date(Date.now() + 86400000).toISOString(); // +1 day
  return {
    id: "rem-1",
    profile_id: "user-1",
    content: "Call the doctor",
    trigger_at: future,
    original_text: "Recuérdame llamar al doctor mañana",
    status: "pending",
    retry_count: 0,
    max_retries: 3,
    channel: "whatsapp",
    sent_at: null,
    failed_reason: null,
    created_at: "2026-03-01T12:00:00Z",
    ...overrides,
  };
}

describe("ReminderCard", () => {
  it("renders content and status badge", () => {
    render(
      <ReminderCard
        reminder={makeReminder()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Call the doctor")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("shows sent badge for sent reminders", () => {
    render(
      <ReminderCard
        reminder={makeReminder({ status: "sent", sent_at: "2026-03-01T15:00:00Z" })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Enviado")).toBeInTheDocument();
  });

  it("shows cancel button only for pending reminders", () => {
    const { rerender } = render(
      <ReminderCard reminder={makeReminder()} onCancel={vi.fn()} />,
    );
    expect(screen.getByText("Cancelar")).toBeInTheDocument();

    rerender(
      <ReminderCard
        reminder={makeReminder({ status: "sent" })}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText("Cancelar")).not.toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ReminderCard reminder={makeReminder()} onCancel={onCancel} />);

    await user.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledWith("rem-1");
  });

  it("displays original_text when different from content", () => {
    render(
      <ReminderCard
        reminder={makeReminder({
          content: "Call doctor",
          original_text: "Llama al doctor mañana",
        })}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Llama al doctor mañana/),
    ).toBeInTheDocument();
  });

  it("shows failed reason for failed reminders", () => {
    render(
      <ReminderCard
        reminder={makeReminder({
          status: "failed",
          failed_reason: "WhatsApp API timeout",
        })}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Fallido")).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp API timeout/)).toBeInTheDocument();
  });
});
