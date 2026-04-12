"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Search, ListFilter, Receipt } from "lucide-react";
import type {
  FinanceTransaction,
  FinanceCategory,
  FinanceAccount,
  TransactionStatus,
  TransactionType,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionRow } from "@/components/finance/shared/transaction-row";
import { CategoryPills } from "@/components/finance/shared/category-pills";
import { EmptyState } from "@/components/finance/shared/empty-state";

// ── Constants ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

type StatusFilter = "all" | "pending_review" | "confirmed";
type TypeFilter = "all" | "income" | "expense";

interface StatusOption {
  value: StatusFilter;
  label: string;
}

interface TypeOption {
  value: TypeFilter;
  label: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: "all", label: "Todas" },
  { value: "pending_review", label: "Por Revisar" },
  { value: "confirmed", label: "Confirmadas" },
];

const TYPE_OPTIONS: TypeOption[] = [
  { value: "all", label: "Todos" },
  { value: "income", label: "Ingresos" },
  { value: "expense", label: "Gastos" },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function formatGroupDate(dateStr: string, tz: string): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: tz })
  );
  const d = new Date(dateStr);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(d, now)) return "Hoy";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(d, yesterday)) return "Ayer";

  return d.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    timeZone: tz,
  });
}

function getDateKey(dateStr: string): string {
  return dateStr.slice(0, 10); // YYYY-MM-DD
}

interface DateGroup {
  key: string;
  label: string;
  transactions: FinanceTransaction[];
}

// ── Filter pill component ─────────────────────────────────────────────────

interface FilterPillProps<T extends string> {
  value: T;
  selected: boolean;
  label: string;
  onClick: (v: T) => void;
}

function FilterPill<T extends string>({
  value,
  selected,
  label,
  onClick,
}: FilterPillProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-medium",
        "border transition-all whitespace-nowrap",
        selected
          ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground dark:bg-input/30"
      )}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────

interface TransactionsTabProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  onRefresh: () => void;
  onAddTransaction?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function TransactionsTab({
  transactions,
  categories,
  accounts: _accounts,
  onRefresh: _onRefresh,
  onAddTransaction,
}: TransactionsTabProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ── Timezone (client) ───────────────────────────────────────────────
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  // ── Category map ────────────────────────────────────────────────────
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // ── Unique expense categories for filter pills ──────────────────────
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense" || c.type === "income"),
    [categories]
  );

  // ── Filtered transactions ───────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (t.deleted_at) return false;
      if (statusFilter !== "all" && t.status !== (statusFilter as TransactionStatus))
        return false;
      if (typeFilter !== "all" && t.type !== (typeFilter as TransactionType))
        return false;
      if (categoryFilter && t.category_id !== categoryFilter)
        return false;
      return true;
    });
  }, [transactions, statusFilter, typeFilter, categoryFilter]);

  // ── Sort by date descending ─────────────────────────────────────────
  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.transaction_date).getTime() -
          new Date(a.transaction_date).getTime()
      ),
    [filtered]
  );

  // ── Paginated slice ─────────────────────────────────────────────────
  const visible = useMemo(
    () => sorted.slice(0, page * PAGE_SIZE),
    [sorted, page]
  );

  const hasMore = visible.length < sorted.length;

  // ── Group by date ───────────────────────────────────────────────────
  const groups = useMemo<DateGroup[]>(() => {
    const map = new Map<string, FinanceTransaction[]>();
    const order: string[] = [];

    for (const t of visible) {
      const key = getDateKey(t.transaction_date);
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(t);
    }

    return order.map((key) => ({
      key,
      label: formatGroupDate(map.get(key)![0].transaction_date, timezone),
      transactions: map.get(key)!,
    }));
  }, [visible, timezone]);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const resetFilters = useCallback(() => {
    setStatusFilter("all");
    setTypeFilter("all");
    setCategoryFilter(null);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((v: StatusFilter) => {
    setStatusFilter(v);
    setPage(1);
  }, []);

  const handleTypeFilter = useCallback((v: TypeFilter) => {
    setTypeFilter(v);
    setPage(1);
  }, []);

  const handleCategoryFilter = useCallback((id: string | null) => {
    setCategoryFilter(id);
    setPage(1);
  }, []);

  // ── Active filter count ─────────────────────────────────────────────
  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (categoryFilter ? 1 : 0);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="relative space-y-4 p-4 pb-24">
      {/* 1. Filter bar */}
      <Card>
        <CardContent className="space-y-3 px-4 py-3">
          {/* Status filters */}
          <div className="flex items-center gap-2">
            <ListFilter className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {STATUS_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  selected={statusFilter === opt.value}
                  onClick={handleStatusFilter}
                />
              ))}
            </div>
          </div>

          {/* Type filters */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pl-6">
            {TYPE_OPTIONS.map((opt) => (
              <FilterPill
                key={opt.value}
                value={opt.value}
                label={opt.label}
                selected={typeFilter === opt.value}
                onClick={handleTypeFilter}
              />
            ))}
          </div>

          {/* Category filter */}
          <div className="pl-6">
            <CategoryPills
              categories={expenseCategories}
              selected={categoryFilter}
              onSelect={handleCategoryFilter}
              maxVisible={5}
            />
          </div>

          {/* Active filter indicator */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between pl-6">
              <span className="text-xs text-muted-foreground">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={resetFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Transaction list grouped by date */}
      {groups.length > 0 ? (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.key}>
              {/* Date header */}
              <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <Card>
                <CardContent className="divide-y divide-border px-1 py-1">
                  {group.transactions.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      category={
                        t.category_id
                          ? categoryMap.get(t.category_id)
                          : undefined
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}

          {/* 3. Load more button */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                className="w-full max-w-xs"
              >
                Cargar mas ({sorted.length - visible.length} restantes)
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* 4. Empty state */
        <EmptyState
          icon={activeFilterCount > 0 ? Search : Receipt}
          title={
            activeFilterCount > 0
              ? "Sin resultados"
              : "Sin movimientos"
          }
          description={
            activeFilterCount > 0
              ? "No hay transacciones que coincidan con los filtros seleccionados."
              : "Registra tu primer ingreso o gasto para verlo aqui."
          }
          actionLabel={activeFilterCount > 0 ? "Limpiar filtros" : undefined}
          onAction={activeFilterCount > 0 ? resetFilters : undefined}
        />
      )}

      {/* 5. Floating action button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          className="size-14 rounded-full shadow-lg"
          aria-label="Agregar transaccion"
          onClick={onAddTransaction}
        >
          <Plus className="size-6" />
        </Button>
      </div>
    </div>
  );
}
