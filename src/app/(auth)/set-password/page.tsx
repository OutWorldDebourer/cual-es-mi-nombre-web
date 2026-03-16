/**
 * Set Password Page — "Cuál es mi nombre" Web
 *
 * WA-first users who have an account via WhatsApp but no web password
 * can set their first password here using phone OTP verification.
 *
 * Uses RecoveryForm with purpose="set_password".
 *
 * Supports searchParams:
 *   - phone: E.164 phone to pre-fill (validated before use)
 *   - from: "signup" shows a contextual banner
 *
 * @module app/(auth)/set-password/page
 */

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { isValidE164 } from "@/lib/phone-utils";

// ---------------------------------------------------------------------------
// Inner component — uses useSearchParams (requires Suspense boundary)
// ---------------------------------------------------------------------------

function SetPasswordContent() {
  const searchParams = useSearchParams();

  const rawPhone = searchParams.get("phone") ?? "";
  const from = searchParams.get("from");

  // Only pass phone if it's valid E.164 — prevents injection
  const initialPhone = isValidE164(rawPhone) ? rawPhone : undefined;
  const showSignupBanner = from === "signup";

  return (
    <>
      {showSignupBanner && (
        <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 text-sm mb-4">
          <p className="text-green-800 dark:text-green-200">
            Solo necesitas verificar tu número y crear una contraseña.
            Te enviaremos un código por WhatsApp.
          </p>
        </div>
      )}

      <RecoveryForm purpose="set_password" initialPhone={initialPhone} />

      <Separator className="my-6" />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes contraseña?{" "}
        <Link href="/login" className="text-primary underline">
          Iniciar sesión
        </Link>
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear Contraseña</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Crea una contraseña para acceder desde la web
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <SetPasswordContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
