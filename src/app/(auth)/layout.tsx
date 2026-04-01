/**
 * Auth Layout — "Cual es mi nombre"
 *
 * Split layout: rich teal branding panel (desktop left) + form panel (right).
 * Mobile: compact gradient brand header + centered form.
 *
 * @module app/(auth)/layout
 */

import Link from "next/link";
import {
  Sparkles,
  Calendar,
  StickyNote,
  Bell,
  MessageCircle,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Skip to form — accessibility */}
      <a
        href="#auth-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Ir al formulario
      </a>

      {/* ═══════════════════════════════════════════════════════════
         BRANDING PANEL — desktop only
         ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:flex-col relative overflow-hidden">
        {/* Base background — deep oceanic teal */}
        <div className="absolute inset-0 bg-[oklch(0.26_0.07_195)]" />

        {/* Gradient mesh — layered orbs for depth */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[oklch(0.36_0.11_195)] opacity-50 blur-[100px] will-change-transform" style={{ animation: "float-orb-1 18s ease-in-out infinite" }} />
          <div className="absolute top-1/3 -right-20 w-[380px] h-[380px] rounded-full bg-[oklch(0.72_0.11_75)] opacity-[0.12] blur-[80px] will-change-transform" style={{ animation: "float-orb-2 22s ease-in-out infinite" }} />
          <div className="absolute -bottom-36 left-1/4 w-[420px] h-[420px] rounded-full bg-[oklch(0.40_0.13_195)] opacity-40 blur-[100px] will-change-transform" style={{ animation: "float-orb-1 18s ease-in-out 3s infinite" }} />
          <div className="absolute top-3/4 right-1/4 w-[180px] h-[180px] rounded-full bg-[oklch(0.78_0.10_75)] opacity-[0.08] blur-[50px] will-change-transform" style={{ animation: "float-orb-2 22s ease-in-out 5s infinite" }} />
        </div>

        {/* Dot grid texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
          {/* Brand mark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            style={{ animation: "fade-in-up 0.6s ease-out both" }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/[0.08] group-hover:bg-white/[0.15] transition-colors">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Cual es mi nombre
            </span>
          </Link>

          {/* Headline + feature cards */}
          <div className="space-y-8 max-w-md">
            <div
              className="space-y-4"
              style={{ animation: "fade-in-up 0.6s ease-out 0.15s both" }}
            >
              <h1 className="font-display text-[2rem] font-extrabold leading-[1.15] tracking-tight">
                Tu asistente{" "}
                <span className="text-[oklch(0.84_0.12_75)]">inteligente</span>
                <br />
                en WhatsApp
              </h1>
              <p className="text-white/65 text-lg leading-relaxed">
                Organiza tu vida con solo enviar un mensaje. Agenda, notas y
                recordatorios al alcance de tu mano.
              </p>
            </div>

            <div className="space-y-2.5">
              <FeatureCard
                icon={Calendar}
                label="Calendario"
                description="Gestiona eventos con lenguaje natural"
                delay={0.3}
              />
              <FeatureCard
                icon={StickyNote}
                label="Notas"
                description="Crea y busca notas al instante"
                delay={0.4}
              />
              <FeatureCard
                icon={Bell}
                label="Recordatorios"
                description="Nunca olvides nada importante"
                delay={0.5}
              />
              <FeatureCard
                icon={MessageCircle}
                label="Chat IA"
                description="Conversaciones naturales en espanol"
                delay={0.6}
              />
            </div>
          </div>

          {/* Footer */}
          <p
            className="text-xs text-white/35"
            style={{ animation: "fade-in-up 0.6s ease-out 0.7s both" }}
          >
            &copy; {new Date().getFullYear()} Cual es mi nombre
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         FORM PANEL
         ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col min-h-screen lg:min-h-0 bg-background">
        {/* Mobile brand header — teal gradient strip */}
        <div className="lg:hidden relative overflow-hidden">
          <div className="absolute inset-0 bg-[oklch(0.26_0.07_195)]" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-[oklch(0.36_0.11_195)] opacity-50 blur-[50px] will-change-transform" style={{ animation: "float-orb-1 18s ease-in-out infinite" }} />
            <div className="absolute -bottom-8 right-0 w-32 h-32 rounded-full bg-[oklch(0.72_0.11_75)] opacity-[0.15] blur-[40px] will-change-transform" style={{ animation: "float-orb-2 22s ease-in-out infinite" }} />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1 py-6 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/[0.08]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display font-bold tracking-tight">
                Cual es mi nombre
              </span>
            </div>
            <p className="text-xs text-white/50">
              Tu asistente inteligente en WhatsApp
            </p>
          </div>
        </div>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <div id="auth-form" className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FeatureCard — glass-morphism card for branding panel
   ───────────────────────────────────────────────────────────── */

function FeatureCard({
  icon: Icon,
  label,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.06] px-4 py-3 hover:bg-white/[0.10] hover:scale-[1.02] transition-transform duration-200"
      style={{ animation: `fade-in-up 0.5s ease-out ${delay}s both` }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.08]">
        <Icon className="h-5 w-5 text-[oklch(0.84_0.12_75)]" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm text-white">{label}</p>
        <p className="text-xs text-white/50">{description}</p>
      </div>
    </div>
  );
}
