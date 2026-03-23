/**
 * Note Board View — "Cual es mi nombre" Web
 *
 * Kanban-style board layout with 3 columns by note status:
 * active | en_curso | completed
 *
 * Desktop (md+): 3 side-by-side columns
 * Mobile (<md): collapsible vertical sections (see Step 5.6)
 *
 * @module components/notes/note-board-view
 */

"use client";

import { useMemo } from "react";
import type { Note, NoteStatus, NotePriority } from "@/types/database";
import { NOTE_STATUSES } from "@/components/notes/note-status-config";
import { NoteBoardColumn } from "@/components/notes/note-board-column";

interface NoteBoardViewProps {
  notes: Note[];
  dragDisabled?: boolean;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string, isPinned: boolean) => void;
  onArchive: (noteId: string) => void;
  onStatusChange?: (noteId: string, status: NoteStatus) => void;
  onPriorityChange?: (noteId: string, priority: NotePriority) => void;
  onTagClick?: (tag: string) => void;
}

export function NoteBoardView({
  notes,
  dragDisabled = false,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onArchive,
  onStatusChange,
  onPriorityChange,
  onTagClick,
}: NoteBoardViewProps) {
  const columnNotes = useMemo(() => {
    const map: Record<NoteStatus, Note[]> = {
      active: [],
      en_curso: [],
      completed: [],
    };
    for (const note of notes) {
      map[note.status].push(note);
    }
    return map;
  }, [notes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {NOTE_STATUSES.map((status) => (
        <NoteBoardColumn
          key={status}
          status={status}
          notes={columnNotes[status]}
          dragDisabled={dragDisabled}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onArchive={onArchive}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
}
