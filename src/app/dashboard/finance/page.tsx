/**
 * Finance Page — Server Component
 *
 * Fetches finance profile, transactions, categories, accounts, and budgets
 * from Supabase (with RLS) and passes them to the FinanceDashboard client
 * component. Shows onboarding wizard when no profile exists.
 *
 * Route: /dashboard/finance
 *
 * @module app/dashboard/finance/page
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import type {
  FinanceProfile,
  FinanceTransaction,
  FinanceCategory,
  FinanceAccount,
  FinanceBudget,
} from "@/types/database";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parallel data fetching for performance
  const [profileRes, transactionsRes, categoriesRes, accountsRes, budgetsRes, userProfileRes] =
    await Promise.all([
      supabase
        .from("finance_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle(),
      supabase
        .from("finance_transactions")
        .select("*")
        .is("deleted_at", null)
        .order("transaction_date", { ascending: false })
        .limit(15),
      supabase.from("finance_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("finance_accounts").select("*").order("created_at", { ascending: true }),
      supabase
        .from("finance_budgets")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("timezone").eq("id", user.id).single(),
    ]);

  const profile = (profileRes.data as FinanceProfile) ?? null;
  const transactions = (transactionsRes.data as FinanceTransaction[]) ?? [];
  const categories = (categoriesRes.data as FinanceCategory[]) ?? [];
  const accounts = (accountsRes.data as FinanceAccount[]) ?? [];
  const budgets = (budgetsRes.data as FinanceBudget[]) ?? [];
  const timezone = userProfileRes.data?.timezone ?? "America/Lima";

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
        <p className="text-muted-foreground mt-1">
          Controla tus ingresos, gastos y presupuestos.
        </p>
      </div>
      <FinanceDashboard
        profile={profile}
        transactions={transactions}
        categories={categories}
        accounts={accounts}
        budgets={budgets}
        timezone={timezone}
        initialTab={params.tab}
      />
    </div>
  );
}
