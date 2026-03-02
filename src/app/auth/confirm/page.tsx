/**
 * Email Confirmation Page — "Cuál es mi nombre" Web
 *
 * Shown after signup to tell the user to check their email.
 *
 * @module app/auth/confirm/page
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Revisa tu email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Te hemos enviado un enlace de confirmación a tu correo electrónico.
            Haz clic en el enlace para activar tu cuenta.
          </p>
          <p className="text-sm text-muted-foreground">
            ¿No recibiste el correo?{" "}
            <Link href="/signup" className="text-primary underline">
              Intenta registrarte de nuevo
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
