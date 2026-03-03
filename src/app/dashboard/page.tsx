/**
 * Dashboard Home Page — "Cuál es mi nombre" Web
 *
 * Shows a summary: credits remaining, current plan, WhatsApp status,
 * Google Calendar connection status.
 *
 * @module app/dashboard/page
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const assistantName = profile?.assistant_name ?? "Asistente";
  const plan = profile?.plan ?? "free";
  const credits = profile?.credits_remaining ?? 0;
  const hasPhone = !!profile?.phone_number;
  const hasGoogle = !!profile?.google_token_vault_id;
  const onboarding = profile?.onboarding_status ?? "new";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Hola, soy {assistantName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí tienes el resumen de tu asistente virtual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Credits */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Créditos restantes</CardDescription>
            <CardTitle className="text-4xl">{credits}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Plan{" "}
              <span className="capitalize font-medium">{plan}</span>
            </p>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan actual</CardDescription>
            <CardTitle className="text-2xl capitalize">{plan}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {plan === "free"
                ? "Actualiza para más créditos"
                : "Suscripción activa"}
            </p>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>WhatsApp</CardDescription>
            <CardTitle className="text-2xl">
              {hasPhone ? "✅ Vinculado" : "❌ No vinculado"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {hasPhone
                ? profile?.phone_number
                : "Vincula tu número en Configuración"}
            </p>
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Google Calendar</CardDescription>
            <CardTitle className="text-2xl">
              {hasGoogle ? "✅ Conectado" : "❌ No conectado"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {hasGoogle
                ? "Sincronización activa"
                : "Conecta en Configuración"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding notice */}
      {onboarding !== "completed" && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-lg">
              🚀 Completa tu configuración
            </CardTitle>
            <CardDescription>
              {!hasPhone &&
                "Vincula tu número de WhatsApp para empezar a usar el asistente. "}
              {!hasGoogle &&
                "Conecta Google Calendar para gestionar tus eventos. "}
              {plan === "free" &&
                "Suscríbete a un plan para obtener más créditos."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
