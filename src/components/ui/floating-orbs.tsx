"use client";

import { cn } from "@/lib/utils";

interface FloatingOrbsProps {
  count?: 2 | 3 | 4;
  className?: string;
}

const ORB_PRESETS = [
  {
    // Top-left — primary accent, large
    className:
      "-top-24 left-1/4 w-[400px] h-[400px] bg-accent/10 blur-[60px] md:blur-[100px]",
    animation: "float-orb-1 18s ease-in-out infinite",
  },
  {
    // Bottom-right — accent tone
    className:
      "-bottom-24 right-1/4 w-[350px] h-[350px] bg-accent/10 blur-[60px] md:blur-[80px]",
    animation: "float-orb-2 22s ease-in-out infinite",
  },
  {
    // Center-left — subtle primary, staggered start
    className:
      "top-1/3 -left-16 w-[300px] h-[300px] bg-accent/[0.05] blur-[60px] md:blur-[90px]",
    animation: "float-orb-1 18s ease-in-out 4s infinite",
  },
  {
    // Lower-center — large, very subtle accent
    className:
      "bottom-1/4 right-1/3 w-[500px] h-[500px] bg-accent/[0.05] blur-[60px] md:blur-[120px]",
    animation: "float-orb-2 22s ease-in-out 6s infinite",
  },
];

export function FloatingOrbs({ count = 3, className }: FloatingOrbsProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      {ORB_PRESETS.slice(0, count).map((orb, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full will-change-transform",
            orb.className,
          )}
          style={{ animation: orb.animation }}
        />
      ))}
    </div>
  );
}
