"use client";

import { useEffect, useState } from "react";

type ApiHealthStatus = "checking" | "healthy" | "unreachable" | "unconfigured";

/**
 * Lightweight health-check hook that pings the backend on mount.
 * Returns the API status so the dashboard can show a warning banner if needed.
 */
export function useApiHealth(): ApiHealthStatus {
  const [status, setStatus] = useState<ApiHealthStatus>("checking");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    if (!apiUrl) {
      setStatus("unconfigured");
      return;
    }

    const controller = new AbortController();

    fetch(`${apiUrl}/health`, {
      method: "GET",
      signal: controller.signal,
    })
      .then((res) => {
        setStatus(res.ok ? "healthy" : "unreachable");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setStatus("unreachable");
        }
      });

    return () => controller.abort();
  }, []);

  return status;
}
