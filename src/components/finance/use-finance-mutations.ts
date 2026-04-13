"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type {
  TransactionType,
  TransactionSource,
} from "@/types/database";

// ── Input types ─────────────────────────────────────────────────────────────

interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  description: string | null;
  transactionDate: string;
  tags: string[];
  source?: TransactionSource;
}

interface UpdateTransactionInput {
  type?: TransactionType;
  amount?: number;
  category_id?: string | null;
  account_id?: string | null;
  description?: string | null;
  transaction_date?: string;
  tags?: string[];
}

interface CreateBudgetInput {
  categoryId: string | null;
  amountLimit: number | null;
  percentage: number | null;
  envelopeAssigned: number | null;
  period: string;
  rollover?: boolean;
}

interface UpdateBudgetInput {
  category_id?: string | null;
  amount_limit?: number | null;
  percentage?: number | null;
  envelope_assigned?: number | null;
  period?: string;
  rollover?: boolean;
  is_active?: boolean;
}

interface CreateAccountInput {
  name: string;
  type: string;
  currency: string;
  initialBalance: number;
}

interface CreateCategoryInput {
  name: string;
  icon: string | null;
  color: string | null;
  type: string;
}

interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string | null;
}

// ── Hook ────────────────────────────────────────────────────────────────────

/**
 * Centralized Supabase CRUD mutations for finance entities.
 * Each mutation shows a toast notification and calls `onSuccess` on completion.
 */
export function useFinanceMutations(onSuccess: () => void) {
  const createTransaction = useCallback(
    async (data: CreateTransactionInput) => {
      const supabase = createClient();
      const { error } = await supabase.from("finance_transactions").insert({
        type: data.type,
        amount: data.amount,
        category_id: data.categoryId,
        account_id: data.accountId,
        description: data.description,
        transaction_date: data.transactionDate,
        tags: data.tags,
        source: data.source ?? "web",
      });
      if (error) {
        toast.error("Error al crear movimiento");
        throw error;
      }
      toast.success("Movimiento registrado");
      onSuccess();
    },
    [onSuccess]
  );

  const updateTransaction = useCallback(
    async (id: string, data: UpdateTransactionInput) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("finance_transactions")
        .update(data)
        .eq("id", id);
      if (error) {
        toast.error("Error al actualizar movimiento");
        throw error;
      }
      toast.success("Movimiento actualizado");
      onSuccess();
    },
    [onSuccess]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("finance_transactions")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) {
        toast.error("Error al eliminar movimiento");
        throw error;
      }
      toast.success("Movimiento eliminado");
      onSuccess();
    },
    [onSuccess]
  );

  const createBudget = useCallback(
    async (data: CreateBudgetInput) => {
      const supabase = createClient();
      const { error } = await supabase.from("finance_budgets").insert({
        category_id: data.categoryId,
        amount_limit: data.amountLimit,
        percentage: data.percentage,
        envelope_assigned: data.envelopeAssigned,
        period: data.period,
        rollover: data.rollover ?? false,
      });
      if (error) {
        toast.error("Error al crear presupuesto");
        throw error;
      }
      toast.success("Presupuesto creado");
      onSuccess();
    },
    [onSuccess]
  );

  const updateBudget = useCallback(
    async (id: string, data: UpdateBudgetInput) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("finance_budgets")
        .update(data)
        .eq("id", id);
      if (error) {
        toast.error("Error al actualizar presupuesto");
        throw error;
      }
      toast.success("Presupuesto actualizado");
      onSuccess();
    },
    [onSuccess]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("finance_budgets")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error("Error al eliminar presupuesto");
        throw error;
      }
      toast.success("Presupuesto eliminado");
      onSuccess();
    },
    [onSuccess]
  );

  const createAccount = useCallback(
    async (data: CreateAccountInput) => {
      const supabase = createClient();
      const { error } = await supabase.from("finance_accounts").insert({
        name: data.name,
        type: data.type,
        currency: data.currency,
        initial_balance: data.initialBalance,
      });
      if (error) {
        toast.error("Error al crear cuenta");
        throw error;
      }
      toast.success("Cuenta creada");
      onSuccess();
    },
    [onSuccess]
  );

  const createCategory = useCallback(
    async (data: CreateCategoryInput) => {
      const supabase = createClient();
      const { error } = await supabase.from("finance_categories").insert({
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
      });
      if (error) {
        toast.error("Error al crear categoria");
        throw error;
      }
      toast.success("Categoria creada");
      onSuccess();
    },
    [onSuccess]
  );

  const updateCategory = useCallback(
    async (id: string, data: Partial<CreateCategoryInput>) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("finance_categories")
        .update(data)
        .eq("id", id);
      if (error) {
        toast.error("Error al actualizar categoria");
        throw error;
      }
      toast.success("Categoria actualizada");
      onSuccess();
    },
    [onSuccess]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("finance_categories")
        .delete()
        .eq("id", id);
      if (error) {
        toast.error("Error al eliminar categoria");
        throw error;
      }
      toast.success("Categoria eliminada");
      onSuccess();
    },
    [onSuccess]
  );

  const transferBetweenAccounts = useCallback(
    async (data: TransferInput) => {
      const supabase = createClient();
      const now = new Date().toISOString().slice(0, 10);

      // Two transactions: expense from source, income to destination
      const { error } = await supabase.from("finance_transactions").insert([
        {
          type: "expense" as const,
          amount: data.amount,
          account_id: data.fromAccountId,
          description: data.description ?? "Transferencia entre cuentas",
          transaction_date: now,
          tags: ["transferencia"],
          source: "web" as const,
        },
        {
          type: "income" as const,
          amount: data.amount,
          account_id: data.toAccountId,
          description: data.description ?? "Transferencia entre cuentas",
          transaction_date: now,
          tags: ["transferencia"],
          source: "web" as const,
        },
      ]);
      if (error) {
        toast.error("Error en la transferencia");
        throw error;
      }
      toast.success("Transferencia realizada");
      onSuccess();
    },
    [onSuccess]
  );

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
    createAccount,
    createCategory,
    updateCategory,
    deleteCategory,
    transferBetweenAccounts,
  } as const;
}
