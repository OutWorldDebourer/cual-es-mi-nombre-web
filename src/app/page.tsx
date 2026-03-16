/**
 * Landing Page — "Cual es mi nombre" Web
 *
 * Conversion-oriented landing page for unauthenticated visitors.
 * Authenticated users are redirected to /dashboard.
 *
 * Sections: Hero (M2.1), Features (M2.2), Pricing (M2.3),
 * How it works (M2.4), Footer (M2.5)
 *
 * @module app/page
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  StickyNote,
  Bell,
  Sparkles,
  ArrowRight,
  Check,
  MessageCircle,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

/* ── Static data ─────────────────────────────────────────────── */

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    icon: Calendar,
    title: "Calendario",
    description:
      "Crea, edita y consulta eventos en Google Calendar con lenguaje natural.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: StickyNote,
    title: "Notas",
    description:
      "Toma notas rapidas, organizalas con tags y buscalas cuando las necesites.",
    iconBg: "bg-chart-4/10",
    iconColor: "text-chart-4",
  },
  {
    icon: Bell,
    title: "Recordatorios",
    description:
      "Programa recordatorios con fecha y hora. Te avisamos por WhatsApp.",
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    icon: MessageCircle,
    title: "IA Conversacional",
    description:
      "Habla de forma natural. Entiende contexto, fechas relativas y espanol coloquial.",
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
];

const steps: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: UserPlus,
    title: "Crea tu cuenta",
    description:
      "Registrate con tu numero de telefono en menos de un minuto.",
  },
  {
    icon: MessageCircle,
    title: "Vincula WhatsApp",
    description: "Conecta tu WhatsApp y personaliza tu asistente.",
  },
  {
    icon: CheckCircle2,
    title: "Listo!",
    description:
      "Empieza a usar tu asistente. Calendario, notas y mas al instante.",
  },
];

const plans: {
  name: string;
  price: string;
  credits: string;
  features: string[];
  badge: string | null;
  highlighted: boolean;
  cta: string;
}[] = [
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

/* ── Page Component ──────────────────────────────────────────── */

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-6 text-primary" />
            <span className="text-lg font-bold">
              Cual es mi nombre
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Iniciar Sesion</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Crear Cuenta</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero — M2.1 ── */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute -top-24 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 size-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Content */}
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="animate-[fade-in-up_0.6s_ease-out_both]"
              >
                <Sparkles className="size-3" />
                Potenciado por IA
              </Badge>

              <h1 className="text-4xl font-extrabold tracking-tight animate-[fade-in-up_0.6s_ease-out_0.1s_both] sm:text-5xl lg:text-6xl">
                Tu asistente{" "}
                <span className="text-primary">inteligente</span> en
                WhatsApp
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground animate-[fade-in-up_0.6s_ease-out_0.2s_both]">
                Gestiona tu calendario, toma notas, configura recordatorios
                y mas — todo desde una conversacion natural en WhatsApp.
              </p>

              <div className="flex flex-wrap gap-4 animate-[fade-in-up_0.6s_ease-out_0.3s_both]">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 shadow-lg shadow-primary/25"
                >
                  <Link href="/signup">
                    Comenzar gratis
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#planes">Ver planes</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground animate-[fade-in-up_0.6s_ease-out_0.4s_both]">
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" />
                  Sin tarjeta requerida
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" />
                  Configura en 2 min
                </span>
              </div>
            </div>

            {/* Right: WhatsApp Mockup */}
            <div className="relative animate-[slide-in-right_0.8s_ease-out_0.3s_both] lg:justify-self-end">
              <div className="mx-auto max-w-sm">
                {/* Phone frame */}
                <div className="overflow-hidden rounded-3xl border-2 border-border/50 bg-card shadow-2xl shadow-primary/10">
                  {/* Chat header */}
                  <div className="flex items-center gap-3 bg-primary px-4 py-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/20">
                      <Sparkles className="size-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground">
                        Luna
                      </p>
                      <p className="text-xs text-primary-foreground/70">
                        en linea
                      </p>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="space-y-3 bg-secondary/30 p-4">
                    {/* User message */}
                    <div className="ml-auto max-w-[75%]">
                      <div className="rounded-2xl rounded-tr-sm bg-primary/10 px-4 py-2.5">
                        <p className="text-sm">
                          Agenda reunion con Ana manana a las 3pm
                        </p>
                      </div>
                    </div>

                    {/* Bot response */}
                    <div className="mr-auto max-w-[80%]">
                      <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-2.5 shadow-sm">
                        <p className="text-sm">
                          Listo! Agende{" "}
                          <strong>&quot;Reunion con Ana&quot;</strong> para
                          manana a las 3:00 PM en tu Google Calendar.
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Quieres agregar algo mas?
                        </p>
                      </div>
                    </div>

                    {/* User message 2 */}
                    <div className="ml-auto max-w-[75%]">
                      <div className="rounded-2xl rounded-tr-sm bg-primary/10 px-4 py-2.5">
                        <p className="text-sm">Recuerdame 30 min antes</p>
                      </div>
                    </div>

                    {/* Bot response 2 */}
                    <div className="mr-auto max-w-[80%]">
                      <div className="rounded-2xl rounded-tl-sm bg-card px-4 py-2.5 shadow-sm">
                        <p className="text-sm">
                          Recordatorio configurado para manana a las 2:30 PM.
                          No se te olvida!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features — M2.2 ── */}
      <section className="border-t bg-card/50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Todo lo que necesitas, en un chat
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Un solo asistente que entiende lenguaje natural y se conecta
                con tus herramientas favoritas.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(
              ({ icon: Icon, title, description, iconBg, iconColor }, i) => (
                <ScrollReveal key={title} delay={i * 100}>
                  <div className="rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                    <div
                      className={cn(
                        "mb-4 inline-flex size-12 items-center justify-center rounded-xl",
                        iconBg,
                      )}
                    >
                      <Icon className={cn("size-6", iconColor)} />
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </ScrollReveal>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── How it works — M2.4 ── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Empieza en 3 simples pasos
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative mt-16 grid gap-12 sm:grid-cols-3 sm:gap-8">
            {/* Connector line between step circles */}
            <div
              className="absolute top-8 left-[20%] right-[20%] hidden h-px border-t border-dashed border-border sm:block"
              aria-hidden="true"
            />

            {steps.map(({ icon: Icon, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 150}>
                <div className="relative text-center">
                  <div className="relative mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Icon className="size-7" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Trust badges */}
          <ScrollReveal delay={500}>
            <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">
                Integrado con:
              </span>
              {["WhatsApp", "Google Calendar", "MercadoPago"].map((name) => (
                <Badge key={name} variant="outline" className="text-sm">
                  {name}
                </Badge>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Pricing Preview — M2.3 ── */}
      <section
        id="planes"
        className="scroll-mt-20 border-t bg-card/50 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Planes simples, sin sorpresas
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Empieza gratis. Escala cuando estes listo.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={i * 100}>
                <div
                  className={cn(
                    "relative rounded-2xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                    plan.highlighted &&
                      "border-primary shadow-lg ring-2 ring-primary/20",
                  )}
                >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>{plan.badge}</Badge>
                  </div>
                )}

                <h3 className="pt-2 text-lg font-semibold">{plan.name}</h3>

                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-sm text-muted-foreground">S/</span>
                  <span className="text-4xl font-bold tabular-nums">
                    {plan.price}
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
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer — M2.5 ── */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <span className="font-semibold">Cual es mi nombre</span>
              </div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Cual es mi nombre. Todos los
                derechos reservados.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </footer>
    </div>
  );
}
