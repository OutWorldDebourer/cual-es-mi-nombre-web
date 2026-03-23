/**
 * Note Priority Filter — "Cual es mi nombre" Web
 *
 * Renders filter pills for each priority level.
 * Follows the same pattern as the status filter pills in note-list.tsx.
 *
 * @module components/notes/note-priority-filter
 */

"use client";

import type { NotePriority } from "@/types/database";
import { NOTE_PRIORITIES, NOTE_PRIORITY_CONFIG } from "@/components/notes/note-priority-config";
import { Badge } from "@/components/ui/badge";

type PriorityFilter = "all" | NotePriority;

interface NotePriorityFilterProps {
  value: PriorityFilter;
  onChange: (value: PriorityFilter) => void;
}

export function NotePriorityFilter({ value, onChange }: NotePriorityFilterProps) {
  return (
    <div
      className="flex items-center gap-1.5 flex-wrap"
      role="radiogroup"
      aria-label="Filtrar por prioridad"
    >
      <Badge
        variant={value === "all" ? "default" : "outline"}
        className="text-xs cursor-pointer"
        role="radio"
        aria-checked={value === "all"}
        onClick={() => onChange("all")}
      >
        Todas
      </Badge>
      {NOTE_PRIORITIES.map((p) => {
        const config = NOTE_PRIORITY_CONFIG[p];
        return (
          <Badge
            key={p}
            variant={value === p ? "default" : "outline"}
            className={`text-xs cursor-pointer ${value === p ? "" : config.badgeClass}`}
            role="radio"
            aria-checked={value === p}
            onClick={() => onChange(p)}
          >
            {config.dotClass ? (
              <span className={`inline-block h-2 w-2 rounded-full mr-1 ${config.dotClass}`} />
            ) : null}
            {config.label}
          </Badge>
        );
      })}
    </div>
  );
}
