/**
 * Credit Balance Component — "Cuál es mi nombre" Web
 *
 * Displays the user's current credit balance in a prominent card
 * with plan info and a CTA to upgrade if on a lower plan.
 *
 * @module components/credits/credit-balance
 */

"use client";

import Link from "next/link";
import type { SubscriptionPlan } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CreditBalanceProps {
  creditsRemaining: number;
  creditsTotal: number;
  plan: SubscriptionPlan;
}

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  free: 0,
  basic: 300,
  pro: 1000,
  premium: 3000,
};

export function CreditBalance({
  creditsRemaining,
  creditsTotal,
  plan,
}: CreditBalanceProps) {
  const maxCredits = PLAN_LIMITS[plan] || creditsTotal;
  const usagePercent =
    maxCredits > 0 ? Math.round((creditsRemaining / maxCredits) * 100) : 0;
  const isLow = usagePercent < 20;
  const canUpgrade = plan !== "premium";

  return (
    <Card
      className={isLow ? "border-warning/40 bg-warning/5" : ""}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Balance de créditos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tabular-nums">
            {creditsRemaining}
          </span>
          {maxCredits > 0 && (
            <span className="text-sm text-muted-foreground">
              / {maxCredits}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {maxCredits > 0 && (
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isLow
                  ? "bg-warning"
                  : usagePercent > 50
                    ? "bg-primary"
                    : "bg-success"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Plan{" "}
            <span className="capitalize font-medium">{plan}</span>
          </p>
          {canUpgrade && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/plans">Mejorar plan</Link>
            </Button>
          )}
        </div>

        {isLow && creditsRemaining > 0 && (
          <p className="text-xs text-warning-foreground">
            ⚠️ Te quedan pocos créditos. Considera mejorar tu plan.
          </p>
        )}
        {creditsRemaining === 0 && (
          <p className="text-xs text-destructive">
            Sin créditos restantes. Mejora tu plan para seguir usando el
            asistente.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
