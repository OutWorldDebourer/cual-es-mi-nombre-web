/**
 * Note Priority Configuration — "Cual es mi nombre" Web
 *
 * Maps each NotePriority to its visual properties: label, badge classes,
 * dot color, and sort weight. Follows the same pattern as note-status-config.ts.
 *
 * @module components/notes/note-priority-config
 */

import type { NotePriority } from "@/types/database";

export interface NotePriorityConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
  icon: string;
}

export const NOTE_PRIORITY_CONFIG: Record<NotePriority, NotePriorityConfig> = {
  urgent: {
    label: "Urgente",
    badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
    dotClass: "bg-destructive",
    icon: "⚡",
  },
  high: {
    label: "Alta",
    badgeClass: "bg-warning/15 text-warning border-warning/30",
    dotClass: "bg-warning",
    icon: "🔶",
  },
  normal: {
    label: "Normal",
    badgeClass: "",
    dotClass: "",
    icon: "",
  },
  low: {
    label: "Baja",
    badgeClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground/50",
    icon: "🔽",
  },
};

/** All priority values in display order (for filter pills). */
export const NOTE_PRIORITIES: NotePriority[] = ["urgent", "high", "normal", "low"];
