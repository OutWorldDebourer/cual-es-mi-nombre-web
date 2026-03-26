/**
 * Note Drag Overlay — "Cual es mi nombre" Web
 *
 * Visual overlay that follows the cursor/finger during a drag operation.
 * Renders the NoteCard with elevated styling (shadow, rotation, scale).
 *
 * @module components/notes/note-drag-overlay
 */

"use client";

import { NoteCard } from "@/components/notes/note-card";
import type { Note } from "@/types/database";

interface NoteDragOverlayProps {
  note: Note;
  layout: "grid" | "list" | "compact";
}

export function NoteDragOverlay({ note, layout }: NoteDragOverlayProps) {
  return (
    <div className="drag-overlay-enter opacity-[0.97] ring-2 ring-primary/40 rounded-lg cursor-grabbing pointer-events-none">
      <NoteCard
        note={note}
        layout={layout}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onTogglePin={() => {}}
        onArchive={() => {}}
      />
    </div>
  );
}
