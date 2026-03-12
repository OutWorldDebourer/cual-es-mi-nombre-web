/**
 * Recovery Page — "Cuál es mi nombre" Web
 *
 * Phone-based password recovery using custom OTP (backend API).
 * Uses RecoveryForm with purpose="recovery".
 *
 * @module app/(auth)/recovery/page
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RecoveryForm } from "@/components/auth/recovery-form";

export default function RecoveryPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Te enviaremos un código a tu WhatsApp
          </p>
        </CardHeader>
        <CardContent>
          <RecoveryForm purpose="recovery" />

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" className="text-primary underline">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
