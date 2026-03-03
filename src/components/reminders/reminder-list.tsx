/**
 * Reminder List Component — "Cuál es mi nombre" Web
 *
 * Client component that displays reminders organized by status.
 * Uses tabs for filtering and supports cancellation of pending reminders.
 * The reminder data is read-only from the frontend perspective —
 * reminders are created via WhatsApp agent, viewed/cancelled here.
 *
 * @module components/reminders/reminder-list
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { Reminder, ReminderStatus } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReminderListProps {
  /** Initial reminders from server-side fetch */
  initialReminders: Reminder[];
  /** User's timezone for display (IANA string from profile) */
  timezone?: string;
}

type ReminderTab = "upcoming" | "sent" | "all";

const TAB_FILTERS: Record<ReminderTab, ReminderStatus[]> = {
  upcoming: ["pending", "processing"],
  sent: ["sent"],
  all: ["pending", "processing", "sent", "failed", "cancelled"],
};

export function ReminderList({
  initialReminders,
  timezone,
}: ReminderListProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [tab, setTab] = useState<ReminderTab>("upcoming");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  // ── Fetch reminders from Supabase ──────────────────────────────────────

  const fetchReminders = useCallback(async () => {
    setIsLoading(true);
    const statuses = TAB_FILTERS[tab];
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .in("status", statuses)
      .order("trigger_at", { ascending: tab === "upcoming" });

    if (!error && data) {
      setReminders(data as Reminder[]);
    }
    setIsLoading(false);
  }, [supabase, tab]);

  useEffect(() => {
    void fetchReminders();
  }, [fetchReminders]);

  // ── Cancel handler ─────────────────────────────────────────────────────

  async function handleCancel(reminderId: string) {
    const { error } = await supabase
      .from("reminders")
      .update({ status: "cancelled" as ReminderStatus })
      .eq("id", reminderId);

    if (error) {
      console.error("Error cancelling reminder:", error.message);
      return;
    }
    // Remove from current view (it's no longer "pending")
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  }

  // ── Derived state ──────────────────────────────────────────────────────

  const count = reminders.length;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as ReminderTab)}>
        <TabsList>
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="sent">Enviados</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading */}
      {isLoading && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Cargando recordatorios...
        </p>
      )}

      {/* Empty state */}
      {!isLoading && count === 0 && (
        <div className="text-center py-12 space-y-3">
          <p className="text-4xl">🔔</p>
          <h3 className="text-lg font-medium">
            {tab === "upcoming"
              ? "No hay recordatorios próximos"
              : tab === "sent"
                ? "No hay recordatorios enviados"
                : "No hay recordatorios"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Envía un mensaje por WhatsApp como &quot;Recuérdame llamar al
            doctor mañana a las 10&quot; para crear un recordatorio.
          </p>
        </div>
      )}

      {/* Reminders list */}
      {!isLoading && count > 0 && (
        <div className="grid gap-3">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              timezone={timezone}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
