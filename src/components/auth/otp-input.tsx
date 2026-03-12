/**
 * OTP Input Component — 6-digit verification code input
 *
 * Individual digit inputs with auto-advance, backspace navigation,
 * paste support, and completion callback. Used in phone verification
 * and password recovery flows (FA8).
 *
 * Also exports `useOTPTimer` hook for countdown logic.
 *
 * @module components/auth/otp-input
 */

"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OTPInputProps {
  /** Number of digit slots (default 6) */
  length?: number;
  /** Current OTP value (controlled). String of digits, e.g. "12" or "123456" */
  value?: string;
  /** Called with the current OTP string on every change */
  onChange?: (otp: string) => void;
  /** Called when all digits are filled */
  onComplete?: (otp: string) => void;
  /** Disable all inputs */
  disabled?: boolean;
  /** Auto-focus the first input on mount */
  autoFocus?: boolean;
  /** aria-invalid for error state styling */
  "aria-invalid"?: boolean;
  /** Additional class names for the outer wrapper */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_LENGTH = 6;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** Parse a value string into a padded array of single-char digits. */
function parseDigits(val: string | undefined, len: number): string[] {
  const d = (val ?? "").split("").slice(0, len);
  while (d.length < len) d.push("");
  return d;
}

export function OTPInput({
  length = DEFAULT_LENGTH,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  "aria-invalid": ariaInvalid,
  className,
}: OTPInputProps) {
  // Internal state — supports both controlled and uncontrolled usage.
  const [digits, setDigits] = useState<string[]>(() =>
    parseDigits(value, length),
  );

  // Track last value we emitted so we can distinguish external changes.
  const lastEmittedRef = useRef<string | undefined>(undefined);

  // Sync from external value prop (e.g. parent clears the OTP).
  useEffect(() => {
    if (value !== undefined && value !== lastEmittedRef.current) {
      setDigits(parseDigits(value, length));
    }
  }, [value, length]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Auto-focus on mount -------------------------------------------------

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // --- Helpers -------------------------------------------------------------

  const focusInput = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, length - 1));
      inputRefs.current[clamped]?.focus();
    },
    [length],
  );

  const updateDigits = useCallback(
    (newDigits: string[]) => {
      setDigits(newDigits);
      const otp = newDigits.join("");
      lastEmittedRef.current = otp;
      onChange?.(otp);
      if (otp.length === length && newDigits.every((d) => d !== "")) {
        onComplete?.(otp);
      }
    },
    [onChange, onComplete, length],
  );

  // --- Handlers ------------------------------------------------------------

  function handleInput(index: number, inputValue: string) {
    // Only accept a single digit
    const digit = inputValue.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const newDigits = [...digits];
    newDigits[index] = digit;
    updateDigits(newDigits);

    // Auto-advance to next input
    if (index < length - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "Backspace": {
        e.preventDefault();
        const newDigits = [...digits];
        if (digits[index]) {
          // Clear current digit
          newDigits[index] = "";
          updateDigits(newDigits);
        } else if (index > 0) {
          // Move to previous and clear it
          newDigits[index - 1] = "";
          updateDigits(newDigits);
          focusInput(index - 1);
        }
        break;
      }
      case "ArrowLeft":
        e.preventDefault();
        focusInput(index - 1);
        break;
      case "ArrowRight":
        e.preventDefault();
        focusInput(index + 1);
        break;
      case "Delete": {
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index] = "";
        updateDigits(newDigits);
        break;
      }
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (!pasted) return;

    const newDigits = [...digits];
    const chars = pasted.slice(0, length).split("");
    for (let i = 0; i < chars.length; i++) {
      newDigits[i] = chars[i];
    }
    updateDigits(newDigits);

    // Focus the input after the last pasted digit, or the last input
    const nextIndex = Math.min(chars.length, length - 1);
    focusInput(nextIndex);
  }

  // --- Render --------------------------------------------------------------

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="group"
      aria-label="Código de verificación"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={digit}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-label={`Dígito ${index + 1} de ${length}`}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-10 rounded-md border border-input bg-transparent text-center text-lg font-semibold shadow-xs transition-[color,box-shadow] outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
            ariaInvalid &&
              "border-destructive ring-destructive/20 dark:ring-destructive/40",
          )}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// useOTPTimer Hook
// ---------------------------------------------------------------------------

export interface UseOTPTimerOptions {
  /** Countdown duration in seconds (default 60) */
  initialSeconds?: number;
  /** Start counting immediately (default true) */
  autoStart?: boolean;
}

export interface UseOTPTimerReturn {
  /** Remaining seconds */
  seconds: number;
  /** Whether the timer is actively counting down */
  isActive: boolean;
  /** Restart the timer from the initial value */
  restart: () => void;
  /** Formatted time string, e.g. "1:30" or "0:05" */
  formatTime: () => string;
}

export function useOTPTimer({
  initialSeconds = 60,
  autoStart = true,
}: UseOTPTimerOptions = {}): UseOTPTimerReturn {
  const [seconds, setSeconds] = useState(autoStart ? initialSeconds : 0);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    if (!isActive || seconds <= 0) {
      if (isActive && seconds <= 0) setIsActive(false);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const restart = useCallback(() => {
    setSeconds(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const formatTime = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [seconds]);

  return { seconds, isActive, restart, formatTime };
}
