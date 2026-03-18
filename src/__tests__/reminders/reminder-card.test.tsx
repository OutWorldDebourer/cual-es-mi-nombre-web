/**
 * Reminder Card Tests — "Cuál es mi nombre" Web
 *
 * Tests for the ReminderCard component: status badge rendering,
 * overdue indication, action menu visibility, recurrence badge.
 *
 * @module __tests__/reminders/reminder-card.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Reminder } from "@/types/database";

function renderCard(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <TooltipProvider>{children}</TooltipProvider>
    ),
  });
}

function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
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
    is_recurring: false,
    recurrence_rule: null,
    recurrence_parent_id: null,
    occurrence_number: 0,
    created_at: "2026-03-01T12:00:00Z",
    ...overrides,
  };
}

const defaultProps = {
  onCancel: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onCancelSeries: vi.fn(),
};

describe("ReminderCard", () => {
  it("renders content and status badge", () => {
    renderCard(
      <ReminderCard
        reminder={makeReminder()}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("Call the doctor")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("shows sent badge for sent reminders", () => {
    renderCard(
      <ReminderCard
        reminder={makeReminder({ status: "sent", sent_at: "2026-03-01T15:00:00Z" })}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("Enviado")).toBeInTheDocument();
  });

  it("does not show actions menu for sent reminders", () => {
    renderCard(
      <ReminderCard
        reminder={makeReminder({ status: "sent" })}
        {...defaultProps}
      />,
    );
    expect(screen.queryByLabelText("Acciones de recordatorio")).not.toBeInTheDocument();
  });

  it("shows actions menu for pending reminders", () => {
    renderCard(
      <ReminderCard
        reminder={makeReminder()}
        {...defaultProps}
      />,
    );
    expect(screen.getByLabelText("Acciones de recordatorio")).toBeInTheDocument();
  });

  it("displays original_text when different from content", () => {
    renderCard(
      <ReminderCard
        reminder={makeReminder({
          content: "Call doctor",
          original_text: "Llama al doctor mañana",
        })}
        {...defaultProps}
      />,
    );

    expect(
      screen.getByText(/Llama al doctor mañana/),
    ).toBeInTheDocument();
  });

  it("shows failed reason for failed reminders", () => {
    renderCard(
      <ReminderCard
        reminder={makeReminder({
          status: "failed",
          failed_reason: "WhatsApp API timeout",
        })}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("Fallido")).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp API timeout/)).toBeInTheDocument();
  });

  it("shows recurring badge when is_recurring is true", () => {
    renderCard(
      <ReminderCard
        reminder={makeReminder({
          is_recurring: true,
          recurrence_rule: "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR",
          occurrence_number: 3,
        })}
        {...defaultProps}
      />,
    );

    expect(screen.getByText(/Cada semana/)).toBeInTheDocument();
    expect(screen.getByText(/#3/)).toBeInTheDocument();
  });

  it("shows series indicator for child occurrences", () => {
    renderCard(
      <ReminderCard
        reminder={makeReminder({
          recurrence_parent_id: "parent-1",
        })}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("Parte de una serie")).toBeInTheDocument();
  });
});
