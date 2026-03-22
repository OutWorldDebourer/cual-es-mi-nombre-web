/**
 * Plan Grid Component — "Cuál es mi nombre" Web
 *
 * Client component that renders the plan cards and handles the
 * MercadoPago Checkout Pro redirect flow. Also shows subscription
 * status (cancel button, grace period banner).
 *
 * @module components/plans/plan-grid
 */

"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { PlanInfo, SubscriptionStatus } from "@/types/database";
import { PlanCard } from "@/components/plans/plan-card";
import { CancelSubscriptionDialog } from "@/components/plans/cancel-subscription-dialog";
import { backendApi, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

interface PlanGridProps {
  plans: PlanInfo[];
  currentPlan: string;
  currencySymbol: string;
  subscriptionStatus?: SubscriptionStatus | null;
  cancelledAt?: string | null;
}

const GRACE_PERIOD_DAYS = 3;

/** Calculate days remaining from a cancelled_at date + grace period. */
function graceDaysRemaining(cancelledAt: string): number {
  const cancelled = new Date(cancelledAt);
  const graceEnd = new Date(cancelled.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = graceEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export function PlanGrid({
  plans,
  currentPlan,
  currencySymbol,
  subscriptionStatus,
  cancelledAt,
}: PlanGridProps) {
  const handleSelectPlan = useCallback(async (planKey: string) => {
    try {
      const supabase = createClient();
      const api = backendApi(supabase);
      const result = await api.payments.createPreference(planKey);

      // Redirect to MercadoPago Checkout Pro
      window.location.href = result.init_point;
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.detail);
      } else {
        toast.error("Error inesperado. Intenta de nuevo.");
      }
    }
  }, []);

  const showCancelButton = subscriptionStatus === "active" || subscriptionStatus === "past_due";
  const showGraceBanner = subscriptionStatus === "cancelled" && cancelledAt;
  const daysLeft = cancelledAt ? graceDaysRemaining(cancelledAt) : 0;

  return (
    <div className="space-y-6">
      {/* Grace period banner */}
      {showGraceBanner && (
        <div className="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">
            Tu suscripción fue cancelada
          </p>
          <p className="mt-1 text-amber-700 dark:text-amber-300">
            {daysLeft > 0
              ? `Mantienes el acceso por ${daysLeft} día${daysLeft !== 1 ? "s" : ""} más como período de gracia.`
              : "Tu período de gracia está por finalizar."}
            {" "}Puedes elegir un plan nuevo en cualquier momento.
          </p>
        </div>
      )}

      {/* Plan cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            currentPlan={currentPlan}
            currencySymbol={currencySymbol}
            index={index}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>

      {/* Cancel subscription section */}
      {showCancelButton && (
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
          <div className="text-sm">
            <p className="font-medium">¿Deseas cancelar tu suscripción?</p>
            <p className="text-muted-foreground">
              Mantendrás el acceso durante {GRACE_PERIOD_DAYS} días después de cancelar.
            </p>
          </div>
          <CancelSubscriptionDialog />
        </div>
      )}
    </div>
  );
}
