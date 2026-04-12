"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  AlertTriangle,
  DollarSign,
  PiggyBank,
  Wallet,
  Settings,
} from "lucide-react";
import type {
  FinanceProfile,
  FinanceCategory,
  IncomeType,
  IncomePeriod,
  SavingsGoalType,
  BudgetMode,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AmountInput } from "@/components/finance/shared/amount-input";

// ── Schema ─────────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  incomeType: z.enum(["fixed", "variable", "mixed"]),
  incomePeriod: z.enum(["daily", "weekly", "biweekly", "monthly", "project"]),
  fixedIncomeAmount: z.string().optional(),
  payDay: z.string().optional(),
  savingsGoalType: z.enum(["none", "percentage", "fixed_amount"]),
  savingsGoalValue: z.string().optional(),
  budgetMode: z.enum(["fixed", "percentage", "envelope"]),
  defaultCurrency: z.string().min(1),
});

type SettingsForm = z.infer<typeof settingsSchema>;

// ── Option definitions ─────────────────────────────────────────────────────

const INCOME_TYPE_OPTIONS: Array<{ value: IncomeType; label: string; desc: string }> = [
  { value: "fixed", label: "Fijo", desc: "Sueldo fijo cada periodo" },
  { value: "variable", label: "Variable", desc: "Freelance, comisiones" },
  { value: "mixed", label: "Mixto", desc: "Base fija + variable" },
];

const INCOME_PERIOD_OPTIONS: Array<{ value: IncomePeriod; label: string }> = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "project", label: "Por proyecto" },
];

const SAVINGS_GOAL_OPTIONS: Array<{ value: SavingsGoalType; label: string; desc: string }> = [
  { value: "none", label: "Sin meta", desc: "No definir meta de ahorro" },
  { value: "percentage", label: "Porcentaje", desc: "% de ingresos a ahorrar" },
  { value: "fixed_amount", label: "Monto fijo", desc: "Cantidad fija a ahorrar" },
];

const BUDGET_MODE_OPTIONS: Array<{ value: BudgetMode; label: string; desc: string }> = [
  {
    value: "fixed",
    label: "Fijo",
    desc: "Monto maximo fijo por categoria",
  },
  {
    value: "percentage",
    label: "Porcentaje",
    desc: "% del ingreso por categoria",
  },
  {
    value: "envelope",
    label: "Sobres",
    desc: "Asignar dinero en sobres virtuales",
  },
];

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "PEN (S/)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (\u20AC)" },
];

// ── Props ──────────────────────────────────────────────────────────────────

interface SettingsTabProps {
  profile: FinanceProfile;
  categories: FinanceCategory[];
  onProfileUpdate: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

/** Finance profile settings: income, savings, budget mode, currency, and danger zone. */
export function SettingsTab({
  profile,
  categories,
  onProfileUpdate,
}: SettingsTabProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      incomeType: profile.income_type,
      incomePeriod: profile.income_period,
      fixedIncomeAmount: profile.fixed_income_amount?.toString() ?? "",
      payDay: profile.pay_day?.toString() ?? "",
      savingsGoalType: profile.savings_goal_type,
      savingsGoalValue: profile.savings_goal_value?.toString() ?? "",
      budgetMode: profile.budget_mode,
      defaultCurrency: profile.default_currency,
    },
  });

  const watchIncomeType = watch("incomeType");
  const watchSavingsGoalType = watch("savingsGoalType");

  const onSubmit = useCallback(
    async (data: SettingsForm) => {
      setIsSaving(true);
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const updateData: Partial<FinanceProfile> = {
          income_type: data.incomeType,
          income_period: data.incomePeriod,
          fixed_income_amount: data.fixedIncomeAmount
            ? parseFloat(data.fixedIncomeAmount)
            : null,
          pay_day: data.payDay ? parseInt(data.payDay, 10) : null,
          savings_goal_type: data.savingsGoalType,
          savings_goal_value: data.savingsGoalValue
            ? parseFloat(data.savingsGoalValue)
            : null,
          budget_mode: data.budgetMode,
          default_currency: data.defaultCurrency,
        };
        await supabase
          .from("finance_profiles")
          .update(updateData)
          .eq("profile_id", profile.profile_id);
        onProfileUpdate();
      } finally {
        setIsSaving(false);
      }
    },
    [onProfileUpdate, profile.profile_id],
  );

  const handleDeleteAllData = useCallback(() => {
    setShowDeleteConfirm(false);
    // TODO: call API to delete all financial data
  }, []);

  // Suppress unused variable warning
  void categories;
  void showDeleteConfirm;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Income profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-sm">Perfil de ingresos</CardTitle>
          </div>
          <CardDescription>Como y cuando recibes tu dinero</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Income type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Tipo de ingreso</Label>
            <div className="grid gap-2">
              {INCOME_TYPE_OPTIONS.map((opt) => (
                <RadioCard
                  key={opt.value}
                  label={opt.label}
                  description={opt.desc}
                  isSelected={watchIncomeType === opt.value}
                  onClick={() => setValue("incomeType", opt.value, { shouldDirty: true })}
                />
              ))}
            </div>
          </div>

          {/* Income amount (shown for fixed/mixed) */}
          {(watchIncomeType === "fixed" || watchIncomeType === "mixed") && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Monto de ingreso</Label>
              <Controller
                control={control}
                name="fixedIncomeAmount"
                render={({ field }) => (
                  <AmountInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    variant="income"
                    size="sm"
                  />
                )}
              />
            </div>
          )}

          {/* Income period */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Periodo de ingreso</Label>
            <Controller
              control={control}
              name="incomePeriod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_PERIOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Pay day */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Dia de pago (1-31)</Label>
            <Controller
              control={control}
              name="payDay"
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={31}
                  placeholder="15"
                  className="h-9 w-24 text-sm"
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Savings goal */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PiggyBank className="size-4 text-amber-600 dark:text-amber-400" />
            <CardTitle className="text-sm">Meta de ahorro</CardTitle>
          </div>
          <CardDescription>Cuanto quieres ahorrar cada periodo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {SAVINGS_GOAL_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.value}
                label={opt.label}
                description={opt.desc}
                isSelected={watchSavingsGoalType === opt.value}
                onClick={() => setValue("savingsGoalType", opt.value, { shouldDirty: true })}
              />
            ))}
          </div>

          {watchSavingsGoalType !== "none" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {watchSavingsGoalType === "percentage" ? "Porcentaje (%)" : "Monto (S/)"}
              </Label>
              <Controller
                control={control}
                name="savingsGoalValue"
                render={({ field }) =>
                  watchSavingsGoalType === "percentage" ? (
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      max={100}
                      placeholder="20"
                      className="h-9 w-24 text-sm"
                    />
                  ) : (
                    <AmountInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      size="sm"
                    />
                  )
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-sm">Modo de presupuesto</CardTitle>
          </div>
          <CardDescription>Como distribuyes tu dinero</CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            name="budgetMode"
            render={({ field }) => (
              <div className="grid gap-2">
                {BUDGET_MODE_OPTIONS.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    label={opt.label}
                    description={opt.desc}
                    isSelected={field.value === opt.value}
                    onClick={() => setValue("budgetMode", opt.value, { shouldDirty: true })}
                  />
                ))}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm">Moneda predeterminada</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            name="defaultCurrency"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-9 w-40 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || isSaving} size="sm">
          <Save className="size-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {/* Form errors summary */}
      {Object.keys(errors).length > 0 && (
        <p className="text-xs text-destructive">
          Corrige los errores antes de guardar.
        </p>
      )}

      {/* Danger zone */}
      <DangerZone onConfirmDelete={handleDeleteAllData} />
    </form>
  );
}

// ── Radio card (custom radio button) ───────────────────────────────────────

function RadioCard({
  label,
  description,
  isSelected,
  onClick,
}: {
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30 dark:bg-primary/10"
          : "border-border hover:border-foreground/30 dark:border-input",
      )}
      aria-pressed={isSelected}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

// ── Danger zone ────────────────────────────────────────────────────────────

function DangerZone({ onConfirmDelete }: { onConfirmDelete: () => void }) {
  return (
    <Card className="border-red-300 dark:border-red-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
          <CardTitle className="text-sm text-red-600 dark:text-red-400">
            Zona de peligro
          </CardTitle>
        </div>
        <CardDescription>Acciones irreversibles sobre tus datos</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Borrar todos mis datos financieros
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar datos financieros</AlertDialogTitle>
              <AlertDialogDescription>
                Esta accion eliminara permanentemente todos tus movimientos,
                cuentas, presupuestos y categorias personalizadas. Las categorias
                del sistema se mantendran. Esta accion no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirmDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Si, borrar todo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
