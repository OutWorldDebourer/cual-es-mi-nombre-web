"use client";

import { useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Minus } from "lucide-react";
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
      transactionDate: transaction?.transaction_date?.slice(0, 10) ?? todayISO(),
      tags: transaction?.tags?.join(", ") ?? "",
    },
  });

  // Reset form values when modal opens or transaction changes
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

  const toggleType = useCallback(() => {
    const next = txType === "income" ? "expense" : "income";
    setValue("type", next);
    setValue("categoryId", "");
  }, [txType, setValue]);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
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
          className="space-y-4 py-2"
        >
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleType}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                txType === "expense"
                  ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-400"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              <Minus className="size-4" /> Gasto
            </button>
            <button
              type="button"
              onClick={toggleType}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                txType === "income"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              <Plus className="size-4" /> Ingreso
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-amount">Monto</Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <AmountInput
                  id="tx-amount"
                  value={field.value}
                  onChange={field.onChange}
                  variant={txType === "income" ? "income" : "expense"}
                  size="lg"
                />
              )}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <CategoryPills
              categories={filteredCategories}
              selected={selectedCategory || null}
              onSelect={(id) => setValue("categoryId", id ?? "")}
            />
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-desc">Descripción (opcional)</Label>
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

          {/* Account + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cuenta</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="tx-date">Fecha</Label>
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
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-tags">Tags (separados por coma)</Label>
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
              {isEditMode ? "Actualizar" : "Guardar"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
