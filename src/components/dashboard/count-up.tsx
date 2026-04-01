"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface CountUpProps {
  end: number;
  duration?: number;
  /** Delay in ms before animation starts (for staggering multiple CountUps). */
  delay?: number;
  /** Text appended after the number (e.g. "%"). */
  suffix?: string;
  /** Number of decimal places to display. */
  decimals?: number;
  className?: string;
}

/**
 * Animated counter that counts from 0 to `end` when entering the viewport.
 *
 * - Easing: easeOutExpo (fast start, slow end)
 * - Duration: 2 s by default
 * - Viewport trigger via IntersectionObserver (once)
 * - Respects prefers-reduced-motion (shows final value immediately)
 * - Dynamic value changes after initial animation snap to new value
 */
export function CountUp({
  end,
  duration = 2000,
  delay = 0,
  suffix,
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!isInView || hasAnimated || prefersReducedMotion || end === 0) return;

    let rafId: number;
    const timeoutId = window.setTimeout(() => {
      const startTime = performance.now();

      function tick(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setValue(eased * end);

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setHasAnimated(true);
        }
      }

      rafId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [isInView, end, duration, delay, hasAnimated, prefersReducedMotion]);

  // After animation completes (or reduced-motion / zero): snap to end value.
  // This also handles dynamic `end` changes post-animation — no re-animation.
  const displayValue =
    prefersReducedMotion || hasAnimated || end === 0 ? end : value;

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toString();

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}
