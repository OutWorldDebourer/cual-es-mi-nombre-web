"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
}

/**
 * Animated counter that counts from 0 to `end` over `duration` ms.
 * Uses requestAnimationFrame for smooth 60fps animation.
 */
export function CountUp({ end, duration = 800, className }: CountUpProps) {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (end === 0 || hasAnimated) return;

    const start = performance.now();
    let rafId: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setHasAnimated(true);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [end, duration, hasAnimated]);

  // After animation completes or for zero, show end directly
  const displayValue = hasAnimated || end === 0 ? end : value;

  return <span ref={ref} className={className}>{displayValue}</span>;
}
