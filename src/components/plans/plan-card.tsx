/**
 * Plan Card Component — "Cuál es mi nombre" Web
 *
 * Displays a single subscription plan in a card format for the
 * pricing / plans page. Highlighted plans get a visual emphasis.
 *
 * @module components/plans/plan-card
 */

"use client";

import { useState } from "react";
import type { PlanInfo } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: PlanInfo;
  currentPlan: string;
  currencySymbol: string;
  onSelectPlan: (planKey: string) => Promise<void>;
}

export function PlanCard({
  plan,
  currentPlan,
  currencySymbol,
  onSelectPlan,
}: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const isCurrent = plan.key === currentPlan;
  const isFree = plan.key === "free";
  const canSelect = !isCurrent && !isFree;

  async function handleClick() {
    if (!canSelect) return;
    setLoading(true);
    try {
      await onSelectPlan(plan.key);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      className={cn(
        "flex flex-col relative",
        plan.is_highlighted &&
          "border-primary shadow-lg ring-2 ring-primary/20",
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant={plan.is_highlighted ? "default" : "secondary"}>
            {plan.badge}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pt-8">
        <CardTitle className="text-lg">{plan.label}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6">
        {/* Pricing */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-sm text-muted-foreground">
              {currencySymbol}
            </span>
            <span className="text-4xl font-bold tabular-nums">
              {plan.price_pen % 1 === 0
                ? plan.price_pen
                : plan.price_pen.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">/mes</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.credits_per_month > 0
              ? `${plan.credits_per_month.toLocaleString()} créditos/mes`
              : "Sin créditos incluidos"}
          </p>
        </div>

        {/* Features */}
        <ul className="flex-1 space-y-2 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-0.5 text-primary">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action button */}
        <Button
          className="w-full"
          variant={plan.is_highlighted ? "default" : "outline"}
          disabled={!canSelect || loading}
          onClick={handleClick}
        >
          {loading
            ? "Procesando..."
            : isCurrent
              ? "Plan actual"
              : isFree
                ? "Plan gratuito"
                : "Elegir plan"}
        </Button>
      </CardContent>
    </Card>
  );
}
