"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Plus,
  Percent,
  Wallet,
  Mail,
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type {
  FinanceBudget,
  FinanceCategory,
  FinanceProfile,
  BudgetMode,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BudgetProgressBar } from "@/components/finance/shared/budget-progress-bar";
import { EmptyState } from "@/components/finance/shared/empty-state";
import { formatAmount } from "@/components/finance/shared/format-utils";

// ── Allocation chart colors ───────────────────────────────────────────────

const ALLOC_COLORS = [
  "#22c55e", "#3b82f6", "#f97316", "#8b5cf6", "#ef4444",
  "#06b6d4", "#eab308", "#ec4899", "#14b8a6", "#a855f7",
  "#64748b", "#f43f5e",
];

interface AllocDatum {
  name: string;
  value: number;
  color: string;
}

// ── Percentage tooltip ────────────────────────────────────────────────────

function AllocTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: AllocDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{d.name}</p>
      <p className="tabular-nums text-muted-foreground">{d.value.toFixed(1)}%</p>
    </div>
  );
}

// ── Mode header config ────────────────────────────────────────────────────

interface ModeConfig {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const MODE_CONFIGS: Record<BudgetMode, ModeConfig> = {
  fixed: {
    title: "Presupuestos por Monto Fijo",
    description: "Define un limite maximo de gasto por categoria.",
    icon: Wallet,
    color: "text-blue-600 dark:text-blue-400",
  },
  percentage: {
    title: "Presupuestos por Porcentaje",
    description: "Asigna un porcentaje de tus ingresos a cada categoria.",
    icon: Percent,
    color: "text-purple-600 dark:text-purple-400",
  },
  envelope: {
    title: "Sobres (YNAB)",
    description: "Asigna dinero a sobres y gasta solo lo asignado.",
    icon: Mail,
    color: "text-emerald-600 dark:text-emerald-400",
  },
};

// ── Envelope card ─────────────────────────────────────────────────────────

interface EnvelopeCardProps {
  budget: FinanceBudget;
  category?: FinanceCategory;
  spent: number;
  onAssign?: (id: string) => void;
  onRemove?: (id: string) => void;
}

function EnvelopeCard({
  budget,
  category,
  spent,
  onAssign,
  onRemove,
}: EnvelopeCardProps) {
  const assigned = budget.envelope_assigned ?? 0;
  const remaining = assigned - spent;
  const isOverspent = remaining < 0;

  return (
    <Card
      className={cn(
        "transition-colors",
        isOverspent && "border-red-300 dark:border-red-800"
      )}
    >
      <CardContent className="space-y-3 px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {category?.icon && (
              <span className="text-lg shrink-0">{category.icon}</span>
            )}
            <span className="truncate text-sm font-semibold text-foreground">
              {category?.name ?? "Sin categoria"}
            </span>
          </div>
          {isOverspent && (
            <Badge
              variant="destructive"
              className="shrink-0 text-[10px]"
            >
              Excedido
            </Badge>
          )}
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Asignado
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {formatAmount(assigned)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Gastado
            </p>
            <p className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
              {formatAmount(spent)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Restante
            </p>
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                isOverspent
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {formatAmount(remaining)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <BudgetProgressBar
          spent={spent}
          limit={assigned}
          mode="envelope"
          categoryName={category?.name}
          categoryIcon={category?.icon ?? undefined}
        />

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 text-xs"
            onClick={() => onAssign?.(budget.id)}
          >
            <ArrowUpCircle className="size-3.5" />
            Asignar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 text-xs"
            onClick={() => onRemove?.(budget.id)}
          >
            <ArrowDownCircle className="size-3.5" />
            Quitar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────

interface BudgetsTabProps {
  budgets: FinanceBudget[];
  categories: FinanceCategory[];
  profile: FinanceProfile;
}

// ── Component ─────────────────────────────────────────────────────────────

export function BudgetsTab({
  budgets,
  categories,
  profile,
}: BudgetsTabProps) {
  const mode = profile.budget_mode;
  const config = MODE_CONFIGS[mode];
  const ModeIcon = config.icon;

  // ── Category map ────────────────────────────────────────────────────
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // ── Active budgets only ─────────────────────────────────────────────
  const active = useMemo(
    () => budgets.filter((b) => b.is_active),
    [budgets]
  );

  // ── Income reference for percentage mode ────────────────────────────
  const incomeRef = profile.fixed_income_amount ?? 0;

  // ── Placeholder spent map (real data comes from transactions prop later)
  // For now each budget has 0 spent — wired when TransactionsTab passes data
  const [spentMap] = useState<Map<string, number>>(() => new Map());

  const getSpent = useCallback(
    (categoryId: string | null) =>
      categoryId ? (spentMap.get(categoryId) ?? 0) : 0,
    [spentMap]
  );

  // ── Percentage mode: total allocated ────────────────────────────────
  const totalPct = useMemo(
    () => active.reduce((sum, b) => sum + (b.percentage ?? 0), 0),
    [active]
  );

  // ── Percentage chart data ───────────────────────────────────────────
  const allocData = useMemo<AllocDatum[]>(() => {
    if (mode !== "percentage") return [];
    const data = active
      .filter((b) => (b.percentage ?? 0) > 0)
      .map((b, i) => {
        const cat = b.category_id ? categoryMap.get(b.category_id) : undefined;
        return {
          name: cat?.name ?? "Otro",
          value: b.percentage ?? 0,
          color: cat?.color ?? ALLOC_COLORS[i % ALLOC_COLORS.length],
        };
      });
    const unallocated = 100 - totalPct;
    if (unallocated > 0) {
      data.push({ name: "Sin asignar", value: unallocated, color: "#e2e8f0" });
    }
    return data;
  }, [mode, active, categoryMap, totalPct]);

  // ── Envelope mode: total assigned & unassigned ──────────────────────
  const envelopeTotals = useMemo(() => {
    if (mode !== "envelope") return { assigned: 0, unassigned: 0 };
    const assigned = active.reduce((s, b) => s + (b.envelope_assigned ?? 0), 0);
    const unassigned = incomeRef - assigned;
    return { assigned, unassigned: Math.max(unassigned, 0) };
  }, [mode, active, incomeRef]);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleAddBudget = useCallback(() => {
    // TODO: Open create budget dialog
  }, []);

  const handleAssign = useCallback((_budgetId: string) => {
    // TODO: Open assign dialog
  }, []);

  const handleRemove = useCallback((_budgetId: string) => {
    // TODO: Open remove dialog
  }, []);

  // ── Empty state ─────────────────────────────────────────────────────
  if (active.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          icon={PiggyBank}
          title="Sin presupuestos"
          description="Crea tu primer presupuesto para controlar tus gastos por categoria."
          actionLabel="Agregar presupuesto"
          onAction={handleAddBudget}
        />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4">
      {/* Mode header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            mode === "fixed"
              ? "bg-blue-100 dark:bg-blue-900/40"
              : mode === "percentage"
                ? "bg-purple-100 dark:bg-purple-900/40"
                : "bg-emerald-100 dark:bg-emerald-900/40"
          )}
        >
          <ModeIcon className={cn("size-5", config.color)} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {config.title}
          </h2>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* ── FIXED mode ─────────────────────────────────────────────── */}
      {mode === "fixed" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-5 px-4 py-4">
              {active.map((b) => {
                const cat = b.category_id
                  ? categoryMap.get(b.category_id)
                  : undefined;
                return (
                  <BudgetProgressBar
                    key={b.id}
                    spent={getSpent(b.category_id)}
                    limit={b.amount_limit ?? 0}
                    mode="fixed"
                    categoryName={cat?.name}
                    categoryIcon={cat?.icon ?? undefined}
                  />
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PERCENTAGE mode ────────────────────────────────────────── */}
      {mode === "percentage" && (
        <div className="space-y-4">
          {/* Income reference */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Ingreso de referencia
              </span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {formatAmount(incomeRef)}
              </span>
            </CardContent>
          </Card>

          {/* Allocation bar summary */}
          <Card>
            <CardContent className="px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total asignado</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    totalPct > 100
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                  )}
                >
                  {totalPct.toFixed(1)}% / 100%
                </span>
              </div>
              {totalPct > 100 && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  La asignacion excede el 100% de tus ingresos.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Allocation pie chart */}
          {allocData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Distribucion de ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mx-auto h-48 w-full max-w-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {allocData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<AllocTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {allocData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-muted-foreground">
                        {d.name} ({d.value.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-category budget bars */}
          <Card>
            <CardContent className="space-y-5 px-4 py-4">
              {active.map((b) => {
                const cat = b.category_id
                  ? categoryMap.get(b.category_id)
                  : undefined;
                const limit = ((b.percentage ?? 0) / 100) * incomeRef;
                return (
                  <BudgetProgressBar
                    key={b.id}
                    spent={getSpent(b.category_id)}
                    limit={limit}
                    mode="percentage"
                    categoryName={cat?.name}
                    categoryIcon={cat?.icon ?? undefined}
                  />
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── ENVELOPE mode ──────────────────────────────────────────── */}
      {mode === "envelope" && (
        <div className="space-y-4">
          {/* "Por Asignar" hero card */}
          <Card
            className={cn(
              "border-2",
              envelopeTotals.unassigned > 0
                ? "border-emerald-300 dark:border-emerald-700"
                : "border-muted"
            )}
          >
            <CardContent className="flex flex-col items-center gap-1 px-4 py-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Por Asignar
              </p>
              <p
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  envelopeTotals.unassigned > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                {formatAmount(envelopeTotals.unassigned)}
              </p>
              <p className="text-xs text-muted-foreground">
                de {formatAmount(incomeRef)} de ingreso
              </p>
            </CardContent>
          </Card>

          {/* Envelope cards — responsive grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((b) => {
              const cat = b.category_id
                ? categoryMap.get(b.category_id)
                : undefined;
              return (
                <EnvelopeCard
                  key={b.id}
                  budget={b}
                  category={cat}
                  spent={getSpent(b.category_id)}
                  onAssign={handleAssign}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Add budget button — all modes */}
      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleAddBudget}
        >
          <Plus className="size-4" />
          Agregar presupuesto
        </Button>
      </div>
    </div>
  );
}
