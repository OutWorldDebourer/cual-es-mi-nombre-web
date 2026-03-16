"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { backendApi } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GoogleDisconnectButton() {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const supabaseRef = useRef(createClient());
  const router = useRouter();

  async function handleDisconnect() {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres desconectar Google Calendar? "
      + "Tendrás que volver a autorizar para usar las funciones de calendario.",
    );
    if (!confirmed) return;

    setIsDisconnecting(true);

    try {
      await backendApi(supabaseRef.current).google.disconnect();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Error al desconectar. Intenta de nuevo.";
      alert(message);
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <Button
      disabled={isDisconnecting}
      onClick={handleDisconnect}
      variant="destructive"
    >
      {isDisconnecting ? "Desconectando..." : "Desconectar Google Calendar"}
    </Button>
  );
}
