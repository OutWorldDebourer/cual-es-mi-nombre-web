"use client";

import { useMemo } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type {
  FinanceTransaction,
  FinanceCategory,
  TransactionSource,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionRowProps {
  transaction: FinanceTransaction;
  category?: FinanceCategory;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCorrect?: (id: string) => void;
  className?: string;
}

const SOURCE_LABELS: Record<TransactionSource, string> = {
  whatsapp: "WA",
  web: "Web",
  auto: "Auto",
  recurring: "Rec",
};

const SOURCE_STYLES: Record<TransactionSource, string> = {
  whatsapp: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  web: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  auto: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  recurring: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
};

function formatAmount(amount: number, type: string): string {
  const formatted = Math.abs(amount).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return type === "income" ? `+S/ ${formatted}` : `-S/ ${formatted}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
  });
}

/** Single transaction row with category, amount, source badge, and action menu. */
export function TransactionRow({
  transaction,
  category,
  onEdit,
  onDelete,
  onCorrect,
  className,
}: TransactionRowProps) {
  const isIncome = transaction.type === "income";
  const isPending = transaction.status === "pending_review";

  const amountText = useMemo(
    () => formatAmount(transaction.amount, transaction.type),
    [transaction.amount, transaction.type]
  );

  const dateText = useMemo(
    () => formatDate(transaction.transaction_date),
    [transaction.transaction_date]
  );

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5",
        "transition-colors hover:bg-muted/50 dark:hover:bg-muted/30",
        className
      )}
    >
      {/* Category icon / color dot */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted dark:bg-muted/50">
        {category?.icon ? (
          <span className="text-base">{category.icon}</span>
        ) : (
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: category?.color ?? "#94a3b8" }}
          />
        )}
      </div>

      {/* Description + date */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium text-foreground">
            {transaction.description ?? category?.name ?? "Sin descripcion"}
          </span>
          {isPending && (
            <AlertCircle className="size-3.5 shrink-0 text-yellow-500" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{dateText}</span>
          <Badge
            variant="ghost"
            className={cn(
              "h-4 px-1 text-[10px] font-semibold rounded",
              SOURCE_STYLES[transaction.source]
            )}
          >
            {SOURCE_LABELS[transaction.source]}
          </Badge>
          {isPending && (
            <Badge
              variant="outline"
              className="h-4 px-1 text-[10px] border-yellow-400 text-yellow-600 dark:text-yellow-400"
            >
              Revisar
            </Badge>
          )}
        </div>
      </div>

      {/* Amount */}
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          isIncome
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
        )}
      >
        {amountText}
      </span>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Acciones"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onSelect={() => onEdit(transaction.id)}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
          )}
          {onCorrect && (
            <DropdownMenuItem onSelect={() => onCorrect(transaction.id)}>
              <RefreshCw className="size-4" />
              Corregir
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(transaction.id)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
