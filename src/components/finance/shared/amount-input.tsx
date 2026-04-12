"use client";

import { useCallback, type ChangeEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const amountInputVariants = cva(
  "flex items-center rounded-md border transition-all focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "border-input bg-transparent dark:bg-input/30",
        income:
          "border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/30",
        expense:
          "border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-950/30",
      },
      size: {
        sm: "h-8 text-sm",
        md: "h-11 text-base md:text-sm",
        lg: "h-14 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const prefixSizeMap = {
  sm: "px-2 text-sm",
  md: "px-3 text-base md:text-sm",
  lg: "px-4 text-lg",
} as const;

const prefixVariantMap = {
  default: "text-muted-foreground",
  income: "text-emerald-600 dark:text-emerald-400",
  expense: "text-red-600 dark:text-red-400",
} as const;

interface AmountInputProps extends VariantProps<typeof amountInputVariants> {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/** Numeric-only currency input with colored variants for income/expense. */
export function AmountInput({
  value,
  onChange,
  currency = "S/",
  size = "md",
  variant = "default",
  placeholder = "0.00",
  disabled = false,
  className,
  id,
}: AmountInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow digits, one decimal point, up to 2 decimal places
      if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)) {
        onChange(raw);
      }
    },
    [onChange]
  );

  const resolvedSize = size ?? "md";
  const resolvedVariant = variant ?? "default";

  return (
    <div
      className={cn(
        amountInputVariants({ variant: resolvedVariant, size: resolvedSize }),
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <span
        className={cn(
          "shrink-0 select-none font-medium",
          prefixSizeMap[resolvedSize],
          prefixVariantMap[resolvedVariant]
        )}
      >
        {currency}
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full min-w-0 bg-transparent pr-3 font-semibold tabular-nums outline-none",
          "placeholder:font-normal placeholder:text-muted-foreground"
        )}
        aria-label={`Monto en ${currency}`}
      />
    </div>
  );
}
