"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Brand mark */}
        <div className="flex justify-center">
          <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Sparkles className="size-8 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Algo salió mal
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Ocurrió un error inesperado. Intenta de nuevo o vuelve al inicio.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/60 font-mono">
              Ref: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button size="lg" className="gap-2" onClick={reset}>
            <RefreshCw className="size-4" />
            Intentar de nuevo
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/dashboard">
              <Home className="size-4" />
              Ir al dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
