/**
 * Plan Card Component — "Cuál es mi nombre" Web
 *
 * Displays a single subscription plan in a card format for the
 * pricing / plans page. Highlighted plans get a prominent ribbon,
 * larger sizing, and premium visual treatment.
 *
 * @module components/plans/plan-card
 */

"use client";

import { useState } from "react";
import { Check, CheckCircle, Crown, Sparkles } from "lucide-react";
import type { PlanInfo } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: PlanInfo;
  currentPlan: string;
  currencySymbol: string;
  index?: number;
  onSelectPlan: (planKey: string) => Promise<void>;
}

export function PlanCard({
  plan,
  currentPlan,
  currencySymbol,
  index = 0,
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
        "flex flex-col relative overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        "animate-[fade-in-up_0.5s_ease-out_both]",
        plan.is_highlighted
          ? "border-primary shadow-xl ring-2 ring-primary/20 pb-2"
          : "hover:border-primary/30",
        isCurrent && "ring-2 ring-success/30 border-success/50",
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Highlighted: gradient ribbon banner */}
      {plan.is_highlighted && plan.badge && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-xs font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="size-3" />
          {plan.badge}
        </div>
      )}

      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
          <CheckCircle className="size-3.5" />
          Tu plan
        </div>
      )}

      <CardHeader
        className={cn(
          "text-center",
          plan.is_highlighted ? "pt-6" : "pt-8",
        )}
      >
        <CardTitle
          className={cn(
            "flex items-center justify-center gap-2",
            plan.is_highlighted ? "text-xl" : "text-lg",
          )}
        >
          {plan.is_highlighted && (
            <Crown className="size-5 text-accent" />
          )}
          {plan.label}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-6">
        {/* Pricing */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-sm text-muted-foreground">
              {currencySymbol}
            </span>
            <span
              className={cn(
                "font-bold tabular-nums",
                plan.is_highlighted ? "text-5xl" : "text-4xl",
              )}
            >
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
        <ul className="flex-1 space-y-2.5 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  plan.is_highlighted
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action button */}
        <Button
          className={cn(
            "w-full",
            plan.is_highlighted && "shadow-md shadow-primary/25",
          )}
          size={plan.is_highlighted ? "lg" : "default"}
          variant={plan.is_highlighted ? "default" : "outline"}
          disabled={!canSelect}
          loading={loading}
          onClick={handleClick}
        >
          {isCurrent
            ? "Plan actual"
            : isFree
              ? "Plan gratuito"
              : "Elegir plan"}
        </Button>
      </CardContent>
    </Card>
  );
}
