/**
 * Note Sort Hook — "Cual es mi nombre" Web
 *
 * Sorts notes using the canonical 3-level order:
 *   1. is_pinned DESC (pinned first)
 *   2. position ASC (fractional-indexing key, lexicographic)
 *   3. updated_at DESC (fallback for notes without position)
 *
 * @module hooks/use-note-sort
 */

import { useMemo } from "react";
import type { Note } from "@/types/database";

function compareNotes(a: Note, b: Note): number {
  // 1. Pinned first
  if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;

  // 2. Position ASC (lexicographic — fractional-indexing keys)
  if (a.position && b.position) {
    if (a.position < b.position) return -1;
    if (a.position > b.position) return 1;
  } else if (a.position && !b.position) {
    return -1;
  } else if (!a.position && b.position) {
    return 1;
  }

  // 3. Fallback: updated_at DESC
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

export function useNoteSort(notes: Note[]): Note[] {
  return useMemo(() => [...notes].sort(compareNotes), [notes]);
}

export { compareNotes };
