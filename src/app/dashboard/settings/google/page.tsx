/**
 * Google Calendar Connection Page — "Cuál es mi nombre" Web
 *
 * Redirects the user to the backend OAuth2 flow for Google Calendar.
 * The backend handles the OAuth2 dance and stores the refresh token
 * in Supabase Vault.
 *
 * Auth: Uses JWT auth via `backendApi` helper.
 *
 * @module app/dashboard/settings/google/page
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { backendApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GoogleCalendarPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const api = useMemo(() => backendApi(supabase), [supabase]);

  useEffect(() => {
    async function checkConnection() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("google_token_vault_id")
        .eq("id", user.id)
        .single();

      setConnected(!!profile?.google_token_vault_id);
      setLoading(false);
    }

    checkConnection();
  }, [supabase]);

  async function handleConnect() {
    try {
      const url = await api.google.getConnectUrl();
      window.location.href = url;
    } catch {
      alert("Sesión expirada. Recarga la página.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Google Calendar</h1>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Conecta tu Google Calendar para que el asistente gestione tus eventos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {connected ? "✅ Google Calendar conectado" : "Conectar Google Calendar"}
          </CardTitle>
          <CardDescription>
            {connected
              ? "Tu calendario está sincronizado. El asistente puede crear, consultar y modificar tus eventos."
              : "Autoriza el acceso a tu Google Calendar. Solo se usará para gestionar eventos desde el asistente."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                El asistente puede crear y consultar eventos en tu calendario
                principal.
              </p>
              <Button variant="outline" onClick={handleConnect}>
                Reconectar
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnect}>
              Conectar con Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
