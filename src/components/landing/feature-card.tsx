"use client";

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
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border bg-background p-6 transition-colors duration-300 hover:border-foreground/20"
      whileHover={{ y: -2 }}
      transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
    >
      <div className="relative z-10">
        <motion.div
          className={cn(
            "mb-4 inline-flex size-12 items-center justify-center rounded-lg",
            iconBg,
          )}
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 15 }}
        >
          <Icon className={cn("size-6", iconColor)} />
        </motion.div>
        <h3 className="text-2xl font-normal leading-none tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-normal text-muted-foreground">
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
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: StickyNote,
    title: "Notas",
    description:
      "Toma notas rapidas, organizalas con tags y buscalas cuando las necesites.",
    iconBg: "bg-[#65b5ff]/10",
    iconColor: "text-[#65b5ff]",
  },
  {
    icon: Bell,
    title: "Recordatorios",
    description:
      "Programa recordatorios con fecha y hora. Te avisamos por WhatsApp.",
    iconBg: "bg-[#0bdf50]/10",
    iconColor: "text-[#0bdf50]",
  },
  {
    icon: MessageCircle,
    title: "IA Conversacional",
    description:
      "Habla de forma natural. Entiende contexto, fechas relativas y espanol coloquial.",
    iconBg: "bg-[#ff2067]/10",
    iconColor: "text-[#ff2067]",
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
