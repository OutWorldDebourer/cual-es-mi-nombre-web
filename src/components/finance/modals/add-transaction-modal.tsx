"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import type {
  FinanceCategory,
  FinanceAccount,
  FinanceTransaction,
  TransactionType,
} from "@/types/database";
import { cn } from "@/lib/utils";
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
import { CategoryPills } from "@/components/finance/shared/category-pills";

// ── Schema ──────────────────────────────────────────────────────────────────

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Monto requerido").refine((v) => parseFloat(v) > 0, {
    message: "Monto debe ser mayor a 0",
  }),
  categoryId: z.string().min(1, "Categoría requerida"),
  description: z.string().optional(),
  accountId: z.string().min(1, "Cuenta requerida"),
  transactionDate: z.string().min(1, "Fecha requerida"),
  tags: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export interface AddTransactionData {
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string | null;
  accountId: string;
  transactionDate: string;
  tags: string[];
}

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: FinanceCategory[];
  accounts: FinanceAccount[];
  onSubmit: (data: AddTransactionData) => void;
  /** When provided, modal enters edit mode with pre-filled values. */
  transaction?: FinanceTransaction | null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// ── Type pill config ────────────────────────────────────────────────────────

const TYPE_PILLS: Array<{
  value: "expense" | "income";
  label: string;
  activeClass: string;
}> = [
  {
    value: "expense",
    label: "Gasto",
    activeClass: "bg-red-500/20 text-red-500",
  },
  {
    value: "income",
    label: "Ingreso",
    activeClass: "bg-[#00da00]/15 text-[#00da00]",
  },
];

// ── Component ───────────────────────────────────────────────────────────────

/** Modal for adding a new income/expense transaction. */
export function AddTransactionModal({
  open,
  onOpenChange,
  categories,
  accounts,
  onSubmit,
  transaction,
}: AddTransactionModalProps) {
  const isEditMode = !!transaction;

  // Recurring toggle — UI-only for now (backend support comes later)
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState("monthly");

  // TransactionType includes "transfer" but this form only handles income/expense
  const resolveFormType = (t?: string | null): "income" | "expense" =>
    t === "income" ? "income" : "expense";

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: resolveFormType(transaction?.type),
      amount: transaction ? String(transaction.amount) : "",
      categoryId: transaction?.category_id ?? "",
      description: transaction?.description ?? "",
      accountId: transaction?.account_id ?? accounts[0]?.id ?? "",
      // Fix hydration: initialize empty, set via useEffect on client
      transactionDate: "",
      tags: transaction?.tags?.join(", ") ?? "",
    },
  });

  // Reset form values when modal opens or transaction changes
  // Also sets transactionDate on client to avoid SSR/client mismatch (React #418)
  useEffect(() => {
    if (open) {
      reset({
        type: resolveFormType(transaction?.type),
        amount: transaction ? String(transaction.amount) : "",
        categoryId: transaction?.category_id ?? "",
        description: transaction?.description ?? "",
        accountId: transaction?.account_id ?? accounts[0]?.id ?? "",
        transactionDate: transaction?.transaction_date?.slice(0, 10) ?? todayISO(),
        tags: transaction?.tags?.join(", ") ?? "",
      });
      setIsRecurring(false);
      setRecurrenceFreq("monthly");
    }
  }, [open, transaction, accounts, reset]);

  const txType = watch("type");
  const selectedCategory = watch("categoryId");

  const filteredCategories = categories.filter(
    (c) => c.type === txType || c.type === "transfer"
  );

  const handleFormSubmit = useCallback(
    (data: TransactionFormData) => {
      onSubmit({
        type: data.type as TransactionType,
        amount: parseFloat(data.amount),
        categoryId: data.categoryId,
        description: data.description || null,
        accountId: data.accountId,
        transactionDate: data.transactionDate,
        tags: parseTags(data.tags),
      });
      reset();
      onOpenChange(false);
    },
    [onSubmit, reset, onOpenChange]
  );

  const selectType = useCallback(
    (next: "income" | "expense") => {
      if (next !== txType) {
        setValue("type", next);
        setValue("categoryId", "");
      }
    },
    [txType, setValue]
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent
        className="sm:max-w-[520px]"
        onOpenAutoFocus={(e) => {
          const amountInput = e.currentTarget.querySelector<HTMLInputElement>("#tx-amount");
          if (amountInput) {
            e.preventDefault();
            amountInput.focus();
            amountInput.select();
          }
        }}
      >
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEditMode ? "Editar movimiento" : "Nuevo movimiento"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {isEditMode
              ? "Modifica los datos del movimiento."
              : "Registra un ingreso o gasto manualmente."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5 py-2"
        >
          {/* ── Type pills ── */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Tipo
            </Label>
            <div className="flex gap-1 rounded-[10px] bg-secondary p-[3px]">
              {TYPE_PILLS.map(({ value, label, activeClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectType(value)}
                  className={cn(
                    "flex-1 rounded-lg py-2 px-3 text-sm font-medium transition-all",
                    "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    txType === value
                      ? activeClass
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Amount ── */}
          <div className="space-y-2">
            <Label
              htmlFor="tx-amount"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Monto
            </Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <AmountInput
                  id="tx-amount"
                  value={field.value}
                  onChange={field.onChange}
                  size="lg"
                  className="!text-2xl !font-bold"
                />
              )}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* ── Category ── */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Categoría
            </Label>
            <CategoryPills
              categories={filteredCategories}
              selected={selectedCategory || null}
              onSelect={(id) => setValue("categoryId", id ?? "")}
            />
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* ── Description ── */}
          <div className="space-y-2">
            <Label
              htmlFor="tx-desc"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Descripción / Nota
            </Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input
                  id="tx-desc"
                  {...field}
                  placeholder="Almuerzo, taxi, etc."
                  className="h-9 text-sm"
                />
              )}
            />
          </div>

          {/* ── Date + Account row ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Fecha
              </Label>
              <Controller
                control={control}
                name="transactionDate"
                render={({ field }) => (
                  <Input
                    id="tx-date"
                    type="date"
                    {...field}
                    className="h-9 text-sm"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Cuenta
              </Label>
              <Controller
                control={control}
                name="accountId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.accountId && (
                <p className="text-xs text-destructive">{errors.accountId.message}</p>
              )}
            </div>
          </div>

          {/* ── Recurring toggle ── */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isRecurring}
              onClick={() => setIsRecurring(!isRecurring)}
              className={cn(
                "relative h-5 w-10 shrink-0 cursor-pointer rounded-full transition-colors",
                isRecurring ? "bg-[#ff5600]" : "bg-secondary border border-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform",
                  isRecurring && "translate-x-5"
                )}
              />
            </button>
            <span className="text-sm font-medium">Recurrente</span>
            {isRecurring && (
              <Select value={recurrenceFreq} onValueChange={setRecurrenceFreq}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* ── Tags ── */}
          <div className="space-y-1">
            <Label
              htmlFor="tx-tags"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Tags
            </Label>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <Input
                  id="tx-tags"
                  {...field}
                  placeholder="comida, trabajo"
                  className="h-9 text-sm"
                />
              )}
            />
            <p className="text-[11px] text-muted-foreground">Separa con comas</p>
          </div>

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
              <Check className="mr-1.5 size-4" />
              {isEditMode ? "Actualizar" : "Guardar"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
