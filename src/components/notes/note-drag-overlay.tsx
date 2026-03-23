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
  layout: "grid" | "list";
}

export function NoteDragOverlay({ note, layout }: NoteDragOverlayProps) {
  return (
    <div className="shadow-lg rotate-2 scale-[1.03] opacity-[0.92] border-2 border-primary rounded-lg cursor-grabbing pointer-events-none">
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
