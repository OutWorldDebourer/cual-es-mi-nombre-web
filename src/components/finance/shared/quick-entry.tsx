"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import type { FinanceCategory, TransactionType } from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryPills } from "@/components/finance/shared/category-pills";
import { AmountInput } from "@/components/finance/shared/amount-input";

interface QuickEntrySubmit {
  type: TransactionType;
  categoryId: string;
  amount: number;
  description: string;
}

interface TodayTotals {
  income: number;
  expense: number;
}

interface QuickEntryProps {
  categories: FinanceCategory[];
  onSubmit: (entry: QuickEntrySubmit) => void;
  todayTotals: TodayTotals;
  className?: string;
}

interface EntryWidgetProps {
  type: "income" | "expense";
  categories: FinanceCategory[];
  todayTotal: number;
  onSubmit: (entry: QuickEntrySubmit) => void;
}

function formatAmount(n: number): string {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function EntryWidget({ type, categories, todayTotal, onSubmit }: EntryWidgetProps) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const isIncome = type === "income";
  const Icon = isIncome ? TrendingUp : TrendingDown;
  const label = isIncome ? "Ingreso" : "Gasto";

  const filteredCategories = categories.filter(
    (c) => c.type === (isIncome ? "income" : "expense") && c.show_in_quick_entry
  );

  const canSubmit = categoryId !== null && amount !== "" && parseFloat(amount) > 0;

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !categoryId) return;
    onSubmit({
      type,
      categoryId,
      amount: parseFloat(amount),
      description: description.trim(),
    });
    setCategoryId(null);
    setAmount("");
    setDescription("");
    setOpen(false);
  }, [canSubmit, categoryId, amount, description, type, onSubmit]);

  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen}>
      {/* Trigger header */}
      <CollapsiblePrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-lg border px-4 py-3",
            "transition-all",
            isIncome
              ? "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50"
              : "border-red-200 bg-red-50/60 hover:bg-red-50 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-950/50"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                "size-4",
                isIncome
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            />
            <span className="text-sm font-medium text-foreground">
              {label}
            </span>
            <span className="text-xs text-muted-foreground">
              Hoy: {formatAmount(todayTotal)}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </CollapsiblePrimitive.Trigger>

      {/* Expandable content */}
      <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div
          className={cn(
            "mt-2 space-y-3 rounded-lg border p-4",
            isIncome
              ? "border-emerald-200/50 dark:border-emerald-800/50"
              : "border-red-200/50 dark:border-red-800/50"
          )}
        >
          {/* Category selection */}
          {filteredCategories.length > 0 ? (
            <CategoryPills
              categories={filteredCategories}
              selected={categoryId}
              onSelect={setCategoryId}
              maxVisible={4}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              No hay categorias de {isIncome ? "ingreso" : "gasto"} configuradas.
            </p>
          )}

          {/* Amount input */}
          <AmountInput
            value={amount}
            onChange={setAmount}
            variant={isIncome ? "income" : "expense"}
            size="md"
            placeholder="0.00"
          />

          {/* Description */}
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isIncome ? "Ej: Sueldo marzo" : "Ej: Almuerzo"}
            className="h-9 text-sm"
          />

          {/* Submit */}
          <Button
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={cn(
              "w-full",
              isIncome
                ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                : "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
            )}
          >
            <Plus className="size-4" />
            Registrar {label.toLowerCase()}
          </Button>
        </div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

/** Two side-by-side collapsible widgets for quick income/expense entry. */
export function QuickEntry({
  categories,
  onSubmit,
  todayTotals,
  className,
}: QuickEntryProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      <EntryWidget
        type="income"
        categories={categories}
        todayTotal={todayTotals.income}
        onSubmit={onSubmit}
      />
      <EntryWidget
        type="expense"
        categories={categories}
        todayTotal={todayTotals.expense}
        onSubmit={onSubmit}
      />
    </div>
  );
}
