"use client";

import { useEffect, useState } from "react";

type ApiHealthStatus = "checking" | "healthy" | "unreachable" | "unconfigured";

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

/**
 * Lightweight health-check hook that pings the backend on mount.
 * Retries up to MAX_RETRIES times before reporting unreachable,
 * preventing false positives from transient network issues.
 */
function getInitialStatus(): ApiHealthStatus {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  return apiUrl ? "checking" : "unconfigured";
}

export function useApiHealth(): ApiHealthStatus {
  const [status, setStatus] = useState<ApiHealthStatus>(getInitialStatus);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    if (!apiUrl) return;

    let cancelled = false;

    async function check() {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) return;

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(`${apiUrl}/health`, {
            method: "GET",
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (!cancelled) {
            setStatus(res.ok ? "healthy" : "unreachable");
            return;
          }
          return;
        } catch {
          // Last attempt failed — report unreachable
          if (attempt === MAX_RETRIES) {
            if (!cancelled) setStatus("unreachable");
            return;
          }
          // Wait before retry
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
