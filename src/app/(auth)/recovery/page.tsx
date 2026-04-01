/**
 * Recovery Page — "Cuál es mi nombre" Web
 *
 * Phone-based password recovery using custom OTP (backend API).
 * Uses RecoveryForm with purpose="recovery".
 *
 * Server Component — renders Card shell server-side, delegates interactivity
 * to RecoveryForm (client component).
 *
 * @module app/(auth)/recovery/page
 */

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { MotionReveal } from "@/components/landing/motion-reveal";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";

export default function RecoveryPage() {
  return (
    <MotionReveal direction="up">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Te enviaremos un código a tu WhatsApp
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<AuthFormSkeleton />}>
            <RecoveryForm purpose="recovery" />
          </Suspense>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" className="text-primary underline">
              Iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </MotionReveal>
  );
}
