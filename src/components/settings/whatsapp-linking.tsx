/**
 * WhatsApp Linking Component — "Cuál es mi nombre" Web
 *
 * Client component that handles the full WhatsApp linking lifecycle:
 * - Shows current linked number if one exists
 * - Phone input → verification code → success flow for new/changed numbers
 *
 * @module components/settings/whatsapp-linking
 */

"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { backendApi, ApiError } from "@/lib/api";
import { isValidE164 } from "@/lib/phone-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PhoneInput } from "@/components/auth/phone-input";
import { Badge } from "@/components/ui/badge";
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

type Step = "linked" | "phone" | "code" | "success";

interface WhatsAppLinkingProps {
  currentPhone: string | null;
}

/**
 * Format an E.164 phone number for display.
 * Groups digits after the country code in chunks of 3.
 *
 * @example formatPhoneDisplay("+51942961598") → "+51 942 961 598"
 */
function formatPhoneDisplay(phone: string): string {
  // Find where the country code ends (1-4 digits after '+')
  const match = phone.match(/^(\+\d{1,4})(\d+)$/);
  if (!match) return phone;
  const [, countryCode, national] = match;
  const groups = national.match(/.{1,3}/g) ?? [national];
  return `${countryCode} ${groups.join(" ")}`;
}

export function WhatsAppLinking({ currentPhone }: WhatsAppLinkingProps) {
  const initialStep: Step = currentPhone ? "linked" : "phone";
  const [step, setStep] = useState<Step>(initialStep);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const supabase = createClient();
  const api = useMemo(() => backendApi(supabase), [supabase]);

  function handlePhoneChange(e164: string) {
    setPhone(e164);
  }

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidE164(phone)) {
      setError("Ingresa un número de teléfono válido.");
      return;
    }
    setShowConfirm(true);
  }

  async function handleSendCode() {
    setShowConfirm(false);
    setLoading(true);

    try {
      await api.whatsapp.sendCode(phone);
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

  // ── Linked state: show current number ─────────────────────────────────

  if (step === "linked" && currentPhone) {
    return (
      <div className="space-y-6 stagger-children">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp</h1>
          <p className="text-muted-foreground mt-1">
            Tu número de WhatsApp vinculado al asistente.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tu número de WhatsApp</CardTitle>
            <CardDescription>
              Este es el número con el que puedes interactuar con el asistente y
              también iniciar sesión en la web.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-mono">
                {formatPhoneDisplay(currentPhone)}
              </span>
              <Badge className="bg-success/15 text-success">
                Vinculado
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStep("phone");
                setError(null);
              }}
            >
              Cambiar número
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div className="space-y-6 stagger-children">
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp</h1>
        <Card>
          <CardHeader>
            <CardTitle><span aria-hidden="true">✅</span> WhatsApp vinculado</CardTitle>
            <CardDescription>
              Tu número {phone} ha sido vinculado exitosamente. Ya puedes usar
              el asistente desde WhatsApp.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ── Phone / Code flow ─────────────────────────────────────────────────

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {currentPhone ? "Cambiar número" : "Vincular WhatsApp"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {currentPhone
            ? "Vincula un nuevo número de WhatsApp para reemplazar el actual."
            : "Vincula tu número de WhatsApp para usar el asistente por chat."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === "phone" ? "Paso 1: Tu número" : "Paso 2: Código de verificación"}
          </CardTitle>
          <CardDescription>
            {step === "phone"
              ? "Selecciona tu país e ingresa tu número de WhatsApp"
              : `Te enviamos un código de 6 dígitos al ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="wa-phone">Número de WhatsApp</Label>
                <PhoneInput
                  id="wa-phone"
                  onChange={handlePhoneChange}
                  aria-invalid={!!error}
                />
              </div>

              <FormError message={error} />

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} loading={loading}>
                  {loading ? "Enviando..." : "Enviar código"}
                </Button>
                {currentPhone && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep("linked");
                      setError(null);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
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
                <Button type="submit" disabled={loading} loading={loading}>
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

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambio de número de inicio de sesión</AlertDialogTitle>
            <AlertDialogDescription>
              Al vincular un nuevo número de WhatsApp, este también se convertirá
              en tu número de inicio de sesión en la web. Si ya tenías un número
              vinculado, el anterior dejará de funcionar para iniciar sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendCode}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
