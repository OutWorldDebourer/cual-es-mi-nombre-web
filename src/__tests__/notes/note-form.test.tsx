/**
 * Note Form Tests — "Cuál es mi nombre" Web
 *
 * Tests for the NoteForm dialog: create mode, edit mode,
 * validation, submit/cancel behavior.
 *
 * @module __tests__/notes/note-form.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteForm } from "@/components/notes/note-form";
import type { Note } from "@/types/database";

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    profile_id: "user-1",
    title: "Existing Note",
    content: "Existing content",
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

describe("NoteForm", () => {
  it("renders create mode with empty fields", () => {
    render(
      <NoteForm
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Nueva nota")).toBeInTheDocument();
    expect(screen.getByLabelText("Título (opcional)")).toHaveValue("");
    expect(screen.getByLabelText("Contenido")).toHaveValue("");
  });

  it("renders edit mode with pre-filled fields", () => {
    render(
      <NoteForm
        open={true}
        onOpenChange={vi.fn()}
        note={makeNote()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Editar nota")).toBeInTheDocument();
    expect(screen.getByLabelText("Título (opcional)")).toHaveValue(
      "Existing Note",
    );
    expect(screen.getByLabelText("Contenido")).toHaveValue("Existing content");
  });

  it("shows error when submitting with empty content", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <NoteForm
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByText("Crear nota"));
    expect(
      screen.getByText("El contenido de la nota es obligatorio."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with correct data on create", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <NoteForm
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Título (opcional)"), "Mi titulo");
    await user.type(screen.getByLabelText("Contenido"), "Mi contenido");
    await user.click(screen.getByText("Crear nota"));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Mi titulo",
      content: "Mi contenido",
      status: "active",
      priority: "normal",
    });
  });
});
