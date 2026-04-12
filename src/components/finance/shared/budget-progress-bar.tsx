"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { BudgetMode } from "@/types/database";

interface BudgetProgressBarProps {
  spent: number;
  limit: number;
  mode: BudgetMode;
  categoryName?: string;
  categoryIcon?: string;
  className?: string;
}

function formatAmount(n: number): string {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getProgressColor(pct: number): string {
  if (pct >= 90) return "bg-red-500 dark:bg-red-400";
  if (pct >= 70) return "bg-yellow-500 dark:bg-yellow-400";
  return "bg-emerald-500 dark:bg-emerald-400";
}

function getProgressTextColor(pct: number): string {
  if (pct >= 90) return "text-red-600 dark:text-red-400";
  if (pct >= 70) return "text-yellow-600 dark:text-yellow-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function getModeLabel(mode: BudgetMode, spent: number, limit: number): string {
  switch (mode) {
    case "fixed":
      return `${formatAmount(spent)} / ${formatAmount(limit)}`;
    case "percentage":
      return `${Math.round((spent / Math.max(limit, 1)) * 100)}% del ingreso`;
    case "envelope":
      return `${formatAmount(limit - spent)} restante`;
    default:
      return `${formatAmount(spent)} / ${formatAmount(limit)}`;
  }
}

/** Progress bar with auto-color (green/yellow/red) and mode-aware labels. */
export function BudgetProgressBar({
  spent,
  limit,
  mode,
  categoryName,
  categoryIcon,
  className,
}: BudgetProgressBarProps) {
  const pct = useMemo(
    () => Math.min(Math.round((spent / Math.max(limit, 1)) * 100), 100),
    [spent, limit]
  );

  const barColor = getProgressColor(pct);
  const textColor = getProgressTextColor(pct);
  const label = getModeLabel(mode, spent, limit);

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 min-w-0">
          {categoryIcon && <span className="shrink-0">{categoryIcon}</span>}
          {categoryName && (
            <span className="truncate font-medium text-foreground">
              {categoryName}
            </span>
          )}
        </div>
        <span className={cn("shrink-0 tabular-nums font-medium", textColor)}>
          {pct}%
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColor)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${categoryName ?? "Presupuesto"}: ${pct}%`}
        />
      </div>

      {/* Mode label */}
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
