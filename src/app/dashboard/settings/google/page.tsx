/**
 * Google Calendar Connection Page — "Cuál es mi nombre" Web
 *
 * A7.3.3 moves the page to server rendering so the dashboard re-reads the
 * canonical profile row in the same post-callback redirect cycle, instead of
 * relying on pre-existing client state.
 *
 * @module app/dashboard/settings/google/page
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  buildGoogleAuthCallbackBanner,
  isGoogleCalendarConnected,
} from "@/lib/google-auth";
import { GoogleConnectButton } from "@/components/dashboard/google-connect-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type GoogleCalendarPageProps = {
  searchParams: Promise<{
    google_auth?: string | string[] | undefined;
    reason?: string | string[] | undefined;
  }>;
};

export default async function GoogleCalendarPage(
  props: GoogleCalendarPageProps,
) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("google_token_vault_id")
    .eq("id", user.id)
    .single();

  const connected = isGoogleCalendarConnected(profile);
  const callbackBanner = buildGoogleAuthCallbackBanner(searchParams, connected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Conecta tu Google Calendar para que el asistente gestione tus eventos.
        </p>
      </div>

      {callbackBanner.tone !== "idle" && callbackBanner.title && callbackBanner.description && (
        <Card className={callbackBannerClassName(callbackBanner.tone)}>
          <CardHeader>
            <CardTitle>{callbackBanner.title}</CardTitle>
            <CardDescription className="text-current opacity-90">
              {callbackBanner.description}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {connected ? "✅ Google Calendar conectado" : "Conectar Google Calendar"}
          </CardTitle>
          <CardDescription>
            {connected
              ? "Tu calendario está sincronizado. El asistente puede crear, consultar y modificar tus eventos."
              : "Autoriza el acceso a tu Google Calendar. Solo se usará para gestionar eventos desde el asistente."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connected ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                El asistente puede crear y consultar eventos en tu calendario
                principal.
              </p>
              <GoogleConnectButton connected={connected} variant="outline" />
            </div>
          ) : (
            <GoogleConnectButton connected={connected} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function callbackBannerClassName(tone: "success" | "warning" | "error"): string {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50";
  }

  return "border-red-200 bg-red-50";
}
