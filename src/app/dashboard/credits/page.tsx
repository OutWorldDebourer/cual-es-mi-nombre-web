/**
 * Credits Page — "Cuál es mi nombre" Web Dashboard
 *
 * Server Component that fetches the user's credit balance and
 * transaction history. Renders CreditBalance and TransactionTable
 * client components.
 *
 * Route: /dashboard/credits
 *
 * @module app/dashboard/credits/page
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreditBalance } from "@/components/credits/credit-balance";
import { TransactionTable } from "@/components/credits/transaction-table";
import type { CreditTransaction, Profile } from "@/types/database";

export default async function CreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile for balance + plan + timezone
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits_remaining, credits_total, plan, timezone")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Pick<
    Profile,
    "credits_remaining" | "credits_total" | "plan" | "timezone"
  > | null;

  // Fetch recent transactions (first page)
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold">Créditos</h1>
        <p className="text-muted-foreground mt-1">
          Tu balance y historial de uso de créditos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Balance card */}
        <CreditBalance
          creditsRemaining={typedProfile?.credits_remaining ?? 0}
          creditsTotal={typedProfile?.credits_total ?? 0}
          plan={typedProfile?.plan ?? "free"}
        />

        {/* Transaction history */}
        <TransactionTable
          initialTransactions={
            (transactions as CreditTransaction[]) ?? []
          }
          timezone={typedProfile?.timezone}
        />
      </div>
    </div>
  );
}
