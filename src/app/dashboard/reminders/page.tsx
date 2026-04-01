/**
 * Reminders Page — "Cuál es mi nombre" Web Dashboard
 *
 * Server Component that fetches upcoming reminders and renders
 * the ReminderList client component for interactive management.
 *
 * Route: /dashboard/reminders
 *
 * @module app/dashboard/reminders/page
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReminderList } from "@/components/reminders/reminder-list";
import type { Reminder } from "@/types/database";

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const params = await searchParams;
  const autoCreate = params.action === "new";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile for timezone
  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  // Fetch upcoming reminders (pending/processing), ordered by trigger time
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .in("status", ["pending", "processing"])
    .order("trigger_at", { ascending: true });

  return (
    <div className="space-y-6 stagger-children">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recordatorios</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus recordatorios desde aquí o por WhatsApp.
        </p>
      </div>
      <ReminderList
        initialReminders={(reminders as Reminder[]) ?? []}
        timezone={profile?.timezone}
        autoCreate={autoCreate}
      />
    </div>
  );
}
