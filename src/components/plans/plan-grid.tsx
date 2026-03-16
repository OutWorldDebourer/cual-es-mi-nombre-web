/**
 * Plan Grid Component — "Cuál es mi nombre" Web
 *
 * Client component that renders the plan cards and handles the
 * MercadoPago Checkout Pro redirect flow.
 *
 * @module components/plans/plan-grid
 */

"use client";

import { useCallback, useState } from "react";
import type { PlanInfo } from "@/types/database";
import { PlanCard } from "@/components/plans/plan-card";
import { backendApi, ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

interface PlanGridProps {
  plans: PlanInfo[];
  currentPlan: string;
  currencySymbol: string;
}

export function PlanGrid({
  plans,
  currentPlan,
  currencySymbol,
}: PlanGridProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlan = useCallback(async (planKey: string) => {
    setError(null);
    try {
      const supabase = createClient();
      const api = backendApi(supabase);
      const result = await api.payments.createPreference(planKey);

      // Redirect to MercadoPago Checkout Pro
      window.location.href = result.init_point;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
        {plans.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            currentPlan={currentPlan}
            currencySymbol={currencySymbol}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>
    </div>
  );
}
