/**
 * Login Page — "Cuál es mi nombre" Web
 *
 * Phone + password login using Supabase Auth.
 * Uses signInWithPassword({ phone, password }) for direct authentication.
 *
 * Server Component — renders Card shell server-side, delegates interactivity
 * to LoginForm (client component).
 *
 * @module app/(auth)/login/page
 */

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Accede a tu asistente virtual
        </p>
      </CardHeader>
      <CardContent>
        <LoginForm />

        <Separator className="my-6" />

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="text-primary underline">
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
