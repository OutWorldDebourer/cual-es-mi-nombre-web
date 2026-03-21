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
  ArrowRight,
} from "lucide-react";
import { CountUp } from "@/components/dashboard/count-up";
import { OnboardingStepper } from "@/components/dashboard/onboarding-stepper";
import {
  RecentActivity,
  type ActivityItem,
} from "@/components/dashboard/recent-activity";
import { getAuthUser, getProfile } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await getProfile(user.id);

  // Fetch recent activity in parallel (needs its own client for non-cached queries)
  const supabase = await createClient();
  const [recentNotes, recentReminders, recentCredits] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("reminders")
      .select("id, content, status, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("credit_transactions")
      .select("id, amount, action, description, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  // Normalize into unified activity items
  const activityItems: ActivityItem[] = [];

  for (const note of recentNotes.data ?? []) {
    activityItems.push({
      id: `note-${note.id}`,
      type: "note",
      title: note.title || "Nota sin título",
      detail: note.content.length > 60 ? note.content.slice(0, 60) + "..." : note.content,
      timestamp: note.created_at,
    });
  }

  for (const rem of recentReminders.data ?? []) {
    const statusLabel =
      rem.status === "sent" ? "entregado" :
      rem.status === "failed" ? "fallido" :
      "pendiente";
    activityItems.push({
      id: `rem-${rem.id}`,
      type: "reminder",
      title: rem.content.length > 50 ? rem.content.slice(0, 50) + "..." : rem.content,
      detail: `Recordatorio ${statusLabel}`,
      timestamp: rem.created_at,
    });
  }

  for (const tx of recentCredits.data ?? []) {
    activityItems.push({
      id: `tx-${tx.id}`,
      type: "credit",
      title: tx.description || (tx.action === "credit" ? "Créditos añadidos" : "Créditos usados"),
      detail: `${tx.action === "credit" ? "+" : ""}${tx.amount} créditos`,
      timestamp: tx.created_at,
    });
  }

  // Sort by timestamp descending, take top 6
  activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivity = activityItems.slice(0, 6);

  const displayName = profile?.display_name as string | null;
  const assistantName = profile?.assistant_name ?? "Asistente";
  const plan = profile?.plan ?? "free";
  const credits = profile?.credits_remaining ?? 0;
  const hasPhone = !!profile?.phone_number;
  const hasGoogle = !!profile?.google_token_vault_id;
  const hasCustomName = assistantName !== "Asistente";
  // "Usuario" is the default set by the handle_new_user trigger (009_triggers.sql)
  // when WhatsApp doesn't provide a contact name — treat it as "not set"
  const hasDisplayName = !!displayName && displayName !== "Usuario";
  const onboarding = profile?.onboarding_status ?? "new";

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {hasDisplayName
            ? `Hola ${displayName}, soy ${assistantName}`
            : `Hola, soy ${assistantName}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui tienes el resumen de tu asistente virtual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Credits */}
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Creditos restantes</CardDescription>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-4xl tabular-nums">
              <CountUp end={credits} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Plan <span className="capitalize font-medium text-foreground">{plan}</span>
            </p>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
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
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
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
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
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

      {/* Onboarding stepper */}
      {onboarding !== "completed" && (
        <OnboardingStepper
          hasPhone={hasPhone}
          hasDisplayName={hasDisplayName}
          hasCustomName={hasCustomName}
          hasGoogle={hasGoogle}
          hasPaidPlan={plan !== "free"}
        />
      )}

      {/* Recent activity */}
      <RecentActivity items={recentActivity} />
    </div>
  );
}
