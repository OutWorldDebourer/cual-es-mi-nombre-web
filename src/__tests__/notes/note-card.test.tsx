/**
 * Note Card Tests — "Cuál es mi nombre" Web
 *
 * Tests for the NoteCard component: rendering, actions, pin status,
 * tags display, delete confirmation dialog.
 *
 * @module __tests__/notes/note-card.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteCard } from "@/components/notes/note-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Note } from "@/types/database";

function renderCard(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <TooltipProvider>{children}</TooltipProvider>
    ),
  });
}

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    profile_id: "user-1",
    title: "Test Note",
    content: "This is a test note content",
    tags: [],
    status: "active",
    priority: "normal",
    position: "a0",
    is_pinned: false,
    is_archived: false,
    created_at: "2026-03-01T12:00:00Z",
    updated_at: "2026-03-01T12:00:00Z",
    ...overrides,
  };
}

const defaultProps = {
  onView: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onTogglePin: vi.fn(),
  onArchive: vi.fn(),
};

describe("NoteCard", () => {
  it("renders title and content", () => {
    renderCard(<NoteCard note={makeNote()} {...defaultProps} />);

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("This is a test note content")).toBeInTheDocument();
  });

  it("renders 'Sin título' when title is null", () => {
    renderCard(<NoteCard note={makeNote({ title: null })} {...defaultProps} />);

    expect(screen.getByText("Sin título")).toBeInTheDocument();
  });

  it("renders pinned indicator for pinned notes", () => {
    renderCard(<NoteCard note={makeNote({ is_pinned: true })} {...defaultProps} />);

    // Pinned notes get a primary border styling
    const card = screen.getByText("Test Note").closest("[data-slot='card']");
    expect(card).toHaveClass("border-accent/40");
  });

  it("renders tags as badges", () => {
    renderCard(
      <NoteCard
        note={makeNote({ tags: ["work", "important"] })}
        {...defaultProps}
      />,
    );

    expect(screen.getByText("work")).toBeInTheDocument();
    expect(screen.getByText("important")).toBeInTheDocument();
  });

  it("truncates long content to 200 chars in grid mode", () => {
    const longContent = "a".repeat(250);
    renderCard(<NoteCard note={makeNote({ content: longContent })} {...defaultProps} />);

    const displayed = screen.getByText(/^a+…$/);
    expect(displayed.textContent).toHaveLength(201); // 200 chars + "…"
  });

  it("truncates long content to 120 chars in list mode", () => {
    const longContent = "b".repeat(200);
    renderCard(
      <NoteCard note={makeNote({ content: longContent })} layout="list" {...defaultProps} />,
    );

    const displayed = screen.getByText(/^b+…$/);
    expect(displayed.textContent).toHaveLength(121); // 120 chars + "…"
  });

  it("renders horizontal layout in list mode", () => {
    renderCard(
      <NoteCard note={makeNote()} layout="list" {...defaultProps} />,
    );

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText("This is a test note content")).toBeInTheDocument();
  });

  it("shows max 3 tags with overflow count in list mode", () => {
    renderCard(
      <NoteCard
        note={makeNote({ tags: ["a", "b", "c", "d", "e"] })}
        layout="list"
        {...defaultProps}
      />,
    );

    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.queryByText("d")).not.toBeInTheDocument();
  });

  it("shows delete confirmation dialog and calls onDelete", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderCard(
      <NoteCard note={makeNote()} {...defaultProps} onDelete={onDelete} />,
    );

    // Open dropdown menu
    await user.click(screen.getByLabelText("Acciones de nota"));
    // Click delete
    await user.click(screen.getByText("Eliminar"));
    // Confirmation dialog should appear
    expect(screen.getByText("¿Eliminar esta nota?")).toBeInTheDocument();
    // Confirm deletion
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(onDelete).toHaveBeenCalledWith("note-1");
  });

  it("calls onEdit when edit action is clicked", async () => {
    const user = userEvent.setup();
    const note = makeNote();
    const onEdit = vi.fn();
    renderCard(<NoteCard note={note} {...defaultProps} onEdit={onEdit} />);

    await user.click(screen.getByLabelText("Acciones de nota"));
    await user.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(note);
  });

  it("calls onTogglePin when pin action is clicked", async () => {
    const user = userEvent.setup();
    const onTogglePin = vi.fn();
    renderCard(
      <NoteCard note={makeNote()} {...defaultProps} onTogglePin={onTogglePin} />,
    );

    await user.click(screen.getByLabelText("Acciones de nota"));
    await user.click(screen.getByText("Fijar"));
    expect(onTogglePin).toHaveBeenCalledWith("note-1", true);
  });
});
