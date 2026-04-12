"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { FinanceCategory } from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryPillsProps {
  categories: FinanceCategory[];
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
  maxVisible?: number;
  className?: string;
}

interface PillProps {
  category: FinanceCategory;
  isSelected: boolean;
  onSelect: () => void;
}

function CategoryPill({ category, isSelected, onSelect }: PillProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
        "border transition-all whitespace-nowrap",
        isSelected
          ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground dark:bg-input/30"
      )}
      aria-pressed={isSelected}
    >
      {category.color && (
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />
      )}
      {category.icon && <span className="shrink-0">{category.icon}</span>}
      <span className="truncate max-w-[6rem]">{category.name}</span>
    </button>
  );
}

/** Horizontally scrollable pill list with overflow dropdown for extra categories. */
export function CategoryPills({
  categories,
  selected,
  onSelect,
  maxVisible = 6,
  className,
}: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const visible = useMemo(
    () => categories.slice(0, maxVisible),
    [categories, maxVisible]
  );
  const overflow = useMemo(
    () => categories.slice(maxVisible),
    [categories, maxVisible]
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth);
    check();
    const obs = new ResizeObserver(check);
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  const handleSelect = (id: string) => {
    onSelect(selected === id ? null : id);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Scrollable area */}
      <div
        ref={scrollRef}
        className={cn(
          "flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
        )}
      >
        {visible.map((cat) => (
          <CategoryPill
            key={cat.id}
            category={cat}
            isSelected={selected === cat.id}
            onSelect={() => handleSelect(cat.id)}
          />
        ))}
      </div>

      {/* Overflow dropdown */}
      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="xs"
              className="shrink-0 gap-1 text-xs text-muted-foreground"
            >
              +{overflow.length} mas
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
            {overflow.map((cat) => (
              <DropdownMenuItem
                key={cat.id}
                className={cn(
                  "gap-2",
                  selected === cat.id && "bg-primary/10 text-primary"
                )}
                onSelect={() => handleSelect(cat.id)}
              >
                {cat.color && (
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
