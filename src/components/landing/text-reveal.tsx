"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 14 },
  },
};

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  trigger?: "mount" | "viewport";
  highlightWord?: string;
  highlightClassName?: string;
  delay?: number;
}

export function TextReveal({
  text,
  className,
  as: Tag = "h2",
  trigger = "viewport",
  highlightWord,
  highlightClassName = "text-accent",
  delay = 0,
}: TextRevealProps) {
  const words = text.split(" ");

  const containerProps =
    trigger === "mount"
      ? { initial: "hidden" as const, animate: "visible" as const }
      : {
          initial: "hidden" as const,
          whileInView: "visible" as const,
          viewport: { once: true, margin: "-10%" },
        };

  // Create container variants with custom delay
  const variants =
    delay > 0
      ? {
          ...containerVariants,
          visible: {
            transition: { staggerChildren: 0.08, delayChildren: delay },
          },
        }
      : containerVariants;

  return (
    <motion.div variants={variants} {...containerProps} className="overflow-hidden">
      <Tag className={cn(className)}>
        {words.map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            variants={wordVariants}
            className={cn(
              "inline-block mr-[0.25em]",
              highlightWord &&
                word.toLowerCase().includes(highlightWord.toLowerCase()) &&
                highlightClassName,
            )}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    </motion.div>
  );
}
