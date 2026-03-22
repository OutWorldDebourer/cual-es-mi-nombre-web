/**
 * Plans Page — "Cuál es mi nombre" Web Dashboard
 *
 * Server Component that fetches the plan catalog from the backend
 * and the user's current plan from Supabase. Renders the PlanGrid
 * client component which handles the MercadoPago checkout flow.
 *
 * Route: /dashboard/plans
 *
 * @module app/dashboard/plans/page
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlans } from "@/lib/api";
import { PlanGrid } from "@/components/plans/plan-grid";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";

export default async function PlansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch current plan from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const currentPlan: SubscriptionPlan = (profile?.plan as SubscriptionPlan) ?? "free";

  // Fetch subscription status for cancel button / grace banner
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, cancelled_at, current_period_end")
    .eq("profile_id", user.id)
    .in("status", ["active", "cancelled", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subscriptionStatus = (subscription?.status as SubscriptionStatus) ?? null;
  const cancelledAt = (subscription?.cancelled_at as string) ?? null;

  // Fetch plan catalog from backend API
  let plans;
  let currencySymbol = "S/";
  try {
    const catalog = await getPlans();
    plans = catalog.plans;
    currencySymbol = catalog.currency_symbol;
  } catch {
    // Fallback: static plan data if backend is unreachable
    plans = [
      {
        key: "free",
        label: "Gratuito",
        price_pen: 0,
        credits_per_month: 0,
        description: "Prueba el asistente sin compromiso",
        features: ["Acceso limitado al asistente"],
        badge: "",
        is_highlighted: false,
      },
      {
        key: "basic",
        label: "Básico",
        price_pen: 19.9,
        credits_per_month: 300,
        description: "Ideal para uso personal del día a día",
        features: [
          "300 créditos/mes",
          "Notas y recordatorios",
          "Soporte por WhatsApp",
        ],
        badge: "",
        is_highlighted: false,
      },
      {
        key: "pro",
        label: "Pro",
        price_pen: 39.9,
        credits_per_month: 1000,
        description: "Para quienes quieren el máximo provecho",
        features: [
          "1,000 créditos/mes",
          "Google Calendar",
          "Prioridad en soporte",
          "Audio transcription",
        ],
        badge: "Popular",
        is_highlighted: true,
      },
      {
        key: "premium",
        label: "Premium",
        price_pen: 69.9,
        credits_per_month: 3000,
        description: "Sin límites, para power users",
        features: [
          "3,000 créditos/mes",
          "Todas las funciones Pro",
          "Soporte prioritario",
          "Acceso anticipado a nuevas funciones",
        ],
        badge: "",
        is_highlighted: false,
      },
    ];
  }

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold">Planes</h1>
        <p className="text-muted-foreground mt-1">
          Elige el plan que mejor se adapte a tus necesidades.
        </p>
      </div>

      <PlanGrid
        plans={plans}
        currentPlan={currentPlan}
        currencySymbol={currencySymbol}
        subscriptionStatus={subscriptionStatus}
        cancelledAt={cancelledAt}
      />
    </div>
  );
}
