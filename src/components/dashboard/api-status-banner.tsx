"use client";

import { AlertTriangle, WifiOff } from "lucide-react";
import { useApiHealth } from "@/hooks/use-api-health";

/**
 * Optional banner that warns users when the backend API is unreachable.
 * Renders nothing when the API is healthy or still checking.
 */
export function ApiStatusBanner() {
  const status = useApiHealth();

  if (status === "checking" || status === "healthy") return null;

  const isUnconfigured = status === "unconfigured";

  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-[fade-in-up_0.3s_ease-out_both]"
    >
      {isUnconfigured ? (
        <AlertTriangle className="size-4 shrink-0" />
      ) : (
        <WifiOff className="size-4 shrink-0" />
      )}
      <p>
        {isUnconfigured
          ? "Backend no configurado. Algunas funciones no estarán disponibles."
          : "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo."}
      </p>
    </div>
  );
}
