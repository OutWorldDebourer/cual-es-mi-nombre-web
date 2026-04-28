/**
 * Credit Balance Component — "Cuál es mi nombre" Web
 *
 * Displays the user's current credit balance in a prominent card with plan
 * info and a CTA to upgrade if on a lower plan.
 *
 * For free-tier users it additionally renders:
 *   - Expiry badge ("Expira en X días" / "Expirado") when the free credits
 *     have a known expiration date.
 *   - Throttle window indicator: amber banner when the per-window cap is hit
 *     and a discreet counter ("Ventana actual: X/Y") otherwise.
 *
 * A "Comprar pack 100 créditos S/9.90" button is rendered for every plan as
 * a secondary CTA — it triggers the MercadoPago top-up flow.
 *
 * Client Component because it must fetch the live throttle window and handle
 * the top-up button click.
 *
 * @module components/credits/credit-balance
 */

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { SubscriptionPlan } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CountUp } from "@/components/dashboard/count-up";
import { backendApi, ApiError, type CreditWindow } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

interface CreditBalanceProps {
  creditsRemaining: number;
  creditsTotal: number;
  plan: SubscriptionPlan;
  /** profiles.free_credits_expires_at — only meaningful for plan === "free". */
  freeCreditsExpiresAt?: string | null;
}

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  free: 0,
  basic: 300,
  pro: 1000,
  premium: 3000,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Days remaining between now and an ISO timestamp. Negative values collapse
 * to 0 (caller decides how to render "expired").
 */
function daysUntil(isoDate: string): number {
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return 0;
  const diff = target - Date.now();
  return Math.ceil(diff / MS_PER_DAY);
}

export function CreditBalance({
  creditsRemaining,
  creditsTotal,
  plan,
  freeCreditsExpiresAt,
}: CreditBalanceProps) {
  const maxCredits = PLAN_LIMITS[plan] || creditsTotal;
  const usagePercent =
    maxCredits > 0 ? Math.round((creditsRemaining / maxCredits) * 100) : 0;
  const isLow = usagePercent < 20;
  const canUpgrade = plan !== "premium";
  const isFree = plan === "free";

  // ── Expiry badge (free tier only) ───────────────────────────────────
  const expiryDays =
    isFree && freeCreditsExpiresAt ? daysUntil(freeCreditsExpiresAt) : null;

  // ── Window throttle indicator (free tier only) ─────────────────────
  const [creditWindow, setCreditWindow] = useState<CreditWindow | null>(null);

  useEffect(() => {
    if (!isFree) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const data = await backendApi(supabase).credits.getWindow();
        if (!cancelled) setCreditWindow(data);
      } catch {
        // Throttle indicator is non-critical: stay silent on fetch errors.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isFree]);

  // ── Top-up handler (all plans) ──────────────────────────────────────
  const [topupLoading, setTopupLoading] = useState(false);

  const handleTopup = useCallback(async () => {
    setTopupLoading(true);
    try {
      const supabase = createClient();
      const result = await backendApi(supabase).payments.createTopupPreference();
      // Redirect to MercadoPago Checkout Pro
      globalThis.location.href = result.init_point;
    } catch (err) {
      setTopupLoading(false);
      if (err instanceof ApiError) {
        toast.error(err.detail);
      } else {
        toast.error("No pudimos iniciar la compra. Intenta de nuevo.");
      }
    }
  }, []);

  return (
    <Card className={isLow ? "border-warning/40 bg-warning/5" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Balance de créditos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tabular-nums">
            <CountUp end={creditsRemaining} />
          </span>
          {maxCredits > 0 && (
            <span className="text-sm text-muted-foreground">
              / {maxCredits}
            </span>
          )}
          {expiryDays !== null && (
            <Badge
              variant={expiryDays <= 0 ? "destructive" : "secondary"}
              className="ml-auto"
            >
              {expiryDays > 0 ? `Expira en ${expiryDays} días` : "Expirado"}
            </Badge>
          )}
        </div>

        {maxCredits > 0 && (
          <Progress
            value={Math.min(usagePercent, 100)}
            className={
              isLow
                ? "[&>[data-slot=progress-indicator]]:bg-warning"
                : usagePercent > 50
                  ? ""
                  : "[&>[data-slot=progress-indicator]]:bg-success"
            }
            aria-label={`${usagePercent}% de créditos restantes`}
          />
        )}

        {/* Throttle window — only for free tier with active data */}
        {isFree && creditWindow && !creditWindow.allowed && (
          <div
            role="status"
            className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground"
          >
            Has usado tus {creditWindow.credits_limit} créditos de esta ventana.
            Vuelve en {Math.ceil(creditWindow.retry_after_seconds / 60)} min.
          </div>
        )}
        {isFree && creditWindow && creditWindow.allowed && creditWindow.credits_used > 0 && (
          <p className="text-xs text-muted-foreground">
            Ventana actual: {creditWindow.credits_used}/{creditWindow.credits_limit}
          </p>
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

        {/* Top-up CTA — visible to every plan, secondary styling */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={handleTopup}
          disabled={topupLoading}
        >
          {topupLoading ? "Redirigiendo…" : "Comprar pack 100 créditos S/9.90"}
        </Button>

        {isLow && creditsRemaining > 0 && (
          <p className="text-xs text-warning-foreground">
            <span aria-hidden="true">⚠️</span> Te quedan pocos créditos.
            Considera mejorar tu plan.
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
