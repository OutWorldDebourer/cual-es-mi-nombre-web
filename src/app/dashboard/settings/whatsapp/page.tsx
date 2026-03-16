/**
 * WhatsApp Linking Page — "Cuál es mi nombre" Web
 *
 * Allows users to link their WhatsApp number.
 * Flow: User enters phone → Backend sends 6-digit code via WA → User confirms code.
 *
 * Auth: Uses JWT auth via `backendApi` helper (Authorization: Bearer <token>).
 * The user_id is NEVER sent in the request body — it's extracted from the
 * JWT on the backend side via `get_current_user_id` dependency.
 *
 * Routes:
 *   POST /auth/verify-whatsapp/send-code  — request verification code
 *   POST /auth/verify-whatsapp/confirm    — submit code to link phone
 *
 * @module app/dashboard/settings/whatsapp/page
 */

"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { backendApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Step = "phone" | "code" | "success";

/**
 * Normalize a phone input to E.164 format.
 * Strips spaces, dashes, and parentheses. Ensures leading '+'.
 *
 * Examples:
 *   "+51 942 961 598" → "+51942961598"
 *   "51942961598"     → "+51942961598"
 *   "+51-942-961-598" → "+51942961598"
 */
function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[\s\-().]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export default function WhatsAppPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const api = useMemo(() => backendApi(supabase), [supabase]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const normalizedPhone = normalizePhone(phone);
      await api.whatsapp.sendCode(normalizedPhone);
      setPhone(normalizedPhone);
      setStep("code");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError("Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.whatsapp.confirmCode(code);
      setStep("success");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError("Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="space-y-6 stagger-children">
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
    <div className="space-y-6 stagger-children">
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
                  pattern="[+]?[0-9\s\-]{8,20}"
                  title="Ingresa un número válido con código de país (ej: +51987654321)"
                />
              </div>

              <FormError message={error} />

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

              <FormError message={error} />

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
