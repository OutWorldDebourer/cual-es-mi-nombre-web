/**
 * Note Form Component — "Cuál es mi nombre" Web
 *
 * Dialog-based form for creating and editing notes.
 * Uses controlled inputs with a clean UX. Supports both
 * create (empty) and edit (pre-filled) modes.
 *
 * @module components/notes/note-form
 */

"use client";

import { useState, useEffect } from "react";
import type { Note } from "@/types/database";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, the form operates in edit mode */
  note?: Note | null;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
}

export function NoteForm({
  open,
  onOpenChange,
  note,
  onSubmit,
}: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!note;

  // Populate form when editing
  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "");
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
    setError(null);
  }, [note, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      setError("El contenido de la nota es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ title: title.trim(), content: content.trim() });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al guardar la nota.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar nota" : "Nueva nota"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los campos y guarda los cambios."
                : "Escribe tu nota. El título es opcional."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note-title">Título (opcional)</Label>
              <Input
                id="note-title"
                placeholder="Título de la nota..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-content">Contenido</Label>
              <Textarea
                id="note-content"
                placeholder="Escribe tu nota aquí..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-y min-h-[120px]"
              />
            </div>
            <FormError message={error} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear nota"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
