/**
 * Reminder List Component — "Cuál es mi nombre" Web
 *
 * Client component that manages the full reminders CRUD lifecycle:
 * - Fetches reminders from Supabase (RLS ensures user isolation)
 * - Search / filter by status tabs
 * - Create, edit, cancel, cancel series, and delete reminders
 *
 * @module components/reminders/reminder-list
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Reminder, ReminderStatus } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/hooks/use-realtime-table";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { ReminderForm } from "@/components/reminders/reminder-form";
import { ReminderViewDialog } from "@/components/reminders/reminder-view-dialog";
import type { ReminderFormData } from "@/components/reminders/reminder-form";
import { RemindersListSkeleton } from "@/components/skeletons/reminder-card-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, X } from "lucide-react";

interface ReminderListProps {
  initialReminders: Reminder[];
  timezone?: string;
  /** Auto-open the create form (from ?action=new) */
  autoCreate?: boolean;
}

type ReminderTab = "upcoming" | "recurring" | "sent" | "all";

const TAB_FILTERS: Record<ReminderTab, (r: Reminder) => boolean> = {
  upcoming: (r) => ["pending", "processing"].includes(r.status),
  recurring: (r) => r.is_recurring && ["pending", "processing"].includes(r.status),
  sent: (r) => r.status === "sent",
  all: () => true,
};

const TAB_STATUSES: Record<ReminderTab, ReminderStatus[]> = {
  upcoming: ["pending", "processing"],
  recurring: ["pending", "processing"],
  sent: ["sent"],
  all: ["pending", "processing", "sent", "failed", "cancelled"],
};

export function ReminderList({
  initialReminders,
  timezone,
  autoCreate,
}: ReminderListProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [tab, setTab] = useState<ReminderTab>("upcoming");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(!!autoCreate);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [viewingReminder, setViewingReminder] = useState<Reminder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchRef = useRef(0);
  const pendingDeleteRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const supabase = createClient();

  // ── Fetch reminders from Supabase ──────────────────────────────────────

  const fetchReminders = useCallback(async (currentTab: ReminderTab, silent = false) => {
    lastFetchRef.current = Date.now();
    const statuses = TAB_STATUSES[currentTab];
    let query = supabase
      .from("reminders")
      .select("*")
      .in("status", statuses)
      .order("trigger_at", { ascending: currentTab === "upcoming" || currentTab === "recurring" });

    if (currentTab === "recurring") {
      query = query.eq("is_recurring", true);
    }

    const { data, error } = await query;

    if (error) {
      if (!silent) toast.error("Error al cargar recordatorios");
    } else if (data) {
      const pending = pendingDeleteRef.current;
      setReminders(
        pending.size > 0
          ? (data as Reminder[]).filter((r) => !pending.has(r.id))
          : (data as Reminder[]),
      );
    }
    if (!silent) setIsLoading(false);
  }, [supabase]);

  // Silent refetch on Realtime events (no skeleton, dedup with manual fetches)
  const realtimeFetch = useCallback(() => {
    if (Date.now() - lastFetchRef.current < 500) return;
    void fetchReminders(tab, true);
  }, [fetchReminders, tab]);

  useRealtimeTable("reminders", realtimeFetch);

  // ── CRUD handlers ─────────────────────────────────────────────────────

  async function handleCreate(data: ReminderFormData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión expirada");

    const { error } = await supabase.from("reminders").insert({
      profile_id: user.id,
      content: data.content,
      trigger_at: data.trigger_at,
      channel: "web",
      status: "pending",
      is_recurring: data.is_recurring,
      recurrence_rule: data.recurrence_rule,
      occurrence_number: 1,
    });

    if (error) throw new Error(error.message);
    await fetchReminders(tab);
  }

  async function handleUpdate(data: ReminderFormData) {
    if (!editingReminder) return;

    const { error } = await supabase
      .from("reminders")
      .update({
        content: data.content,
        trigger_at: data.trigger_at,
        is_recurring: data.is_recurring,
        recurrence_rule: data.recurrence_rule,
      })
      .eq("id", editingReminder.id)
      .eq("status", "pending");

    if (error) throw new Error(error.message);
    setEditingReminder(null);
    await fetchReminders(tab);
  }

  async function handleCancel(reminderId: string) {
    const { error } = await supabase
      .from("reminders")
      .update({ status: "cancelled" as ReminderStatus })
      .eq("id", reminderId);

    if (error) {
      toast.error("Error al cancelar el recordatorio");
      return;
    }
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  }

  async function handleCancelSeries(reminder: Reminder) {
    const parentId = reminder.recurrence_parent_id ?? reminder.id;

    const { error } = await supabase
      .from("reminders")
      .update({ status: "cancelled" as ReminderStatus })
      .or(`id.eq.${parentId},recurrence_parent_id.eq.${parentId}`)
      .eq("status", "pending");

    if (error) {
      toast.error("Error al cancelar la serie");
      return;
    }

    setReminders((prev) =>
      prev.filter((r) => {
        if (r.status !== "pending") return true;
        return r.id !== parentId && r.recurrence_parent_id !== parentId;
      }),
    );
    toast("Serie cancelada");
  }

  function handleDelete(reminderId: string) {
    const deletedReminder = reminders.find((r) => r.id === reminderId);
    if (!deletedReminder) return;

    // Optimistic removal
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));

    const timeoutId = setTimeout(async () => {
      pendingDeleteRef.current.delete(reminderId);
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", reminderId);
      if (error) {
        setReminders((prev) => [...prev, deletedReminder]);
        toast.error("Error al eliminar el recordatorio");
      }
    }, 5000);

    pendingDeleteRef.current.set(reminderId, timeoutId);

    toast("Recordatorio eliminado", {
      action: {
        label: "Deshacer",
        onClick: () => {
          clearTimeout(pendingDeleteRef.current.get(reminderId));
          pendingDeleteRef.current.delete(reminderId);
          setReminders((prev) => [...prev, deletedReminder]);
        },
      },
    });
  }

  // ── Debounced search ──────────────────────────────────────────────────

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }

  // ── Derived state ─────────────────────────────────────────────────────

  const filteredReminders = reminders.filter((r) => {
    if (!TAB_FILTERS[tab](r)) return false;
    if (!search.trim()) return true;
    return r.content.toLowerCase().includes(search.toLowerCase());
  });

  const count = filteredReminders.length;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => {
          const newTab = v as ReminderTab;
          setTab(newTab);
          setIsLoading(true);
          void fetchReminders(newTab);
        }}>
          <TabsList>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="recurring">Recurrentes</TabsTrigger>
            <TabsTrigger value="sent">Enviados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar recordatorios..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-8"
              aria-label="Buscar recordatorios"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={() => {
              setEditingReminder(null);
              setFormOpen(true);
            }}
          >
            + Nuevo
          </Button>
        </div>
      </div>

      {/* Tab content with fade transition */}
      <div key={tab} className="animate-in fade-in duration-150">

      {/* Loading */}
      {isLoading && <RemindersListSkeleton count={4} />}

      {/* Empty state */}
      {!isLoading && count === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">
            {tab === "upcoming"
              ? "No hay recordatorios próximos"
              : tab === "recurring"
                ? "No hay recordatorios recurrentes"
                : tab === "sent"
                  ? "No hay recordatorios enviados"
                  : search
                    ? "No se encontraron recordatorios"
                    : "No hay recordatorios"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {search
              ? "Intenta con otro término de búsqueda."
              : 'Crea un recordatorio aquí o por WhatsApp con "Recuérdame llamar al doctor mañana a las 10".'}
          </p>
          {tab === "upcoming" && !search && (
            <Button
              onClick={() => {
                setEditingReminder(null);
                setFormOpen(true);
              }}
              className="mt-2"
            >
              Crear primer recordatorio
            </Button>
          )}
        </div>
      )}

      {/* Reminders list */}
      {!isLoading && count > 0 && (
        <div className="grid gap-3">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              timezone={timezone}
              onView={setViewingReminder}
              onCancel={handleCancel}
              onEdit={(r) => {
                setEditingReminder(r);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onCancelSeries={handleCancelSeries}
            />
          ))}
        </div>
      )}

      </div>{/* end tab fade wrapper */}

      {/* View dialog (read-only) */}
      <ReminderViewDialog
        reminder={viewingReminder}
        open={!!viewingReminder}
        onOpenChange={(open) => { if (!open) setViewingReminder(null); }}
        onEdit={(r) => {
          setViewingReminder(null);
          setEditingReminder(r);
          setFormOpen(true);
        }}
        timezone={timezone}
      />

      {/* Create/Edit dialog */}
      <ReminderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        reminder={editingReminder}
        onSubmit={editingReminder ? handleUpdate : handleCreate}
        timezone={timezone}
      />
    </div>
  );
}
