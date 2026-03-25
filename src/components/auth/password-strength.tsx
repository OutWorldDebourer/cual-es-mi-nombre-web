"use client";

import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
}

interface StrengthLevel {
  score: number;
  label: string;
  color: string;
}

const LEVELS: StrengthLevel[] = [
  { score: 0, label: "", color: "" },
  { score: 1, label: "Muy débil", color: "bg-destructive" },
  { score: 2, label: "Débil", color: "bg-warning" },
  { score: 3, label: "Buena", color: "bg-chart-4" },
  { score: 4, label: "Fuerte", color: "bg-success" },
];

function computeStrength(password: string): number {
  if (password.length === 0) return 0;
  if (password.length < 6) return 1;

  let score = 1; // base: meets minimum length
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = useMemo(() => computeStrength(password), [password]);
  const level = LEVELS[score];

  if (score === 0) return null;

  return (
    <div className="space-y-1.5 animate-[fade-in-up_0.2s_ease-out_both]">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= score ? level.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs transition-colors duration-300 ${
        score <= 1
          ? "text-destructive"
          : score === 2
            ? "text-warning-foreground"
            : score === 3
              ? "text-chart-4"
              : "text-success"
      }`}>
        {level.label}
      </p>
    </div>
  );
}
