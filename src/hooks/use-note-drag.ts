/**
 * Note Drag Hook — "Cual es mi nombre" Web
 *
 * Manages drag & drop state for note reordering:
 * - Sensors: Mouse (5px), Touch (250ms long-press), Keyboard
 * - Position calculation via fractional-indexing (generateKeyBetween)
 * - Cross-section detection: toggles is_pinned when crossing pinned/unpinned boundary
 * - Optimistic update + Supabase PATCH
 * - isDraggingRef for pausing Realtime during drag
 *
 * CRITICAL: isDraggingRef is released AFTER the DB write completes.
 * This prevents Realtime from fetching stale positions mid-update.
 *
 * @module hooks/use-note-drag
 */

"use client";

import { useRef, useState, useCallback } from "react";
import {
  type DragStartEvent,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { generateKeyBetween } from "@/lib/fractional-index";
import { compareNotes } from "@/hooks/use-note-sort";
import type { Note } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ── Pure computation — extracted for testability and Phase 5/6 reuse ────

export interface DragMoveResult {
  newPosition: string;
  newIsPinned: boolean;
  crossedPinBoundary: boolean;
}

/**
 * Compute the new position and pin status after a drag operation.
 *
 * Position formula: remove the active item from the notes array, then
 * generate a fractional key between filtered[newIndex-1] and filtered[newIndex].
 * - When oldIndex < newIndex (moving down): left = over item, right = next after over
 * - When oldIndex > newIndex (moving up): left = before over, right = over item
 *
 * Cross-section: if the dragged note and the over note have different is_pinned
 * values, the dragged note adopts the over note's pin status.
 *
 * Returns null if the drag should be ignored (same item, missing IDs).
 * Throws if generateKeyBetween fails (corrupt position data).
 */
export function computeDragMove(
  notes: Note[],
  activeId: string,
  overId: string,
): DragMoveResult | null {
  if (activeId === overId) return null;

  const oldIndex = notes.findIndex((n) => n.id === activeId);
  const newIndex = notes.findIndex((n) => n.id === overId);
  if (oldIndex === -1 || newIndex === -1) return null;

  const draggedNote = notes[oldIndex];
  const overNote = notes[newIndex];

  const crossedPinBoundary = draggedNote.is_pinned !== overNote.is_pinned;
  const newIsPinned = crossedPinBoundary ? overNote.is_pinned : draggedNote.is_pinned;

  const filtered = notes.filter((n) => n.id !== activeId);
  const leftPos = filtered[newIndex - 1]?.position || null;
  const rightPos = filtered[newIndex]?.position || null;
  const newPosition = generateKeyBetween(leftPos, rightPos);

  return { newPosition, newIsPinned, crossedPinBoundary };
}

// ── Hook ───────────────────────────────────────────────────────────────

interface UseNoteDragOptions {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export function useNoteDrag({ notes, setNotes }: UseNoteDragOptions) {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const isDraggingRef = useRef(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const note = notes.find((n) => n.id === event.active.id);
      if (note) {
        setActiveNote(note);
        isDraggingRef.current = true;
      }
    },
    [notes],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveNote(null);

      if (!over || active.id === over.id) {
        isDraggingRef.current = false;
        return;
      }

      let result: DragMoveResult | null;
      try {
        result = computeDragMove(notes, active.id as string, over.id as string);
      } catch {
        isDraggingRef.current = false;
        toast.error("Error al calcular posicion");
        return;
      }

      if (!result) {
        isDraggingRef.current = false;
        return;
      }

      const { newPosition, newIsPinned, crossedPinBoundary } = result;

      // Snapshot for revert on failure
      const snapshot = notes;

      // Optimistic update + re-sort
      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === active.id
            ? { ...n, position: newPosition, is_pinned: newIsPinned }
            : n,
        );
        return updated.sort(compareNotes);
      });

      // Persist to Supabase — try/finally guarantees isDraggingRef is released
      // even if the network call throws (browser offline, etc.)
      try {
        const supabase = createClient();
        const updatePayload: { position: string; is_pinned?: boolean } = { position: newPosition };
        if (crossedPinBoundary) updatePayload.is_pinned = newIsPinned;

        const { error } = await supabase
          .from("notes")
          .update(updatePayload)
          .eq("id", active.id as string);

        if (error) {
          setNotes(snapshot);
          toast.error("Error al guardar orden");
        }
      } catch {
        setNotes(snapshot);
        toast.error("Error al guardar orden");
      } finally {
        // Release Realtime AFTER the DB write completes
        isDraggingRef.current = false;
      }
    },
    [notes, setNotes],
  );

  const handleDragCancel = useCallback(() => {
    setActiveNote(null);
    isDraggingRef.current = false;
  }, []);

  return {
    activeNote,
    isDraggingRef,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
