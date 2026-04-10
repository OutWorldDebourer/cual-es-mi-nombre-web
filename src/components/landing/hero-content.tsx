"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextReveal } from "./text-reveal";
import { Sparkles, ArrowRight, Check } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 14 },
  },
};

interface HeroContentProps {
  isAuthenticated?: boolean;
}

export function HeroContent({ isAuthenticated = false }: HeroContentProps) {
  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/15">
          <Sparkles className="size-3" />
          Potenciado por IA
        </Badge>
      </motion.div>

      <motion.div variants={itemVariants}>
        <TextReveal
          text="Tu asistente inteligente en WhatsApp"
          as="h1"
          className="text-5xl font-normal leading-none tracking-[-0.03em] sm:text-6xl lg:text-7xl"
          trigger="mount"
          highlightWord="inteligente"
          highlightClassName="text-accent"
          delay={0.3}
        />
      </motion.div>

      <motion.p
        className="max-w-lg font-serif italic text-base leading-[1.4] tracking-[-0.01em] text-muted-foreground"
        variants={itemVariants}
      >
        Gestiona tu calendario, toma notas, configura recordatorios y mas —
        todo desde una conversacion natural en WhatsApp.
      </motion.p>

      <motion.div className="flex flex-wrap gap-4" variants={itemVariants}>
        {isAuthenticated ? (
          <Button
            asChild
            size="lg"
            className="group gap-2"
          >
            <Link href="/dashboard">
              Ir al Dashboard
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            className="group gap-2 animate-[pulse-glow_2s_ease-in-out_infinite]"
          >
            <a
              href="https://wa.me/51901258245?text=Hola%2C%20quiero%20comenzar%20%F0%9F%91%8B"
              target="_blank"
              rel="noopener noreferrer"
            >
              Comenzar gratis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
        )}
        <Button asChild size="lg" variant="outline">
          <Link href="#planes">Ver planes</Link>
        </Button>
      </motion.div>

      {!isAuthenticated && (
        <motion.div
          className="flex items-center gap-6 text-sm text-muted-foreground"
          variants={itemVariants}
        >
          <span className="flex items-center gap-1.5">
            <Check className="size-4 text-success" />
            Sin tarjeta requerida
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-4 text-success" />
            Configura en 2 min
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
