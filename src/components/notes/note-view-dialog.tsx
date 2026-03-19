/**
 * Note View Dialog — "Cuál es mi nombre" Web
 *
 * Read-only dialog to display the full content of a note.
 * Opened by clicking a note card; provides an "Edit" action
 * that transitions to the edit form.
 *
 * @module components/notes/note-view-dialog
 */

"use client";

import type { Note } from "@/types/database";
import { formatRelativeTime } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tagColor } from "@/components/notes/note-tag-colors";

interface NoteViewDialogProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (note: Note) => void;
}

export function NoteViewDialog({
  note,
  open,
  onOpenChange,
  onEdit,
}: NoteViewDialogProps) {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {note.is_pinned && (
              <span aria-label="Fijada">📌</span>
            )}
            {note.title || "Sin título"}
          </DialogTitle>
          <DialogDescription>
            {formatRelativeTime(note.updated_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
          <p className="text-sm whitespace-pre-wrap break-words">
            {note.content}
          </p>
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {note.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={`text-xs ${tagColor(tag)}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(note);
            }}
          >
            ✏️ Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
