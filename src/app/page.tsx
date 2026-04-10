// Frontend Agent (Kaizen) was here - E2E test 2026-03-31
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
import { Badge } from "@/components/ui/badge";
import { HeroContent } from "@/components/landing/hero-content";
import { AnimatedChatDemo } from "@/components/landing/animated-chat-demo";
import { LandingNavbar } from "@/components/landing/navbar";
import { MotionReveal, StaggerContainer, StaggerItem } from "@/components/landing/motion-reveal";
import { FeatureGrid } from "@/components/landing/feature-card";
import { AnimatedSteps } from "@/components/landing/animated-steps";
import { PricingSection } from "@/components/landing/pricing-section";
import { Sparkles, Instagram, Twitter } from "lucide-react";

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
      <LandingNavbar />

      {/* ── Hero — M2.1 ── */}
      <section className="relative overflow-hidden">
        {/* Gradient mesh background — animated orbs */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-[#65b5ff]/5" />
          <div
            className="absolute -top-24 left-1/4 size-96 rounded-full bg-accent/8 blur-3xl will-change-transform"
            style={{ animation: "float-orb-1 18s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-24 right-1/4 size-96 rounded-full bg-[#65b5ff]/8 blur-3xl will-change-transform"
            style={{ animation: "float-orb-2 22s ease-in-out infinite" }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Animated Content */}
            <HeroContent />

            {/* Right: Animated WhatsApp Chat Demo */}
            <AnimatedChatDemo />
          </div>
        </div>
      </section>

      {/* ── Features — M2.2 ── */}
      <section className="border-t bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <MotionReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-normal leading-none tracking-[-0.03em] sm:text-5xl">
                Todo lo que necesitas, en un chat
              </h2>
              <p className="mt-4 font-serif italic text-base leading-[1.4] tracking-[-0.01em] text-muted-foreground">
                Un solo asistente que entiende lenguaje natural y se conecta
                con tus herramientas favoritas.
              </p>
            </div>
          </MotionReveal>

          <FeatureGrid />
        </div>
      </section>

      {/* ── How it works — M2.4 ── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <MotionReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-normal leading-none tracking-[-0.03em] sm:text-5xl">
                Empieza en 3 simples pasos
              </h2>
            </div>
          </MotionReveal>

          <AnimatedSteps />

          {/* Trust badges */}
          <StaggerContainer
            className="mt-16 flex flex-wrap items-center justify-center gap-4"
            staggerDelay={0.08}
          >
            <StaggerItem>
              <span className="text-sm text-muted-foreground">
                Integrado con:
              </span>
            </StaggerItem>
            {["WhatsApp", "Google Calendar", "MercadoPago"].map((name) => (
              <StaggerItem key={name}>
                <Badge variant="outline" className="text-sm">
                  {name}
                </Badge>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Pricing Preview — M2.3 ── */}
      <section
        id="planes"
        className="scroll-mt-20 border-t bg-background py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <MotionReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-4xl font-normal leading-none tracking-[-0.03em] sm:text-5xl">
                Planes simples, sin sorpresas
              </h2>
              <p className="mt-4 font-serif italic text-base leading-[1.4] tracking-[-0.01em] text-muted-foreground">
                Empieza gratis. Escala cuando estes listo.
              </p>
            </div>
          </MotionReveal>

          <PricingSection />
        </div>
      </section>

      {/* ── Footer — M2.5 ── */}
      <footer className="border-t py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <MotionReveal>
            <div className="grid gap-10 sm:grid-cols-[2fr_1fr_1fr]">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-accent" />
                  <span className="font-bold">Cual es mi nombre</span>
                </div>
                <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                  Tu asistente inteligente en WhatsApp. Calendario, notas,
                  recordatorios y más con lenguaje natural.
                </p>
              </div>

              {/* Producto */}
              <div>
                <h3 className="mb-3 text-xs font-mono uppercase tracking-[0.08em] text-muted-foreground">
                  Producto
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Funciones
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#planes"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Precios
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Iniciar Sesión
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Crear Cuenta
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="mb-3 text-xs font-mono uppercase tracking-[0.08em] text-muted-foreground">
                  Legal
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/terms"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Términos de Servicio
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Política de Privacidad
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-10 border-t pt-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} Cual es mi nombre. Todos
                  los derechos reservados.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://instagram.com/cualesminombre"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Síguenos en Instagram"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Instagram className="size-5" />
                  </a>
                  <a
                    href="https://x.com/cualesminombre"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Síguenos en X"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Twitter className="size-5" />
                  </a>
                </div>
              </div>
            </div>
          </MotionReveal>
        </div>
      </footer>
    </div>
  );
}
