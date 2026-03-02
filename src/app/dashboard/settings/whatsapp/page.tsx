/**
 * WhatsApp Linking Page — "Cuál es mi nombre" Web
 *
 * Allows users to link their WhatsApp number.
 * Flow: User enters phone → Backend sends 6-digit code via WA → User confirms code.
 * This calls the backend Python API (POST /auth/verify-whatsapp).
 *
 * @module app/dashboard/settings/whatsapp/page
 */

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Step = "phone" | "code" | "success";

export default function WhatsAppPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Sesión expirada. Recarga la página.");
        return;
      }

      const res = await fetch(`${API_URL}/auth/verify-whatsapp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ phone_number: phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail ?? "Error al enviar el código");
        return;
      }

      setStep("code");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Sesión expirada. Recarga la página.");
        return;
      }

      const res = await fetch(`${API_URL}/auth/verify-whatsapp/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ phone_number: phone, code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail ?? "Código incorrecto");
        return;
      }

      setStep("success");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">WhatsApp</h1>
        <Card>
          <CardHeader>
            <CardTitle>✅ WhatsApp vinculado</CardTitle>
            <CardDescription>
              Tu número {phone} ha sido vinculado exitosamente. Ya puedes usar
              el asistente desde WhatsApp.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vincular WhatsApp</h1>
        <p className="text-muted-foreground mt-1">
          Vincula tu número de WhatsApp para usar el asistente por chat.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === "phone" ? "Paso 1: Tu número" : "Paso 2: Código de verificación"}
          </CardTitle>
          <CardDescription>
            {step === "phone"
              ? "Ingresa tu número de WhatsApp con código de país (ej: +51987654321)"
              : `Te enviamos un código de 6 dígitos al ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleSendCode} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+51987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  pattern="\+[0-9]{10,15}"
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Verificando..." : "Verificar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setError(null);
                  }}
                >
                  Cambiar número
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
