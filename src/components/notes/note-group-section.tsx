/**
 * Note Group Section — "Cual es mi nombre" Web
 *
 * Collapsible section header for tag-based grouping of notes.
 * Shows tag badge with color, note count, and chevron toggle.
 *
 * @module components/notes/note-group-section
 */

"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { tagColor } from "@/components/notes/note-tag-colors";

interface NoteGroupSectionProps {
  tag: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function NoteGroupSection({
  tag,
  count,
  children,
  defaultOpen = true,
}: NoteGroupSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isUntagged = tag === "Sin etiqueta";

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left group"
        aria-expanded={isOpen}
      >
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
        <Badge
          variant="secondary"
          className={`text-xs ${isUntagged ? "" : tagColor(tag)}`}
        >
          {tag}
        </Badge>
        <span className="text-xs text-muted-foreground">
          ({count})
        </span>
        <div className="flex-1 border-t border-border/50" />
      </button>
      {isOpen && children}
    </div>
  );
}
