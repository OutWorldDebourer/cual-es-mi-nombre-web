"use client";

import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import type { FinanceAccount } from "@/types/database";
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

const transferSchema = z
  .object({
    fromAccountId: z.string().min(1, "Cuenta origen requerida"),
    toAccountId: z.string().min(1, "Cuenta destino requerida"),
    amount: z.string().min(1, "Monto requerido").refine((v) => parseFloat(v) > 0, {
      message: "Monto debe ser mayor a 0",
    }),
    description: z.string().optional(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Origen y destino deben ser diferentes",
    path: ["toAccountId"],
  });

type TransferFormData = z.infer<typeof transferSchema>;

export interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string | null;
}

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: FinanceAccount[];
  onSubmit: (data: TransferData) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

/** Modal for transferring money between accounts. */
export function TransferModal({
  open,
  onOpenChange,
  accounts,
  onSubmit,
}: TransferModalProps) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: accounts[0]?.id ?? "",
      toAccountId: accounts[1]?.id ?? "",
      amount: "",
      description: "",
    },
  });

  const handleFormSubmit = useCallback(
    (data: TransferFormData) => {
      onSubmit({
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: parseFloat(data.amount),
        description: data.description || null,
      });
      reset();
      onOpenChange(false);
    },
    [onSubmit, reset, onOpenChange]
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Transferir entre cuentas</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Mueve dinero de una cuenta a otra.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          {/* From → To accounts */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label>Origen</Label>
              <Controller
                control={control}
                name="fromAccountId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Cuenta origen" />
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
              {errors.fromAccountId && (
                <p className="text-xs text-destructive">
                  {errors.fromAccountId.message}
                </p>
              )}
            </div>

            <ArrowRight className="mb-2 size-4 shrink-0 text-muted-foreground" />

            <div className="flex-1 space-y-1.5">
              <Label>Destino</Label>
              <Controller
                control={control}
                name="toAccountId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Cuenta destino" />
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
              {errors.toAccountId && (
                <p className="text-xs text-destructive">
                  {errors.toAccountId.message}
                </p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="xfer-amount">Monto</Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <AmountInput
                  id="xfer-amount"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="xfer-desc">Descripcion (opcional)</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <Input
                  id="xfer-desc"
                  {...field}
                  placeholder="Ej: Pase a ahorros"
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
              Transferir
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
