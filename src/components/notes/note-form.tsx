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
import type { Note, NoteStatus, NotePriority } from "@/types/database";
import { NOTE_STATUSES, NOTE_STATUS_CONFIG } from "@/components/notes/note-status-config";
import { NOTE_PRIORITIES, NOTE_PRIORITY_CONFIG } from "@/components/notes/note-priority-config";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onSubmit: (data: { title: string; content: string; status?: NoteStatus; priority?: NotePriority }) => Promise<void>;
}

export function NoteForm({
  open,
  onOpenChange,
  note,
  onSubmit,
}: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<NoteStatus>("active");
  const [priority, setPriority] = useState<NotePriority>("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!note;

  // Populate form when editing
  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "");
      setContent(note.content);
      setStatus(note.status);
      setPriority(note.priority ?? "normal");
    } else {
      setTitle("");
      setContent("");
      setStatus("active");
      setPriority("normal");
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
      await onSubmit({ title: title.trim(), content: content.trim(), status, priority });
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="note-status">Estado</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as NoteStatus)}>
                  <SelectTrigger id="note-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {NOTE_STATUS_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note-priority">Prioridad</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as NotePriority)}>
                  <SelectTrigger id="note-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        <span className="flex items-center gap-2">
                          {NOTE_PRIORITY_CONFIG[p].dotClass ? (
                            <span className={`inline-block h-2 w-2 rounded-full ${NOTE_PRIORITY_CONFIG[p].dotClass}`} />
                          ) : null}
                          {NOTE_PRIORITY_CONFIG[p].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
