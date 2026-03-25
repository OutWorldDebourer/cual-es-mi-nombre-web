/**
 * Sortable Note Card Wrapper — "Cual es mi nombre" Web
 *
 * Wraps NoteCard with dnd-kit's useSortable to enable drag & drop.
 * Passes drag handle listeners to NoteCard for the GripVertical handle.
 * Applies sortable transform + transition styles for smooth reordering.
 *
 * @module components/notes/note-sortable-card
 */

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NoteCard } from "@/components/notes/note-card";
import type { Note, NoteStatus, NotePriority } from "@/types/database";

interface NoteSortableCardProps {
  note: Note;
  /** Override dnd-kit sortable ID (default: note.id). Use for composite IDs like "tag::noteId". */
  sortableId?: string;
  index?: number;
  layout: "grid" | "list" | "compact";
  disabled?: boolean;
  recentlyMovedIds?: Set<string>;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string, isPinned: boolean) => void;
  onArchive: (noteId: string) => void;
  onStatusChange?: (noteId: string, status: NoteStatus) => void;
  onPriorityChange?: (noteId: string, priority: NotePriority) => void;
  onTagClick?: (tag: string) => void;
}

export function NoteSortableCard({
  note,
  sortableId,
  index,
  layout,
  disabled = false,
  recentlyMovedIds,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onArchive,
  onStatusChange,
  onPriorityChange,
  onTagClick,
}: NoteSortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId ?? note.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      aria-roledescription="elemento ordenable"
      className={recentlyMovedIds?.has(note.id) ? "animate-[highlight_0.7s_ease-out] rounded-xl" : undefined}
    >
      <NoteCard
        note={note}
        index={index}
        layout={layout}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
        onArchive={onArchive}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
        onTagClick={onTagClick}
        dragHandleListeners={disabled ? undefined : listeners}
      />
    </div>
  );
}
