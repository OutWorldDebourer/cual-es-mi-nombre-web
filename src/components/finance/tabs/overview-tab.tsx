"use client";

import { useState, useMemo, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type {
  FinanceTransaction,
  FinanceCategory,
  FinanceAccount,
  FinanceBudget,
  FinanceProfile,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickEntry } from "@/components/finance/shared/quick-entry";
import { TransactionRow } from "@/components/finance/shared/transaction-row";
import { PeriodSelector } from "@/components/finance/shared/period-selector";
import type { PeriodValue } from "@/components/finance/shared/period-selector";
import { BudgetProgressBar } from "@/components/finance/shared/budget-progress-bar";
import { EmptyState } from "@/components/finance/shared/empty-state";
import { formatAmount } from "@/components/finance/shared/format-utils";

// ── Helpers ───────────────────────────────────────────────────────────────

function startOfPeriod(period: PeriodValue, tz: string): Date {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: tz })
  );
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "day":
      break;
    case "week":
      start.setDate(start.getDate() - start.getDay() + 1); // Monday
      break;
    case "biweekly":
      start.setDate(start.getDate() >= 16 ? 16 : 1);
      break;
    case "month":
      start.setDate(1);
      break;
    case "year":
      start.setMonth(0, 1);
      break;
  }
  return start;
}

function isToday(dateStr: string, tz: string): boolean {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: tz })
  );
  const d = new Date(dateStr);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ── Donut chart colors ────────────────────────────────────────────────────

const CHART_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6",
  "#a855f7", "#64748b",
];

interface ChartDatum {
  name: string;
  value: number;
  color: string;
}

// ── Props ─────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  budgets: FinanceBudget[];
  profile: FinanceProfile;
  timezone: string;
  onAddTransaction?: () => void;
  onQuickEntry?: (data: {
    type: string;
    amount: number;
    categoryId: string;
    description?: string;
  }) => void;
  onTabChange?: (tab: string) => void;
}

// ── Metric card (mockup design) ──────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor?: string;
  valueColor?: string;
  subText?: string;
  changeBadge?: { text: string; direction: "up" | "down" };
}

function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor,
  valueColor,
  subText,
  changeBadge,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted-foreground">{title}</span>
        <Icon className="size-4" style={iconColor ? { color: iconColor } : undefined} />
      </div>
      <p
        className="mt-2 text-[32px] font-bold leading-none tracking-tight tabular-nums"
        style={valueColor ? { color: valueColor, letterSpacing: "-1px" } : { letterSpacing: "-1px" }}
      >
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {changeBadge && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              changeBadge.direction === "up"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            )}
          >
            {changeBadge.direction === "up" ? "+" : ""}
            {changeBadge.text}
          </span>
        )}
        {subText && (
          <span className="text-xs text-muted-foreground">{subText}</span>
        )}
      </div>
    </Card>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────

interface DonutPayload {
  name: string;
  value: number;
  color: string;
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DonutPayload }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{d.name}</p>
      <p className="tabular-nums text-muted-foreground">{formatAmount(d.value)}</p>
    </div>
  );
}

// ── Stagger animation styles ─────────────────────────────────────────────

const staggerStyle = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.stagger > * {
  animation: fadeInUp 0.3s ease-out both;
}
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 60ms; }
.stagger > *:nth-child(3) { animation-delay: 120ms; }
.stagger > *:nth-child(4) { animation-delay: 180ms; }
.stagger > *:nth-child(5) { animation-delay: 240ms; }
.stagger > *:nth-child(6) { animation-delay: 300ms; }
.stagger > *:nth-child(7) { animation-delay: 360ms; }
.stagger > *:nth-child(8) { animation-delay: 420ms; }
`;

// ── Component ─────────────────────────────────────────────────────────────

export function OverviewTab({
  transactions,
  categories,
  accounts,
  budgets,
  profile,
  timezone,
  onAddTransaction,
  onQuickEntry,
  onTabChange,
}: OverviewTabProps) {
  const [period, setPeriod] = useState<PeriodValue>("month");

  // ── Category map for fast lookup ────────────────────────────────────
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // ── Filtered transactions by period ─────────────────────────────────
  const filtered = useMemo(() => {
    const cutoff = startOfPeriod(period, timezone);
    return transactions.filter(
      (t) => !t.deleted_at && new Date(t.transaction_date) >= cutoff
    );
  }, [transactions, period, timezone]);

  // ── Hero metrics ────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of filtered) {
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expense += t.amount;
    }
    const balance = income - expense;
    const available = income - expense;
    const incomePercent = income > 0 ? ((available / income) * 100).toFixed(1) : "0.0";
    return { income, expense, balance, available, incomePercent };
  }, [filtered]);

  // ── Today totals for QuickEntry ─────────────────────────────────────
  const todayTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.deleted_at || !isToday(t.transaction_date, timezone)) continue;
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expense += t.amount;
    }
    return { income, expense };
  }, [transactions, timezone]);

  // ── Pending review count ────────────────────────────────────────────
  const pendingCount = useMemo(
    () => transactions.filter((t) => !t.deleted_at && t.status === "pending_review").length,
    [transactions]
  );

  // ── Donut chart data (expense by category) ─────────────────────────
  const chartData = useMemo<ChartDatum[]>(() => {
    const byCategory = new Map<string, number>();
    for (const t of filtered) {
      if (t.type !== "expense" || !t.category_id) continue;
      byCategory.set(t.category_id, (byCategory.get(t.category_id) ?? 0) + t.amount);
    }
    const entries = Array.from(byCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    return entries.map(([catId, value], i) => {
      const cat = categoryMap.get(catId);
      return {
        name: cat?.name ?? "Otro",
        value,
        color: cat?.color ?? CHART_COLORS[i % CHART_COLORS.length],
      };
    });
  }, [filtered, categoryMap]);

  // ── Active budgets ──────────────────────────────────────────────────
  const activeBudgets = useMemo(
    () => budgets.filter((b) => b.is_active),
    [budgets]
  );

  // ── Budget spent amounts (from filtered transactions) ───────────────
  const budgetSpent = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered) {
      if (t.type !== "expense" || !t.category_id) continue;
      map.set(t.category_id, (map.get(t.category_id) ?? 0) + t.amount);
    }
    return map;
  }, [filtered]);

  // ── Recent transactions (last 5) ───────────────────────────────────
  const recent = useMemo(
    () =>
      [...transactions]
        .filter((t) => !t.deleted_at)
        .sort(
          (a, b) =>
            new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
        )
        .slice(0, 5),
    [transactions]
  );

  // ── Quick entry submit handler ──────────────────────────────────────
  const handleQuickEntry = useCallback(
    (entry: { type: string; categoryId: string; amount: number; description: string }) => {
      onQuickEntry?.({
        type: entry.type,
        amount: entry.amount,
        categoryId: entry.categoryId,
        description: entry.description || undefined,
      });
    },
    [onQuickEntry]
  );

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <>
      <style>{staggerStyle}</style>
      <div className="stagger space-y-6 p-4">
        {/* 1. Review banner */}
        {pendingCount > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 dark:border-yellow-700 dark:bg-yellow-950/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Tienes transacciones por revisar
              </span>
              <Badge
                variant="secondary"
                className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
              >
                {pendingCount}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-yellow-700 dark:text-yellow-300"
            >
              Ver
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        )}

        {/* 2. Quick Entry */}
        <QuickEntry
          categories={categories}
          onSubmit={handleQuickEntry}
          todayTotals={todayTotals}
        />

        {/* 3. Hero metrics — 4-column grid (mockup) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Balance Total"
            value={formatAmount(metrics.balance)}
            icon={Wallet}
            subText="Balance del periodo"
          />
          <MetricCard
            title="Ingresos del Mes"
            value={formatAmount(metrics.income)}
            icon={TrendingUp}
            iconColor="#00da00"
            valueColor="#00da00"
            subText="Total ingresos"
          />
          <MetricCard
            title="Gastos del Mes"
            value={formatAmount(metrics.expense)}
            icon={TrendingDown}
            iconColor="#ef4444"
            valueColor="#ef4444"
            subText="Total gastos"
          />
          <MetricCard
            title="Disponible"
            value={formatAmount(metrics.available)}
            icon={Wallet}
            valueColor="#ff5600"
            subText={`${metrics.incomePercent}% de ingresos`}
          />
        </div>

        {/* 4. Period selector — between metrics and charts */}
        <div className="flex items-center justify-between">
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* 5. Charts row — side by side (mockup) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 5a. Donut chart — expense by category */}
          {chartData.length > 0 ? (
            <Card
              className={cn(
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gastos por categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mx-auto h-56 w-full max-w-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {chartData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {chartData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={TrendingDown}
              title="Sin gastos en este periodo"
              description="Registra tu primer gasto para ver el desglose por categoría."
            />
          )}

          {/* 5b. Budget progress bars */}
          {activeBudgets.length > 0 ? (
            <Card
              className={cn(
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Presupuestos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeBudgets.map((b) => {
                  const cat = b.category_id ? categoryMap.get(b.category_id) : undefined;
                  const spent = b.category_id ? (budgetSpent.get(b.category_id) ?? 0) : 0;
                  const limit =
                    b.budget_mode === "percentage"
                      ? ((b.percentage ?? 0) / 100) * metrics.income
                      : b.budget_mode === "envelope"
                        ? (b.envelope_assigned ?? 0)
                        : (b.amount_limit ?? 0);

                  return (
                    <BudgetProgressBar
                      key={b.id}
                      spent={spent}
                      limit={limit}
                      mode={b.budget_mode}
                      categoryName={cat?.name}
                      categoryIcon={cat?.icon ?? undefined}
                    />
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card
              className={cn(
                "transition-all duration-200",
                "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Presupuestos</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={Wallet}
                  title="Sin presupuestos activos"
                  description="Crea un presupuesto para controlar tus gastos."
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* 6. Recent transactions */}
        <Card
          className={cn(
            "transition-all duration-200",
            "hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Últimos movimientos</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onTabChange?.("transactions")}
            >
              Ver todas
              <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="px-1">
            {recent.length > 0 ? (
              <div className="divide-y divide-border">
                {recent.map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    category={
                      t.category_id ? categoryMap.get(t.category_id) : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title="Sin movimientos"
                description="Registra tu primer ingreso o gasto arriba."
              />
            )}
          </CardContent>
        </Card>

        {/* 7. Floating action button */}
        {onAddTransaction && (
          <div className="fixed bottom-20 right-6 z-40 md:bottom-6">
            <Button
              size="lg"
              className="size-14 rounded-full shadow-lg"
              aria-label="Agregar transacción"
              onClick={onAddTransaction}
            >
              <Plus className="size-6" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
