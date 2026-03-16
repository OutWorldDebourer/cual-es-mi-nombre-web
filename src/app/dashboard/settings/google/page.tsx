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
import { GoogleDisconnectButton } from "@/components/dashboard/google-disconnect-button";
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
    <div className="space-y-6 stagger-children">
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
              <div className="flex gap-3">
                <GoogleConnectButton connected={connected} variant="outline" />
                <GoogleDisconnectButton />
              </div>
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
    return "border-success/40 bg-success/5";
  }

  if (tone === "warning") {
    return "border-warning/40 bg-warning/5";
  }

  return "border-destructive/40 bg-destructive/5";
}
