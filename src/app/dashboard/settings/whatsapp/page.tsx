/**
 * WhatsApp Settings Page — "Cuál es mi nombre" Web
 *
 * Server Component that fetches the user's current phone number
 * and renders the WhatsApp linking client component.
 *
 * @module app/dashboard/settings/whatsapp/page
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WhatsAppLinking } from "@/components/settings/whatsapp-linking";

export default async function WhatsAppPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone_number")
    .eq("id", user.id)
    .single();

  return <WhatsAppLinking currentPhone={profile?.phone_number ?? null} />;
}
