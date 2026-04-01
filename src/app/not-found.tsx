"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/ui/floating-orbs";
import { MotionReveal } from "@/components/landing/motion-reveal";
import { Sparkles, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      <FloatingOrbs count={2} />
      <MotionReveal direction="up">
        <div className="relative z-10 text-center space-y-6 max-w-md">
          {/* Brand mark */}
          <div className="flex justify-center">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-8 text-primary" />
            </div>
          </div>

          {/* 404 number */}
          <h1 className="text-8xl font-extrabold tracking-tighter text-primary/20">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="inline-block"
            >
              404
            </motion.span>
          </h1>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Página no encontrada
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              La página que buscas no existe o fue movida.
              Vuelve al inicio para continuar.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                <Home className="size-4" />
                Ir al dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </div>
      </MotionReveal>
    </div>
  );
}
