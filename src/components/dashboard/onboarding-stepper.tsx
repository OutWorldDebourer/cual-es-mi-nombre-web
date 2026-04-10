import Link from "next/link";
import {
  MessageCircle,
  Sparkles,
  User,
  Calendar,
  Gem,
  Check,
  ArrowRight,
} from "lucide-react";
import { CountUp } from "@/components/dashboard/count-up";

interface OnboardingStep {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  completed: boolean;
}

interface OnboardingStepperProps {
  hasPhone: boolean;
  hasDisplayName: boolean;
  hasCustomName: boolean;
  hasGoogle: boolean;
  hasPaidPlan: boolean;
}

export function OnboardingStepper({
  hasPhone,
  hasDisplayName,
  hasCustomName,
  hasGoogle,
  hasPaidPlan,
}: OnboardingStepperProps) {
  const steps: OnboardingStep[] = [
    {
      key: "whatsapp",
      title: "Vincula WhatsApp",
      description: "Conecta tu número para usar el asistente por chat",
      href: "/dashboard/settings/whatsapp",
      icon: MessageCircle,
      completed: hasPhone,
    },
    {
      key: "display-name",
      title: "Dinos tu nombre",
      description: "Para que tu asistente te llame por tu nombre",
      href: "/dashboard/settings",
      icon: User,
      completed: hasDisplayName,
    },
    {
      key: "name",
      title: "Personaliza tu asistente",
      description: "Dale un nombre único a tu asistente virtual",
      href: "/dashboard/settings",
      icon: Sparkles,
      completed: hasCustomName,
    },
    {
      key: "google",
      title: "Conecta Google Calendar",
      description: "Sincroniza tus eventos y agenda desde WhatsApp",
      href: "/dashboard/settings/google",
      icon: Calendar,
      completed: hasGoogle,
    },
    {
      key: "plan",
      title: "Elige un plan",
      description: "Obtén más créditos y funciones premium",
      href: "/dashboard/plans",
      icon: Gem,
      completed: hasPaidPlan,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;

  // All done — don't render
  if (completedCount === steps.length) return null;

  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 animate-[fade-in-up_0.4s_ease-out_both]">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base">Completa tu configuración</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} de {steps.length} pasos completados
          </p>
        </div>
        <div className="text-2xl font-bold text-primary tabular-nums">
          <CountUp end={Math.round(progressPercent)} suffix="%" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid gap-2 sm:grid-cols-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isNext =
            !step.completed &&
            steps.slice(0, index).every((s) => s.completed);

          if (step.completed) {
            return (
              <div
                key={step.key}
                className="flex items-center gap-3 rounded-lg p-3 bg-success/5 border border-success/15"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-success line-through decoration-success/40">
                    {step.title}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={step.key}
              href={step.href}
              className={`group flex items-center gap-3 rounded-lg p-3 border transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                isNext
                  ? "border-accent/30 bg-accent/5 ring-1 ring-accent/20"
                  : "border-border hover:border-accent/20"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isNext
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${isNext ? "text-primary" : ""}`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {step.description}
                </p>
              </div>
              <ArrowRight
                className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                  isNext ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
