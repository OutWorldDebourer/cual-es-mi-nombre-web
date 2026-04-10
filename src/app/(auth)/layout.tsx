/**
 * Auth Layout — "Cual es mi nombre"
 *
 * Split layout: off-black branding panel (desktop left) + form panel (right).
 * Mobile: compact dark brand header + centered form.
 * Branding panel stays dark in both light and dark themes.
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Ir al formulario
      </a>

      {/* ═══════════════════════════════════════════════════════════
         BRANDING PANEL — always dark, desktop only
         ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:flex-col relative overflow-hidden">
        {/* Base background — off-black */}
        <div className="absolute inset-0 bg-[#111111]" />

        {/* Subtle ambient orbs — Fin Orange + report blue */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#ff5600] opacity-[0.06] blur-[100px] will-change-transform"
            style={{ animation: "float-orb-1 18s ease-in-out infinite" }}
          />
          <div
            className="absolute top-1/3 -right-20 w-[380px] h-[380px] rounded-full bg-[#65b5ff] opacity-[0.05] blur-[80px] will-change-transform"
            style={{ animation: "float-orb-2 22s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-36 left-1/4 w-[420px] h-[420px] rounded-full bg-[#ff5600] opacity-[0.04] blur-[100px] will-change-transform"
            style={{ animation: "float-orb-1 18s ease-in-out 3s infinite" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 text-white">
          {/* Brand mark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group w-fit rounded-lg focus-visible:outline-2 focus-visible:outline-[#ff5600] focus-visible:outline-offset-2"
            style={{ animation: "fade-in-up 0.6s ease-out both" }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/10 border border-white/[0.08] group-hover:bg-white/[0.15] transition-colors">
              <Sparkles className="h-5 w-5 text-[#ff5600]" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Cual es mi nombre
            </span>
          </Link>

          {/* Headline + feature cards */}
          <div className="space-y-8 max-w-md">
            <div
              className="space-y-4"
              style={{ animation: "fade-in-up 0.6s ease-out 0.15s both" }}
            >
              <h1 className="text-[2rem] font-normal leading-none tracking-[-0.03em]">
                Tu asistente{" "}
                <span className="text-[#ff5600]">inteligente</span>
                <br />
                en WhatsApp
              </h1>
              <p className="text-white/60 text-base leading-normal">
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
            className="text-xs text-white/30"
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
        {/* Mobile brand header — always dark */}
        <div className="lg:hidden relative overflow-hidden">
          <div className="absolute inset-0 bg-[#111111]" />
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-[#ff5600] opacity-[0.08] blur-[50px] will-change-transform"
              style={{ animation: "float-orb-1 18s ease-in-out infinite" }}
            />
            <div
              className="absolute -bottom-8 right-0 w-32 h-32 rounded-full bg-[#65b5ff] opacity-[0.06] blur-[40px] will-change-transform"
              style={{ animation: "float-orb-2 22s ease-in-out infinite" }}
            />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-1 py-6 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-white/10 border border-white/[0.08]">
                <Sparkles className="h-4 w-4 text-[#ff5600]" />
              </div>
              <span className="font-bold tracking-tight">
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
   FeatureCard — subtle card for branding panel
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
      className="flex items-center gap-4 rounded-lg bg-white/[0.05] border border-white/[0.06] px-4 py-3 hover:bg-white/[0.08] hover:scale-[1.02] transition-transform duration-200"
      style={{ animation: `fade-in-up 0.5s ease-out ${delay}s both` }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
        <Icon className="h-5 w-5 text-[#ff5600]" />
      </div>
      <div className="min-w-0">
        <p className="font-normal text-sm text-white">{label}</p>
        <p className="text-xs text-white/45">{description}</p>
      </div>
    </div>
  );
}
