"use client";

import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AccountType } from "@/types/database";
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

const accountSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(60, "Maximo 60 caracteres"),
  type: z.enum(["cash", "bank", "credit_card", "savings", "investment"]),
  currency: z.enum(["PEN", "USD", "EUR"]),
  initialBalance: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

export interface CreateAccountData {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
}

interface CreateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAccountData) => void;
}

// ── Options ─────────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_OPTIONS: Array<{ value: AccountType; label: string }> = [
  { value: "cash", label: "Efectivo" },
  { value: "bank", label: "Banco" },
  { value: "credit_card", label: "Tarjeta de credito" },
  { value: "savings", label: "Ahorros" },
  { value: "investment", label: "Inversion" },
];

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "PEN (S/)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
] as const;

const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: "S/",
  USD: "$",
  EUR: "€",
};

// ── Component ───────────────────────────────────────────────────────────────

/** Modal for creating a new financial account. */
export function CreateAccountModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateAccountModalProps) {
  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "bank",
      currency: "PEN",
      initialBalance: "0",
    },
  });

  const selectedCurrency = watch("currency");
  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] ?? "S/";

  const handleFormSubmit = useCallback(
    (data: AccountFormData) => {
      onSubmit({
        name: data.name,
        type: data.type as AccountType,
        currency: data.currency,
        initialBalance: parseFloat(data.initialBalance || "0"),
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
          <ResponsiveDialogTitle>Nueva cuenta</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Agrega una cuenta donde manejas tu dinero.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="acc-name">Nombre</Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  id="acc-name"
                  {...field}
                  placeholder="Ej: Cuenta BCP"
                  className="h-9 text-sm"
                />
              )}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Tipo de cuenta</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <Label>Moneda</Label>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar" />
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
          </div>

          {/* Initial balance */}
          <div className="space-y-1.5">
            <Label htmlFor="acc-balance">Saldo inicial</Label>
            <Controller
              control={control}
              name="initialBalance"
              render={({ field }) => (
                <AmountInput
                  id="acc-balance"
                  value={field.value ?? "0"}
                  onChange={field.onChange}
                  currency={currencySymbol}
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
              Crear cuenta
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
