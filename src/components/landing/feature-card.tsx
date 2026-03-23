"use client";

import { useRef, useCallback } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Calendar, StickyNote, Bell, MessageCircle } from "lucide-react";
import { StaggerContainer, StaggerItem } from "./motion-reveal";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

function FeatureCardInner({
  icon: Icon,
  title,
  description,
  iconBg,
  iconColor,
}: FeatureCardProps) {
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!glowRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowRef.current.style.background = `radial-gradient(250px circle at ${x}px ${y}px, var(--glow-color), transparent 70%)`;
    glowRef.current.style.opacity = "0.6";
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!glowRef.current) return;
    glowRef.current.style.opacity = "0";
  }, []);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border bg-card p-6 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5"
      whileHover={{ y: -4 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Cursor-following radial glow — manipulated via ref, no re-renders */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-200"
      />

      <div className="relative z-10">
        <motion.div
          className={cn(
            "mb-4 inline-flex size-12 items-center justify-center rounded-xl",
            iconBg,
          )}
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 15 }}
        >
          <Icon className={cn("size-6", iconColor)} />
        </motion.div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

const features: FeatureCardProps[] = [
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

export function FeatureGrid() {
  return (
    <StaggerContainer
      className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
      staggerDelay={0.12}
    >
      {features.map((feature) => (
        <StaggerItem key={feature.title}>
          <FeatureCardInner {...feature} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
