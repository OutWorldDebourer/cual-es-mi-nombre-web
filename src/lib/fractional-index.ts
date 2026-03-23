/**
 * Fractional Indexing Wrapper — "Cual es mi nombre" Web
 *
 * Typed re-export of `fractional-indexing` for note position management.
 * Keys are lexicographically sortable strings (e.g., "a0", "a1", "Zz").
 *
 * Usage:
 *   - New note at top: generateKeyBetween(null, firstNote.position)
 *   - New note at bottom: generateKeyBetween(lastNote.position, null)
 *   - Between two notes: generateKeyBetween(noteA.position, noteB.position)
 *
 * @module lib/fractional-index
 */

export {
  generateKeyBetween,
  generateNKeysBetween,
} from "fractional-indexing";
