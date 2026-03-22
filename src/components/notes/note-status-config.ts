/**
 * Note Status Configuration — "Cual es mi nombre" Web
 *
 * Maps each NoteStatus to its visual properties: label, badge classes,
 * and card border accent. Follows the same pattern as note-tag-colors.ts.
 *
 * @module components/notes/note-status-config
 */

import type { NoteStatus } from "@/types/database";

export interface NoteStatusConfig {
  label: string;
  badgeClass: string;
  cardBorderClass: string;
}

export const NOTE_STATUS_CONFIG: Record<NoteStatus, NoteStatusConfig> = {
  active: {
    label: "Activa",
    badgeClass: "",
    cardBorderClass: "",
  },
  en_curso: {
    label: "En curso",
    badgeClass: "bg-warning/15 text-warning border-warning/30",
    cardBorderClass: "border-l-4 border-l-warning",
  },
  completed: {
    label: "Completada",
    badgeClass: "bg-success/15 text-success border-success/30",
    cardBorderClass: "border-l-4 border-l-success",
  },
};

/** All status values in display order (for filter pills). */
export const NOTE_STATUSES: NoteStatus[] = ["active", "en_curso", "completed"];
