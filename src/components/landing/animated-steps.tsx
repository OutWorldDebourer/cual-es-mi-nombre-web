"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { UserPlus, MessageCircle, CheckCircle2 } from "lucide-react";
import { StaggerContainer, StaggerItem } from "./motion-reveal";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: UserPlus,
    title: "Crea tu cuenta",
    description: "Registrate con tu numero de telefono en menos de un minuto.",
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

const circleVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 12 },
  },
};

export function AnimatedSteps() {
  return (
    <div className="relative mt-16">
      {/* Animated connector line */}
      <div className="absolute top-8 left-[20%] right-[20%] hidden sm:block" aria-hidden="true">
        <motion.div
          className="h-px border-t border-dashed border-border"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
          style={{ transformOrigin: "left" }}
        />
      </div>

      <StaggerContainer
        className="grid gap-12 sm:grid-cols-3 sm:gap-8"
        staggerDelay={0.2}
      >
        {steps.map(({ icon: Icon, title, description }) => (
          <StaggerItem key={title}>
            <div className="relative text-center">
              <motion.div
                className="relative mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-foreground/15"
                variants={circleVariants}
                aria-hidden="true"
              >
                <Icon className="size-7" />
              </motion.div>
              <h3 className="text-lg font-normal leading-none tracking-tight">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
