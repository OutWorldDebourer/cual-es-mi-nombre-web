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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// ── Period options ──────────────────────────────────────────────────────────

const PERIOD_OPTIONS: Array<{ value: BudgetPeriod; label: string }> = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
];

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
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEditing ? "Editar presupuesto" : "Crear presupuesto"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {isEditing
              ? "Modifica los datos del presupuesto."
              : "Define un limite de gasto por categoria."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          {/* Category */}
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          {cat.icon && <span>{cat.icon}</span>}
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Amount Limit — fixed mode only */}
          {mode === "fixed" && (
            <div className="space-y-1.5">
              <Label htmlFor="budget-amount">Limite de monto</Label>
              <Controller
                control={control}
                name="amountLimit"
                render={({ field }) => (
                  <AmountInput
                    id="budget-amount"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    currency="S/"
                    size="sm"
                  />
                )}
              />
              {errors.amountLimit && (
                <p className="text-xs text-destructive">
                  {errors.amountLimit.message}
                </p>
              )}
            </div>
          )}

          {/* Envelope assigned — envelope mode only */}
          {mode === "envelope" && (
            <div className="space-y-1.5">
              <Label htmlFor="budget-envelope">Monto a asignar</Label>
              <Controller
                control={control}
                name="envelopeAssigned"
                render={({ field }) => (
                  <AmountInput
                    id="budget-envelope"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    currency="S/"
                    size="sm"
                  />
                )}
              />
              {errors.envelopeAssigned && (
                <p className="text-xs text-destructive">
                  {errors.envelopeAssigned.message}
                </p>
              )}
            </div>
          )}

          {/* Percentage — percentage mode only */}
          {mode === "percentage" && (
            <div className="space-y-1.5">
              <Label htmlFor="budget-pct">Porcentaje del ingreso</Label>
              <div className="flex items-center gap-2">
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
                      className="h-9 w-24 text-sm tabular-nums"
                    />
                  )}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              {errors.percentage && (
                <p className="text-xs text-destructive">
                  {errors.percentage.message}
                </p>
              )}
            </div>
          )}

          {/* Period */}
          <div className="space-y-1.5">
            <Label>Periodo</Label>
            <Controller
              control={control}
              name="period"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Rollover toggle — checkbox since no Switch component available */}
          <div className="flex items-center gap-3">
            <Controller
              control={control}
              name="rollover"
              render={({ field }) => (
                <button
                  type="button"
                  role="switch"
                  aria-checked={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent " +
                    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                    (field.value
                      ? "bg-primary"
                      : "bg-muted")
                  }
                >
                  <span
                    className={
                      "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform " +
                      (field.value ? "translate-x-4" : "translate-x-0")
                    }
                  />
                </button>
              )}
            />
            <div>
              <Label className="cursor-pointer">Rollover</Label>
              <p className="text-xs text-muted-foreground">
                Acumular saldo no gastado al siguiente periodo
              </p>
            </div>
          </div>

          {/* Footer */}
          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isEditing ? "Actualizar" : "Crear"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
