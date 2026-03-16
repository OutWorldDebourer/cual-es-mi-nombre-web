import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Coins,
  Gem,
  MessageCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Rocket,
  ArrowRight,
} from "lucide-react";

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
        <h1 className="text-3xl font-bold tracking-tight">
          Hola, soy {assistantName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui tienes el resumen de tu asistente virtual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Credits */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Creditos restantes</CardDescription>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-4xl tabular-nums">{credits}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Plan <span className="capitalize font-medium text-foreground">{plan}</span>
            </p>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Plan actual</CardDescription>
              <Gem className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl capitalize">{plan}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {plan === "free" ? (
                <Link href="/dashboard/plans" className="text-primary hover:underline inline-flex items-center gap-1">
                  Actualiza para mas creditos <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                "Suscripcion activa"
              )}
            </p>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>WhatsApp</CardDescription>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {hasPhone ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Vinculado
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  No vinculado
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {hasPhone ? (
                profile?.phone_number
              ) : (
                <Link href="/dashboard/settings/whatsapp" className="text-primary hover:underline inline-flex items-center gap-1">
                  Vincular numero <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Google Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Google Calendar</CardDescription>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {hasGoogle ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Conectado
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  No conectado
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {hasGoogle ? (
                "Sincronizacion activa"
              ) : (
                <Link href="/dashboard/settings/google" className="text-primary hover:underline inline-flex items-center gap-1">
                  Conectar calendario <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding notice */}
      {onboarding !== "completed" && (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Rocket className="h-5 w-5 text-warning" />
              Completa tu configuracion
            </CardTitle>
            <CardDescription>
              {!hasPhone &&
                "Vincula tu numero de WhatsApp para empezar a usar el asistente. "}
              {!hasGoogle &&
                "Conecta Google Calendar para gestionar tus eventos. "}
              {plan === "free" &&
                "Suscribete a un plan para obtener mas creditos."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
