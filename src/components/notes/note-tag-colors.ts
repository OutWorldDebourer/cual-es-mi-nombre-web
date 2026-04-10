/**
 * Shared tag color utility for note components.
 *
 * Deterministic color assignment based on tag name hash.
 *
 * @module components/notes/note-tag-colors
 */

export const TAG_COLORS = [
  "bg-accent/15 text-accent hover:bg-accent/25",
  "bg-chart-4/15 text-chart-4 hover:bg-chart-4/25",
  "bg-success/15 text-success hover:bg-success/25",
  "bg-info/15 text-info hover:bg-info/25",
  "bg-chart-3/15 text-chart-3 hover:bg-chart-3/25",
  "bg-destructive/15 text-destructive hover:bg-destructive/25",
] as const;

export function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash + tag.charCodeAt(i)) | 0;
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}
