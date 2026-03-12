/**
 * Set Password Page — "Cuál es mi nombre" Web
 *
 * WA-first users who have an account via WhatsApp but no web password
 * can set their first password here using phone OTP verification.
 *
 * Uses RecoveryForm with purpose="set_password".
 *
 * @module app/(auth)/set-password/page
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RecoveryForm } from "@/components/auth/recovery-form";

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
          <RecoveryForm purpose="set_password" />

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes contraseña?{" "}
            <Link href="/login" className="text-primary underline">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
