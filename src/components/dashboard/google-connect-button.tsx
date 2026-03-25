"use client";

import { useRef, useState } from "react";
import type { ComponentProps } from "react";
import { backendApi } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

interface GoogleConnectButtonProps {
  connected: boolean;
  variant?: ButtonVariant;
}

export function GoogleConnectButton({
  connected,
  variant,
}: GoogleConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const supabaseRef = useRef(createClient());

  async function handleConnect() {
    setIsConnecting(true);

    try {
      const url = await backendApi(supabaseRef.current).google.getConnectUrl();
      window.location.href = url;
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Sesión expirada. Recarga la página.";
      alert(message);
      setIsConnecting(false);
    }
  }

  return (
    <Button disabled={isConnecting} onClick={handleConnect} variant={variant}>
      {isConnecting
        ? "Abriendo Google..."
        : connected
          ? "Reconectar"
          : "Conectar con Google"}
    </Button>
  );
}