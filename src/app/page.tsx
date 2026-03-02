/**
 * Root Page — "Cuál es mi nombre" Web
 *
 * Landing page that redirects authenticated users to /dashboard
 * or shows a simple CTA for unauthenticated visitors.
 *
 * @module app/page
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          ¿Cuál es mi nombre?
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Tu asistente virtual para WhatsApp. Gestiona tu calendario, notas y
          recordatorios con inteligencia artificial.
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/login">
          <Button size="lg">Iniciar Sesión</Button>
        </Link>
        <Link href="/signup">
          <Button size="lg" variant="outline">
            Crear Cuenta
          </Button>
        </Link>
      </div>
    </div>
  );
}
