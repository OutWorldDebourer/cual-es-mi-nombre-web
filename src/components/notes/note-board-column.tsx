/**
 * Note Board Column — "Cual es mi nombre" Web
 *
 * A single Kanban column representing one note status (active/en_curso/completed).
 * Contains a header with status info, SortableContext for drag reordering,
 * and a droppable zone for receiving cards from other columns.
 *
 * Mobile (<md): header is clickable to collapse/expand the section.
 * Desktop (md+): always expanded, chevron hidden.
 *
 * @module components/notes/note-board-column
 */

"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Note, NoteStatus, NotePriority } from "@/types/database";
import { NOTE_STATUS_CONFIG } from "@/components/notes/note-status-config";
import { NoteSortableCard } from "@/components/notes/note-sortable-card";
import { ChevronRight, StickyNote } from "lucide-react";

interface NoteBoardColumnProps {
  status: NoteStatus;
  notes: Note[];
  dragDisabled?: boolean;
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

const STATUS_DOT: Record<NoteStatus, string> = {
  active: "bg-primary",
  en_curso: "bg-warning",
  completed: "bg-success",
};

export function NoteBoardColumn({
  status,
  notes,
  dragDisabled = false,
  recentlyMovedIds,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onArchive,
  onStatusChange,
  onPriorityChange,
  onTagClick,
}: NoteBoardColumnProps) {
  const [mobileOpen, setMobileOpen] = useState(true);
  const config = NOTE_STATUS_CONFIG[status];

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: "column", status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg bg-muted/30 border ${
        isOver ? "border-primary/50 bg-primary/5" : "border-border/50"
      } transition-colors`}
      role="region"
      aria-label={`Columna: ${config.label} (${notes.length} notas)`}
    >
      {/* Column header — clickable on mobile for collapse/expand */}
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50 w-full text-left md:cursor-default"
        aria-expanded={mobileOpen}
      >
        {/* Chevron — mobile only */}
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 md:hidden ${
            mobileOpen ? "rotate-90" : ""
          }`}
        />
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status]}`} />
        <span className="text-sm font-medium">{config.label}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {notes.length}
        </span>
      </button>

      {/* Cards — always visible on desktop, collapsible on mobile */}
      <SortableContext
        items={notes.map((n) => n.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={`flex flex-col gap-2 p-2 min-h-[120px] transition-all duration-200 ${
          mobileOpen ? "" : "hidden md:flex"
        }`}>
          {notes.map((note) => (
            <NoteSortableCard
              key={note.id}
              note={note}
              layout="compact"
              disabled={dragDisabled}
              recentlyMovedIds={recentlyMovedIds}
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

          {/* Empty drop zone */}
          {notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
              <StickyNote className="h-6 w-6 mb-1" />
              <span className="text-xs">Sin notas</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
