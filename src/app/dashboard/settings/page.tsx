/**
 * Settings Page — "Cuál es mi nombre" Web
 *
 * Allows users to change their display name, assistant name, timezone,
 * and message wait seconds.
 * Writes directly to Supabase (RLS protects — user can only update own profile).
 *
 * @module app/dashboard/settings/page
 */

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Common LATAM timezones
const TIMEZONES = [
  "America/Lima",
  "America/Bogota",
  "America/Mexico_City",
  "America/Santiago",
  "America/Buenos_Aires",
  "America/Sao_Paulo",
  "America/Guayaquil",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/Madrid",
  "UTC",
];

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [assistantName, setAssistantName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [messageWaitSeconds, setMessageWaitSeconds] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, assistant_name, timezone, message_wait_seconds")
        .eq("id", user.id)
        .single();

      if (profile) {
        const raw = profile.display_name ?? "";
        setDisplayName(raw === "Usuario" ? "" : raw);
        setAssistantName(profile.assistant_name ?? "Asistente");
        setTimezone(profile.timezone ?? "America/Lima");
        setMessageWaitSeconds(profile.message_wait_seconds ?? 3);
      }
    }

    loadProfile();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("No se encontró la sesión");
      setLoading(false);
      return;
    }

    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName.length > 50) {
      setError("El nombre no puede tener más de 50 caracteres.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: trimmedDisplayName || null,
        assistant_name: assistantName.trim() || "Asistente",
        timezone,
        message_wait_seconds: messageWaitSeconds,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } else {
      toast.success("Cambios guardados correctamente");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Personaliza tu perfil y tu asistente virtual.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tu perfil</CardTitle>
            <CardDescription>
              Cómo tu asistente se referirá a ti en las conversaciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-md">
            <div className="space-y-2">
              <Label htmlFor="displayName">Tu nombre</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={(e) => setDisplayName(e.target.value.trim())}
                placeholder="Ej: María, Carlos, Ana..."
                maxLength={50}
                autoComplete="given-name"
              />
              <p className="text-xs text-muted-foreground">
                Tu asistente te llamará por este nombre.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perfil del asistente</CardTitle>
            <CardDescription>
              Cambia el nombre y la zona horaria de tu asistente. El nombre se
              usa en todas las conversaciones de WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="assistantName">Nombre del asistente</Label>
              <Input
                id="assistantName"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="Luna, Max, Aria..."
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Tu asistente se presentará con este nombre.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="h-10">
                  <SelectValue placeholder="Selecciona zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se usa para programar recordatorios y eventos del calendario.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageWait">
                Tiempo de espera por mensaje
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="messageWait"
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={messageWaitSeconds}
                  onChange={(e) =>
                    setMessageWaitSeconds(Number(e.target.value))
                  }
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">
                  {messageWaitSeconds}s
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cuántos segundos esperar antes de procesar tu mensaje, para
                concatenar mensajes consecutivos. 0 = respuesta inmediata.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-md">
          <FormError message={error} />
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
