/**
 * Signup Page — "Cuál es mi nombre" Web
 *
 * Phone + password registration using Supabase Auth with
 * OTP verification delivered via WhatsApp (SMS Hook).
 *
 * Multi-step flow:
 *   1. Phone + password → Supabase signUp → SMS Hook → WhatsApp OTP
 *   2. OTP verification → Supabase verifyOtp → session → /dashboard
 *
 * Server Component — renders Card shell server-side, delegates interactivity
 * to SignupForm (client component).
 *
 * @module app/(auth)/signup/page
 */

import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignupForm } from "@/components/auth/signup-form";
import { MotionReveal } from "@/components/landing/motion-reveal";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";

export default function SignupPage() {
  return (
    <MotionReveal direction="up">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Registra tu asistente virtual
          </p>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<AuthFormSkeleton />}>
            <SignupForm />
          </Suspense>

          <Separator className="my-6" />

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </MotionReveal>
  );
}
