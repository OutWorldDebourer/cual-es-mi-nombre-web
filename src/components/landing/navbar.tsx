"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-primary/80 to-primary"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navbar */}
      <nav
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 ease-out",
          "border-b bg-background/80 backdrop-blur-lg",
          scrolled &&
            "lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none lg:pt-2"
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6",
            "transition-all duration-500 ease-out",
            scrolled && [
              "lg:max-w-[820px] lg:rounded-full",
              "lg:border lg:border-black/[0.06] lg:bg-white/60 lg:backdrop-blur-xl",
              "lg:shadow-lg lg:shadow-black/5",
              "dark:lg:bg-white/[0.04] dark:lg:border-white/[0.08]",
            ]
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <Sparkles
              className="size-6 text-primary"
              style={{ animation: "sparkle-pulse 3s ease-in-out infinite" }}
            />
            <span className="text-lg font-bold">Cual es mi nombre</span>
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
    </>
  );
}
