/**
 * Settings Page — "Cuál es mi nombre" Web
 *
 * Allows users to change their assistant name and timezone.
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
  const [assistantName, setAssistantName] = useState("");
  const [timezone, setTimezone] = useState("");
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
        .select("assistant_name, timezone")
        .eq("id", user.id)
        .single();

      if (profile) {
        setAssistantName(profile.assistant_name ?? "Asistente");
        setTimezone(profile.timezone ?? "America/Lima");
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

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        assistant_name: assistantName.trim() || "Asistente",
        timezone,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      toast.success("Cambios guardados correctamente");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Personaliza tu asistente virtual.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil del asistente</CardTitle>
          <CardDescription>
            Cambia el nombre y la zona horaria de tu asistente. El nombre se usa
            en todas las conversaciones de WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
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

            <FormError message={error} />

            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
