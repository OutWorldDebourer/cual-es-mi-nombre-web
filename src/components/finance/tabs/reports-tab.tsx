"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, BarChart3 } from "lucide-react";
import type { FinanceTransaction, FinanceCategory, FinanceProfile } from "@/types/database";
import type { PeriodValue } from "@/components/finance/shared/period-selector";
import { PeriodSelector } from "@/components/finance/shared/period-selector";
import { EmptyState } from "@/components/finance/shared/empty-state";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Constants ──────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
  "#a855f7", "#22d3ee",
];

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatAmount(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

function getPeriodRange(period: PeriodValue, timezone: string): { start: Date; end: Date } {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: timezone })
  );
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "day":
      break;
    case "week":
      start.setDate(start.getDate() - start.getDay() + 1);
      break;
    case "biweekly":
      start.setDate(start.getDate() - 14);
      break;
    case "month":
      start.setDate(1);
      break;
    case "year":
      start.setMonth(0, 1);
      break;
  }

  return { start, end };
}

function filterByRange(
  transactions: FinanceTransaction[],
  start: Date,
  end: Date,
): FinanceTransaction[] {
  return transactions.filter((tx) => {
    if (tx.deleted_at) return false;
    const d = new Date(tx.transaction_date);
    return d >= start && d <= end;
  });
}

// ── Category breakdown data ────────────────────────────────────────────────

interface PieSlice {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

function buildCategoryBreakdown(
  txs: FinanceTransaction[],
  categories: FinanceCategory[],
): PieSlice[] {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const totals = new Map<string, number>();

  for (const tx of txs) {
    if (tx.type !== "expense" || !tx.category_id) continue;
    totals.set(tx.category_id, (totals.get(tx.category_id) ?? 0) + tx.amount);
  }

  const grandTotal = Array.from(totals.values()).reduce((a, b) => a + b, 0);
  if (grandTotal === 0) return [];

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([catId, amount], idx) => {
      const cat = catMap.get(catId);
      return {
        name: cat?.name ?? "Sin categoria",
        value: amount,
        color: cat?.color ?? CHART_COLORS[idx % CHART_COLORS.length],
        percentage: (amount / grandTotal) * 100,
      };
    });
}

// ── Monthly comparison data ────────────────────────────────────────────────

interface MonthBar {
  month: string;
  income: number;
  expense: number;
}

function buildMonthlyComparison(transactions: FinanceTransaction[]): MonthBar[] {
  const now = new Date();
  const months: MonthBar[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
      if (tx.deleted_at) continue;
      const txDate = new Date(tx.transaction_date);
      if (txDate.getFullYear() === year && txDate.getMonth() === month) {
        if (tx.type === "income") income += tx.amount;
        else if (tx.type === "expense") expense += tx.amount;
      }
    }

    months.push({
      month: `${MONTH_LABELS[month]} ${year.toString().slice(2)}`,
      income,
      expense,
    });
  }

  return months;
}

// ── Daily trend data ───────────────────────────────────────────────────────

interface DayPoint {
  date: string;
  net: number;
}

function buildDailyTrend(
  txs: FinanceTransaction[],
  start: Date,
  end: Date,
): DayPoint[] {
  const dayMap = new Map<string, number>();

  // Initialize all days in range
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    dayMap.set(key, 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const tx of txs) {
    const key = tx.transaction_date.slice(0, 10);
    const current = dayMap.get(key) ?? 0;
    if (tx.type === "income") {
      dayMap.set(key, current + tx.amount);
    } else if (tx.type === "expense") {
      dayMap.set(key, current - tx.amount);
    }
  }

  return Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, net]) => ({
      date: date.slice(5), // MM-DD
      net,
    }));
}

// ── Totals for savings rate ────────────────────────────────────────────────

function computeTotals(txs: FinanceTransaction[]): { income: number; expense: number } {
  let income = 0;
  let expense = 0;
  for (const tx of txs) {
    if (tx.deleted_at) continue;
    if (tx.type === "income") income += tx.amount;
    else if (tx.type === "expense") expense += tx.amount;
  }
  return { income, expense };
}

// ── Custom tooltip ─────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {formatAmount(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────

interface ReportsTabProps {
  transactions: FinanceTransaction[];
  categories: FinanceCategory[];
  profile: FinanceProfile;
  timezone: string;
}

// ── Component ──────────────────────────────────────────────────────────────

/** Financial reports with category breakdown, monthly comparison, daily trend, and savings rate. */
export function ReportsTab({
  transactions,
  categories,
  profile,
  timezone,
}: ReportsTabProps) {
  const [period, setPeriod] = useState<PeriodValue>("month");

  const { start, end } = useMemo(
    () => getPeriodRange(period, timezone),
    [period, timezone],
  );

  const filtered = useMemo(
    () => filterByRange(transactions, start, end),
    [transactions, start, end],
  );

  const pieData = useMemo(
    () => buildCategoryBreakdown(filtered, categories),
    [filtered, categories],
  );

  const monthlyData = useMemo(
    () => buildMonthlyComparison(transactions),
    [transactions],
  );

  const dailyData = useMemo(
    () => buildDailyTrend(filtered, start, end),
    [filtered, start, end],
  );

  const { income: periodIncome, expense: periodExpense } = useMemo(
    () => computeTotals(filtered),
    [filtered],
  );

  const savingsRate =
    periodIncome > 0
      ? ((periodIncome - periodExpense) / periodIncome) * 100
      : null;

  // ── Empty state ──────────────────────────────────────────────────────

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Sin datos para reportes"
        description="Registra movimientos para ver tus reportes financieros."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <PeriodSelector value={period} onChange={setPeriod} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Ingresos"
          amount={periodIncome}
          icon={TrendingUp}
          variant="income"
        />
        <SummaryCard
          label="Gastos"
          amount={periodExpense}
          icon={TrendingDown}
          variant="expense"
        />
        <SummaryCard
          label="Balance"
          amount={periodIncome - periodExpense}
          icon={BarChart3}
          variant="neutral"
        />
        {savingsRate !== null && (
          <SummaryCard
            label="Ahorro"
            amount={savingsRate}
            icon={PiggyBank}
            variant="savings"
            isPercentage
          />
        )}
      </div>

      {/* Category breakdown - Donut */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Gastos por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin gastos en este periodo
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      strokeWidth={2}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.color}
                          className="stroke-background"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="flex-1 truncate text-foreground">
                      {entry.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {entry.percentage.toFixed(1)}%
                    </span>
                    <span className="tabular-nums font-medium text-foreground">
                      {formatAmount(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly comparison - Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Comparacion mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: string) =>
                  value === "income" ? "Ingresos" : "Gastos"
                }
              />
              <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily trend - Line chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tendencia diaria (neto)</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin datos en este periodo
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  tickFormatter={(v: number) => formatAmount(v)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Neto"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Savings rate */}
      {savingsRate !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tasa de ahorro</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsGauge rate={savingsRate} income={periodIncome} expense={periodExpense} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Summary card ───────────────────────────────────────────────────────────

type SummaryVariant = "income" | "expense" | "neutral" | "savings";

const variantStyles: Record<SummaryVariant, string> = {
  income: "text-emerald-600 dark:text-emerald-400",
  expense: "text-red-600 dark:text-red-400",
  neutral: "text-foreground",
  savings: "text-indigo-600 dark:text-indigo-400",
};

function SummaryCard({
  label,
  amount,
  icon: Icon,
  variant,
  isPercentage = false,
}: {
  label: string;
  amount: number;
  icon: typeof TrendingUp;
  variant: SummaryVariant;
  isPercentage?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <div className={cn("shrink-0", variantStyles[variant])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn("truncate text-sm font-semibold tabular-nums", variantStyles[variant])}>
            {isPercentage ? `${amount.toFixed(1)}%` : formatAmount(amount)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Savings gauge ──────────────────────────────────────────────────────────

function SavingsGauge({
  rate,
  income,
  expense,
}: {
  rate: number;
  income: number;
  expense: number;
}) {
  const clampedRate = Math.max(0, Math.min(100, rate));
  const barColor =
    rate >= 20
      ? "bg-emerald-500 dark:bg-emerald-400"
      : rate >= 10
        ? "bg-yellow-500 dark:bg-yellow-400"
        : "bg-red-500 dark:bg-red-400";

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-center gap-2">
        <span
          className={cn(
            "text-4xl font-bold tabular-nums",
            rate >= 20
              ? "text-emerald-600 dark:text-emerald-400"
              : rate >= 10
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-red-600 dark:text-red-400",
          )}
        >
          {rate.toFixed(1)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-auto w-full max-w-xs">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${clampedRate}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
        <span>
          Ingresos:{" "}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {formatAmount(income)}
          </span>
        </span>
        <span>
          Gastos:{" "}
          <span className="font-medium text-red-600 dark:text-red-400">
            {formatAmount(expense)}
          </span>
        </span>
      </div>
    </div>
  );
}
