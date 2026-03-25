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
import type { Note, NoteStatus } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const COLUMN_PREFIX = "column-";
const COMPOSITE_SEP = "::";

/** Parse a composite ID "tag::noteId" into parts. Returns null for plain IDs. */
export function parseCompositeId(id: string): { tag: string; noteId: string } | null {
  const idx = id.indexOf(COMPOSITE_SEP);
  if (idx === -1) return null;
  return { tag: id.slice(0, idx), noteId: id.slice(idx + COMPOSITE_SEP.length) };
}

/** Extract the real note ID from a potentially composite ID. */
function toNoteId(id: string): string {
  return parseCompositeId(id)?.noteId ?? id;
}

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
  const leftPos = filtered[newIndex - 1]?.position ?? null;
  const rightPos = filtered[newIndex]?.position ?? null;
  const newPosition = generateKeyBetween(leftPos, rightPos);

  return { newPosition, newIsPinned, crossedPinBoundary };
}

// ── Board (multi-container) computation ──────────────────────────────────

export interface BoardDragMoveResult {
  newPosition: string;
  newStatus: NoteStatus;
  statusChanged: boolean;
}

/**
 * Compute the new position and status after a board drag operation.
 *
 * Handles 3 scenarios:
 * 1. Drop on empty column (overId = "column-{status}") → append at end
 * 2. Drop on item in different column → insert near that item, change status
 * 3. Reorder within same column → position relative to neighbors
 *
 * Returns null if the drag should be ignored.
 */
export function computeBoardDragMove(
  notes: Note[],
  activeId: string,
  overId: string,
): BoardDragMoveResult | null {
  const activeNote = notes.find((n) => n.id === activeId);
  if (!activeNote) return null;

  // Case 1: Dropped on a column droppable (empty zone)
  if (typeof overId === "string" && overId.startsWith(COLUMN_PREFIX)) {
    const targetStatus = overId.slice(COLUMN_PREFIX.length) as NoteStatus;
    const columnNotes = notes
      .filter((n) => n.status === targetStatus && n.id !== activeId)
      .sort((a, b) => (a.position < b.position ? -1 : a.position > b.position ? 1 : 0));

    const lastPos = columnNotes.at(-1)?.position ?? null;
    const newPosition = generateKeyBetween(lastPos, null);
    return {
      newPosition,
      newStatus: targetStatus,
      statusChanged: activeNote.status !== targetStatus,
    };
  }

  // Over target is a note
  const overNote = notes.find((n) => n.id === overId);
  if (!overNote) return null;
  if (activeId === overId) return null;

  const targetStatus = overNote.status;
  const statusChanged = activeNote.status !== targetStatus;

  // Get column notes (excluding the active item), sorted by position
  const columnNotes = notes
    .filter((n) => n.status === targetStatus && n.id !== activeId)
    .sort((a, b) => (a.position < b.position ? -1 : a.position > b.position ? 1 : 0));

  const overIndex = columnNotes.findIndex((n) => n.id === overId);
  if (overIndex === -1) return null;

  const leftPos = columnNotes[overIndex - 1]?.position ?? null;
  const rightPos = columnNotes[overIndex]?.position ?? null;
  const newPosition = generateKeyBetween(leftPos, rightPos);

  return { newPosition, newStatus: targetStatus, statusChanged };
}

// ── Hook ───────────────────────────────────────────────────────────────

interface UseNoteDragOptions {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  boardMode?: boolean;
  groupMode?: boolean;
}

export function useNoteDrag({ notes, setNotes, boardMode = false, groupMode = false }: UseNoteDragOptions) {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const isDraggingRef = useRef(false);
  const dragCountRef = useRef(0);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const [recentlyMovedIds, setRecentlyMovedIds] = useState<Set<string>>(new Set());
  const highlightTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const markRecentlyMoved = useCallback((noteId: string) => {
    // Clear existing timer for this note if any
    const existing = highlightTimers.current.get(noteId);
    if (existing) clearTimeout(existing);

    setRecentlyMovedIds((prev) => new Set(prev).add(noteId));
    const timer = setTimeout(() => {
      setRecentlyMovedIds((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
      highlightTimers.current.delete(noteId);
    }, 700);
    highlightTimers.current.set(noteId, timer);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const noteId = toNoteId(event.active.id as string);
      const note = notesRef.current.find((n) => n.id === noteId);
      if (note) {
        setActiveNote(note);
        dragCountRef.current++;
        isDraggingRef.current = true;
      }
    },
    [],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveNote(null);

      const releaseDrag = () => {
        dragCountRef.current = Math.max(0, dragCountRef.current - 1);
        isDraggingRef.current = dragCountRef.current > 0;
      };

      if (!over || active.id === over.id) {
        releaseDrag();
        return;
      }

      const rawActiveId = active.id as string;
      const rawOverId = over.id as string;

      // ── Group mode: parse composite IDs, block cross-group ──
      const activeNoteId = toNoteId(rawActiveId);
      const overNoteId = toNoteId(rawOverId);

      if (groupMode) {
        const activeParsed = parseCompositeId(rawActiveId);
        const overParsed = parseCompositeId(rawOverId);
        if (activeParsed && overParsed && activeParsed.tag !== overParsed.tag) {
          releaseDrag();
          return;
        }
      }

      const overId = overNoteId;
      const activeId = activeNoteId;
      const currentNotes = notesRef.current;
      const isBoardDrop = boardMode && (
        rawOverId.startsWith(COLUMN_PREFIX) ||
        currentNotes.find((n) => n.id === overId)?.status !== currentNotes.find((n) => n.id === activeId)?.status
      );

      // ── Board (multi-container) drag ─────────────────────────
      if (isBoardDrop) {
        let boardResult: BoardDragMoveResult | null;
        try {
          boardResult = computeBoardDragMove(currentNotes, activeId, overId);
        } catch {
          releaseDrag();
          toast.error("Error al calcular posición");
          return;
        }

        if (!boardResult) {
          releaseDrag();
          return;
        }

        const { newPosition, newStatus, statusChanged } = boardResult;
        const snapshot = currentNotes;

        setNotes((prev) => {
          const updated = prev.map((n) =>
            n.id === activeId
              ? { ...n, position: newPosition, status: newStatus }
              : n,
          );
          return updated.sort(compareNotes);
        });
        markRecentlyMoved(activeId);

        try {
          const supabase = createClient();
          const updatePayload: { position: string; status?: NoteStatus } = { position: newPosition };
          if (statusChanged) updatePayload.status = newStatus;

          const { error } = await supabase
            .from("notes")
            .update(updatePayload)
            .eq("id", activeId);

          if (error) {
            setNotes(snapshot);
            toast.error("Error al guardar orden");
          }
        } catch {
          setNotes(snapshot);
          toast.error("Error al guardar orden");
        } finally {
          releaseDrag();
        }
        return;
      }

      // ── Flat (single-container) drag ─────────────────────────
      let result: DragMoveResult | null;
      try {
        result = computeDragMove(currentNotes, activeId, overId);
      } catch {
        releaseDrag();
        toast.error("Error al calcular posición");
        return;
      }

      if (!result) {
        releaseDrag();
        return;
      }

      const { newPosition, newIsPinned, crossedPinBoundary } = result;
      const snapshot = currentNotes;

      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === activeId
            ? { ...n, position: newPosition, is_pinned: newIsPinned }
            : n,
        );
        return updated.sort(compareNotes);
      });
      markRecentlyMoved(activeId);

      try {
        const supabase = createClient();
        const updatePayload: { position: string; is_pinned?: boolean } = { position: newPosition };
        if (crossedPinBoundary) updatePayload.is_pinned = newIsPinned;

        const { error } = await supabase
          .from("notes")
          .update(updatePayload)
          .eq("id", activeId);

        if (error) {
          setNotes(snapshot);
          toast.error("Error al guardar orden");
        }
      } catch {
        setNotes(snapshot);
        toast.error("Error al guardar orden");
      } finally {
        releaseDrag();
      }
    },
    [setNotes, boardMode, groupMode, markRecentlyMoved],
  );

  const handleDragCancel = useCallback(() => {
    setActiveNote(null);
    dragCountRef.current = Math.max(0, dragCountRef.current - 1);
    isDraggingRef.current = dragCountRef.current > 0;
  }, []);

  return {
    activeNote,
    isDraggingRef,
    recentlyMovedIds,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
