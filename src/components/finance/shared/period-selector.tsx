"use client";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type PeriodValue = "day" | "week" | "biweekly" | "month" | "year";

interface PeriodOption {
  value: PeriodValue;
  label: string;
}

const PERIODS: PeriodOption[] = [
  { value: "day", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "biweekly", label: "Quincena" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];

interface PeriodSelectorProps {
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
  className?: string;
}

/** Horizontal period pill selector backed by shadcn Tabs. */
export function PeriodSelector({
  value,
  onChange,
  className,
}: PeriodSelectorProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as PeriodValue)}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full">
        {PERIODS.map((period) => (
          <TabsTrigger
            key={period.value}
            value={period.value}
            className="flex-1 text-xs sm:text-sm"
          >
            {period.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
