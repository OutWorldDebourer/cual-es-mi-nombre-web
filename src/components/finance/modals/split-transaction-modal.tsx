"use client";

import { useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import type { FinanceCategory } from "@/types/database";
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
import { CategoryPills } from "@/components/finance/shared/category-pills";

// ── Schema ──────────────────────────────────────────────────────────────────

const splitItemSchema = z.object({
  amount: z.string().min(1, "Monto requerido").refine((v) => parseFloat(v) > 0, {
    message: "Monto debe ser mayor a 0",
  }),
  categoryId: z.string().min(1, "Categoria requerida"),
  description: z.string().optional(),
});

const splitSchema = z
  .object({
    totalAmount: z.string().min(1, "Total requerido").refine((v) => parseFloat(v) > 0, {
      message: "Total debe ser mayor a 0",
    }),
    items: z.array(splitItemSchema).min(2, "Minimo 2 divisiones"),
  })
  .refine(
    (data) => {
      const total = parseFloat(data.totalAmount) || 0;
      const sum = data.items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
      return Math.abs(total - sum) < 0.01;
    },
    { message: "Suma de items debe ser igual al total", path: ["items"] }
  );

type SplitFormData = z.infer<typeof splitSchema>;

export interface SplitItem {
  amount: number;
  categoryId: string;
  description: string | null;
}

export interface SplitTransactionData {
  totalAmount: number;
  items: SplitItem[];
}

interface SplitTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: FinanceCategory[];
  onSubmit: (data: SplitTransactionData) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

/** Modal for splitting a single expense into multiple category-assigned items. */
export function SplitTransactionModal({
  open,
  onOpenChange,
  categories,
  onSubmit,
}: SplitTransactionModalProps) {
  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SplitFormData>({
    resolver: zodResolver(splitSchema),
    defaultValues: {
      totalAmount: "",
      items: [
        { amount: "", categoryId: "", description: "" },
        { amount: "", categoryId: "", description: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const totalAmount = parseFloat(watch("totalAmount") || "0");
  const items = watch("items");
  const itemsSum = items.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
  const remaining = totalAmount - itemsSum;

  const expenseCategories = categories.filter(
    (c) => c.type === "expense" || c.type === "transfer"
  );

  const handleFormSubmit = useCallback(
    (data: SplitFormData) => {
      onSubmit({
        totalAmount: parseFloat(data.totalAmount),
        items: data.items.map((item) => ({
          amount: parseFloat(item.amount),
          categoryId: item.categoryId,
          description: item.description || null,
        })),
      });
      reset();
      onOpenChange(false);
    },
    [onSubmit, reset, onOpenChange]
  );

  const addItem = useCallback(() => {
    append({ amount: "", categoryId: "", description: "" });
  }, [append]);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Dividir gasto</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Divide un monto total entre varias categorias.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          {/* Total amount */}
          <div className="space-y-1.5">
            <Label htmlFor="split-total">Monto total</Label>
            <Controller
              control={control}
              name="totalAmount"
              render={({ field }) => (
                <AmountInput
                  id="split-total"
                  value={field.value}
                  onChange={field.onChange}
                  variant="expense"
                  size="lg"
                />
              )}
            />
            {errors.totalAmount && (
              <p className="text-xs text-destructive">{errors.totalAmount.message}</p>
            )}
          </div>

          {/* Remaining indicator */}
          {totalAmount > 0 && (
            <div
              className={cn(
                "text-xs font-medium tabular-nums",
                Math.abs(remaining) < 0.01
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              )}
            >
              {Math.abs(remaining) < 0.01
                ? "Monto cuadrado"
                : remaining > 0
                  ? `Faltan S/ ${remaining.toFixed(2)}`
                  : `Exceso S/ ${Math.abs(remaining).toFixed(2)}`}
            </div>
          )}

          {/* Split items */}
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {fields.map((field, idx) => (
              <div key={field.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Item {idx + 1}
                  </span>
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => remove(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>

                <Controller
                  control={control}
                  name={`items.${idx}.amount`}
                  render={({ field: f }) => (
                    <AmountInput
                      value={f.value}
                      onChange={f.onChange}
                      variant="expense"
                      size="sm"
                    />
                  )}
                />
                {errors.items?.[idx]?.amount && (
                  <p className="text-xs text-destructive">
                    {errors.items[idx].amount?.message}
                  </p>
                )}

                <Controller
                  control={control}
                  name={`items.${idx}.categoryId`}
                  render={({ field: f }) => (
                    <CategoryPills
                      categories={expenseCategories}
                      selected={f.value || null}
                      onSelect={(id) => f.onChange(id ?? "")}
                      maxVisible={4}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`items.${idx}.description`}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      placeholder="Descripcion (opcional)"
                      className="h-8 text-xs"
                    />
                  )}
                />
              </div>
            ))}
          </div>

          {/* Root items error */}
          {errors.items?.root && (
            <p className="text-xs text-destructive">{errors.items.root.message}</p>
          )}

          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={addItem}
            className="gap-1"
          >
            <Plus className="size-3.5" /> Agregar item
          </Button>

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
              Guardar
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
