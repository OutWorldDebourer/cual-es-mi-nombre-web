"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  FinanceBudget,
  FinanceCategory,
  FinanceProfile,
  BudgetPeriod,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { AmountInput } from "@/components/finance/shared/amount-input";

// ── Schema ──────────────────────────────────────────────────────────────────

const budgetSchema = z
  .object({
    mode: z.string(),
    categoryId: z.string().min(1, "Categoria requerida"),
    amountLimit: z.string().optional(),
    percentage: z.string().optional(),
    envelopeAssigned: z.string().optional(),
    period: z.enum(["weekly", "biweekly", "monthly", "yearly"]),
    rollover: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "fixed") {
      if (!data.amountLimit || isNaN(parseFloat(data.amountLimit)) || parseFloat(data.amountLimit) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Monto requerido", path: ["amountLimit"] });
      }
    }
    if (data.mode === "percentage") {
      const pct = parseFloat(data.percentage ?? "");
      if (!data.percentage || isNaN(pct) || pct <= 0 || pct > 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Porcentaje requerido (1-100)", path: ["percentage"] });
      }
    }
    if (data.mode === "envelope") {
      if (!data.envelopeAssigned || isNaN(parseFloat(data.envelopeAssigned)) || parseFloat(data.envelopeAssigned) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Monto a asignar requerido", path: ["envelopeAssigned"] });
      }
    }
  });

type BudgetFormData = z.infer<typeof budgetSchema>;

export interface BudgetSubmitData {
  categoryId: string | null;
  amountLimit: number | null;
  percentage: number | null;
  envelopeAssigned: number | null;
  period: BudgetPeriod;
  rollover: boolean;
}

interface CreateBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null = creating new budget, existing = editing */
  budget: FinanceBudget | null;
  categories: FinanceCategory[];
  profile: FinanceProfile;
  onSubmit: (data: BudgetSubmitData) => Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────────────────

const PERIOD_OPTIONS: Array<{ value: BudgetPeriod; label: string }> = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
];

const MODE_LABELS: Record<string, string> = {
  fixed: "Monto Fijo",
  percentage: "Porcentaje",
  envelope: "Sobre",
};

// ── Component ──────────────────────────────────────────────────────────────

/** Modal for creating or editing a budget. Adapts fields to the profile's budget_mode. */
export function CreateBudgetModal({
  open,
  onOpenChange,
  budget,
  categories,
  profile,
  onSubmit,
}: CreateBudgetModalProps) {
  const isEditing = budget !== null;
  const mode = profile.budget_mode;

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      mode,
      categoryId: "",
      amountLimit: "",
      percentage: "",
      envelopeAssigned: "",
      period: "monthly",
      rollover: false,
    },
  });

  // Pre-populate when editing; always sync mode from profile
  useEffect(() => {
    if (budget) {
      reset({
        mode,
        categoryId: budget.category_id ?? "",
        amountLimit: budget.amount_limit?.toString() ?? "",
        percentage: budget.percentage?.toString() ?? "",
        envelopeAssigned: budget.envelope_assigned?.toString() ?? "",
        period: budget.period,
        rollover: budget.rollover,
      });
    } else {
      reset({
        mode,
        categoryId: "",
        amountLimit: "",
        percentage: "",
        envelopeAssigned: "",
        period: "monthly",
        rollover: false,
      });
    }
  }, [budget, reset, mode]);

  const selectedCategoryId = watch("categoryId");
  const currentPeriod = watch("period");

  const handleFormSubmit = useCallback(
    async (data: BudgetFormData) => {
      const amountLimit =
        mode === "fixed" && data.amountLimit
          ? parseFloat(data.amountLimit)
          : null;
      const percentage =
        mode === "percentage" && data.percentage
          ? parseFloat(data.percentage)
          : null;
      const envelopeAssigned =
        mode === "envelope" && data.envelopeAssigned
          ? parseFloat(data.envelopeAssigned)
          : null;

      try {
        await onSubmit({
          categoryId: data.categoryId ?? null,
          amountLimit,
          percentage,
          envelopeAssigned,
          period: data.period,
          rollover: data.rollover,
        });
        reset();
        onOpenChange(false);
      } catch {
        // Mutation already shows toast.error — keep modal open for retry
      }
    },
    [mode, onSubmit, reset, onOpenChange]
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <div className="flex items-center gap-3">
            <ResponsiveDialogTitle>
              {isEditing ? "Editar presupuesto" : "Crear presupuesto"}
            </ResponsiveDialogTitle>
            <span className="inline-flex items-center rounded-full bg-[#ff5600]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff5600]">
              {MODE_LABELS[mode] ?? mode}
            </span>
          </div>
          <ResponsiveDialogDescription>
            {isEditing
              ? "Modifica los datos del presupuesto."
              : "Define un limite de gasto por categoria."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5 py-2"
        >
          {/* ── Category pills grid ── */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Categoria
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {expenseCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setValue("categoryId", cat.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-all",
                    "hover:border-muted-foreground/60",
                    selectedCategoryId === cat.id
                      ? "border-[#ff5600] bg-[#ff5600]/10 ring-1 ring-[#ff5600]/20"
                      : "border-border bg-secondary/50"
                  )}
                >
                  <span className="shrink-0 text-base">{cat.icon ?? "📁"}</span>
                  <span className="truncate text-xs font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* ── Amount: fixed mode ── */}
          {mode === "fixed" && (
            <div className="space-y-2">
              <div className="rounded-xl border border-border bg-card/50 p-4">
                <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                  Limite mensual
                </Label>
                <Controller
                  control={control}
                  name="amountLimit"
                  render={({ field }) => (
                    <AmountInput
                      id="budget-amount"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      currency="S/"
                      size="lg"
                      className="!text-2xl !font-bold"
                    />
                  )}
                />
              </div>
              {errors.amountLimit && (
                <p className="text-xs text-destructive">
                  {errors.amountLimit.message}
                </p>
              )}
            </div>
          )}

          {/* ── Amount: envelope mode ── */}
          {mode === "envelope" && (
            <div className="space-y-2">
              <div className="rounded-xl border border-border bg-card/50 p-4">
                <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                  Monto a asignar
                </Label>
                <Controller
                  control={control}
                  name="envelopeAssigned"
                  render={({ field }) => (
                    <AmountInput
                      id="budget-envelope"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      currency="S/"
                      size="lg"
                      className="!text-2xl !font-bold"
                    />
                  )}
                />
              </div>
              {errors.envelopeAssigned && (
                <p className="text-xs text-destructive">
                  {errors.envelopeAssigned.message}
                </p>
              )}
            </div>
          )}

          {/* ── Percentage mode ── */}
          {mode === "percentage" && (
            <div className="space-y-2">
              <div className="rounded-xl border border-border bg-card/50 p-4">
                <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                  Porcentaje del ingreso
                </Label>
                <div className="flex items-baseline gap-2">
                  <Controller
                    control={control}
                    name="percentage"
                    render={({ field }) => (
                      <Input
                        id="budget-pct"
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="0"
                        className="h-14 w-28 border-none bg-transparent text-2xl font-bold tabular-nums outline-none focus-visible:ring-0"
                      />
                    )}
                  />
                  <span className="text-2xl font-bold text-muted-foreground">%</span>
                </div>
              </div>
              {errors.percentage && (
                <p className="text-xs text-destructive">
                  {errors.percentage.message}
                </p>
              )}
            </div>
          )}

          {/* ── Period pill toggle ── */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Periodo
            </Label>
            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              {PERIOD_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("period", value)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    currentPeriod === value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Rollover toggle ── */}
          <Controller
            control={control}
            name="rollover"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Rollover</p>
                  <p className="text-xs text-muted-foreground">
                    Acumula saldo no gastado
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
                    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    field.value ? "bg-[#ff5600]" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                      field.value ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            )}
          />

          {/* ── Footer ── */}
          <ResponsiveDialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#ff5600] text-white hover:bg-[#e04d00]"
            >
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
