"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Check, Banknote, Landmark, Wallet } from "lucide-react";
import type { FinanceCategory, IncomeType, AccountType } from "@/types/database";
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

// ── Schemas ─────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  incomeType: z.enum(["fixed", "variable", "mixed"]),
});

const accountSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  type: z.enum(["cash", "bank", "credit_card", "savings", "investment"]),
});

const step2Schema = z.object({
  accounts: z.array(accountSchema).min(1, "Agrega al menos una cuenta"),
});

const step3Schema = z.object({
  categoryIds: z.array(z.string()).min(1, "Selecciona al menos una categoria"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export interface OnboardingResult {
  incomeType: IncomeType;
  accounts: Array<{ name: string; type: AccountType }>;
  categoryIds: string[];
}

interface OnboardingWizardProps {
  open: boolean;
  onComplete: (result: OnboardingResult) => void;
  categories: FinanceCategory[];
}

// ── Income type options ─────────────────────────────────────────────────────

const INCOME_OPTIONS: Array<{ value: IncomeType; label: string; desc: string }> = [
  { value: "fixed", label: "Fijo", desc: "Sueldo fijo cada mes" },
  { value: "variable", label: "Variable", desc: "Freelance, comisiones, proyectos" },
  { value: "mixed", label: "Mixto", desc: "Base fija + ingresos variables" },
];

// ── Account type options ────────────────────────────────────────────────────

const ACCOUNT_OPTIONS: Array<{ value: AccountType; label: string; icon: typeof Wallet }> = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "bank", label: "Banco", icon: Landmark },
  { value: "savings", label: "Ahorros", icon: Wallet },
];

const STEPS = ["Tipo de ingreso", "Cuentas", "Categorias"] as const;

/** 3-step finance onboarding wizard with responsive dialog/drawer. */
export function OnboardingWizard({
  open,
  onComplete,
  categories,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  const handleNext = useCallback(() => setStep((s) => Math.min(s + 1, 2)), []);
  const handleBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const handleFinish = useCallback(
    (step3: Step3Data) => {
      if (!step1Data || !step2Data) return;
      onComplete({
        incomeType: step1Data.incomeType,
        accounts: step2Data.accounts,
        categoryIds: step3.categoryIds,
      });
    },
    [step1Data, step2Data, onComplete]
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={() => {}}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Configurar Finanzas</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Paso {step + 1} de 3 — {STEPS[step]}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[200px]">
          {step === 0 && (
            <Step1
              defaultValue={step1Data}
              onNext={(data) => {
                setStep1Data(data);
                handleNext();
              }}
            />
          )}
          {step === 1 && (
            <Step2
              defaultValue={step2Data}
              onNext={(data) => {
                setStep2Data(data);
                handleNext();
              }}
              onBack={handleBack}
            />
          )}
          {step === 2 && (
            <Step3
              categories={categories}
              onFinish={handleFinish}
              onBack={handleBack}
            />
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ── Step 1: Income Type ─────────────────────────────────────────────────────

function Step1({
  defaultValue,
  onNext,
}: {
  defaultValue: Step1Data | null;
  onNext: (data: Step1Data) => void;
}) {
  const { handleSubmit, watch, setValue } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { incomeType: defaultValue?.incomeType ?? "fixed" },
  });

  const selected = watch("incomeType");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Como recibes tus ingresos principales?
      </p>
      <div className="grid gap-2">
        {INCOME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setValue("incomeType", opt.value)}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-all",
              selected === opt.value
                ? "border-primary bg-primary/5 ring-1 ring-primary/30 dark:bg-primary/10"
                : "border-border hover:border-foreground/30 dark:border-input"
            )}
          >
            <span className="text-sm font-medium text-foreground">
              {opt.label}
            </span>
            <span className="text-xs text-muted-foreground">{opt.desc}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Siguiente <ChevronRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}

// ── Step 2: Accounts ────────────────────────────────────────────────────────

function Step2({
  defaultValue,
  onNext,
  onBack,
}: {
  defaultValue: Step2Data | null;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}) {
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      accounts: defaultValue?.accounts ?? [{ name: "Efectivo", type: "cash" as AccountType }],
    },
  });

  const accounts = watch("accounts");

  const addAccount = () => {
    setValue("accounts", [...accounts, { name: "", type: "bank" as AccountType }]);
  };

  const removeAccount = (idx: number) => {
    if (accounts.length <= 1) return;
    setValue("accounts", accounts.filter((_, i) => i !== idx));
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configura las cuentas donde manejas tu dinero.
      </p>

      <div className="space-y-3 max-h-48 overflow-y-auto">
        {accounts.map((acc, idx) => (
          <div key={idx} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Nombre</Label>
              <Controller
                control={control}
                name={`accounts.${idx}.name`}
                render={({ field }) => (
                  <Input {...field} placeholder="Mi cuenta" className="h-9 text-sm" />
                )}
              />
            </div>
            <div className="flex gap-1">
              {ACCOUNT_OPTIONS.map((opt) => {
                const OptIcon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue(`accounts.${idx}.type`, opt.value)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md border transition-all",
                      acc.type === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                    title={opt.label}
                  >
                    <OptIcon className="size-4" />
                  </button>
                );
              })}
            </div>
            {accounts.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => removeAccount(idx)}
                aria-label="Eliminar cuenta"
                className="text-muted-foreground hover:text-destructive"
              >
                &times;
              </Button>
            )}
          </div>
        ))}
      </div>

      {errors.accounts?.message && (
        <p className="text-xs text-destructive">{errors.accounts.message}</p>
      )}

      <Button type="button" variant="outline" size="xs" onClick={addAccount}>
        + Agregar cuenta
      </Button>

      <ResponsiveDialogFooter>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="size-4" /> Atras
        </Button>
        <Button type="submit" size="sm">
          Siguiente <ChevronRight className="size-4" />
        </Button>
      </ResponsiveDialogFooter>
    </form>
  );
}

// ── Step 3: Favorite Categories ─────────────────────────────────────────────

function Step3({
  categories,
  onFinish,
  onBack,
}: {
  categories: FinanceCategory[];
  onFinish: (data: Step3Data) => void;
  onBack: () => void;
}) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { categoryIds: [] },
  });

  const selectedIds = watch("categoryIds");

  const toggleCategory = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((cid) => cid !== id)
      : [...selectedIds, id];
    setValue("categoryIds", next);
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <form onSubmit={handleSubmit(onFinish)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Elige las categorias que mas usas para acceso rapido.
      </p>

      {incomeCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Ingresos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {incomeCategories.map((cat) => (
              <CategoryToggle
                key={cat.id}
                category={cat}
                isSelected={selectedIds.includes(cat.id)}
                onToggle={() => toggleCategory(cat.id)}
              />
            ))}
          </div>
        </div>
      )}

      {expenseCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Gastos
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {expenseCategories.map((cat) => (
              <CategoryToggle
                key={cat.id}
                category={cat}
                isSelected={selectedIds.includes(cat.id)}
                onToggle={() => toggleCategory(cat.id)}
              />
            ))}
          </div>
        </div>
      )}

      {errors.categoryIds?.message && (
        <p className="text-xs text-destructive">{errors.categoryIds.message}</p>
      )}

      <ResponsiveDialogFooter>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="size-4" /> Atras
        </Button>
        <Button type="submit" size="sm">
          <Check className="size-4" /> Finalizar
        </Button>
      </ResponsiveDialogFooter>
    </form>
  );
}

// ── Category toggle pill ────────────────────────────────────────────────────

function CategoryToggle({
  category,
  isSelected,
  onToggle,
}: {
  category: FinanceCategory;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
        isSelected
          ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
      aria-pressed={isSelected}
    >
      {category.icon && <span>{category.icon}</span>}
      {category.color && !category.icon && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: category.color }}
        />
      )}
      {category.name}
    </button>
  );
}
