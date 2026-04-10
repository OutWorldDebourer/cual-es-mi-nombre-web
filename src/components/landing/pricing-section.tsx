"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TiltCard } from "./tilt-card";
import { StaggerContainer, StaggerItem } from "./motion-reveal";
import { CountUp } from "@/components/dashboard/count-up";

interface Plan {
  name: string;
  price: string;
  credits: string;
  features: string[];
  badge: string | null;
  highlighted: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    name: "Basico",
    price: "19.90",
    credits: "300 creditos/mes",
    features: [
      "Notas y recordatorios",
      "Soporte por WhatsApp",
      "IA conversacional",
    ],
    badge: null,
    highlighted: false,
    cta: "Comenzar",
  },
  {
    name: "Pro",
    price: "39.90",
    credits: "1,000 creditos/mes",
    features: [
      "Google Calendar",
      "Audio transcripcion",
      "Prioridad en soporte",
      "Todo lo del Basico",
    ],
    badge: "Popular",
    highlighted: true,
    cta: "Elegir Pro",
  },
  {
    name: "Premium",
    price: "69.90",
    credits: "3,000 creditos/mes",
    features: [
      "Sin limites de uso",
      "Acceso anticipado",
      "Soporte prioritario",
      "Todo lo del Pro",
    ],
    badge: null,
    highlighted: false,
    cta: "Elegir Premium",
  },
];

interface PricingSectionProps {
  isAuthenticated?: boolean;
}

export function PricingSection({ isAuthenticated = false }: PricingSectionProps) {
  return (
    <StaggerContainer
      className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3"
      staggerDelay={0.12}
    >
      {plans.map((plan, index) => (
        <StaggerItem key={plan.name}>
          <TiltCard>
            <div
              className={cn(
                "relative rounded-lg border bg-card p-6 text-center transition-all duration-300 hover:border-foreground/20 active:scale-[0.98]",
                plan.highlighted &&
                  "border-accent ring-2 ring-accent/20 animate-[pulse-glow_3s_ease-in-out_infinite]",
              )}
            >
              {/* Shimmer glow overlay for highlighted plan */}
              {plan.highlighted && (
                <div
                  className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-lg"
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 30%, rgba(255, 86, 0, 0.08) 50%, transparent 70%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer-border 3s linear infinite",
                    }}
                  />
                </div>
              )}

              <div className="relative z-10">
                {plan.badge && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                    <Badge>{plan.badge}</Badge>
                  </div>
                )}

                <h3 className="pt-2 text-lg font-normal leading-none tracking-tight">{plan.name}</h3>

                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-sm text-muted-foreground">S/</span>
                  <span className="text-4xl font-bold tabular-nums">
                    <CountUp end={parseFloat(plan.price)} decimals={2} delay={index * 200} />
                  </span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.credits}
                </p>

                <ul className="mt-6 space-y-2.5 text-left text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  <Link href={isAuthenticated ? "/dashboard/plans" : "/signup"}>
                    {isAuthenticated ? "Ver planes" : plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          </TiltCard>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
