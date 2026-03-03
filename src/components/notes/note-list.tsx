/**
 * Note List Component — "Cuál es mi nombre" Web
 *
 * Client component that manages the full notes CRUD lifecycle:
 * - Fetches notes from Supabase (RLS ensures user isolation)
 * - Search / filter by archived status
 * - Create, edit, pin/unpin, archive, and delete notes
 * - Empty state with onboarding hint
 *
 * @module components/notes/note-list
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { Note } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { NoteCard } from "@/components/notes/note-card";
import { NoteForm } from "@/components/notes/note-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NoteListProps {
  /** Initial notes from server-side fetch (SSR hydration) */
  initialNotes: Note[];
}

type NoteTab = "active" | "archived";

export function NoteList({ initialNotes }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<NoteTab>("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  // ── Fetch notes from Supabase ──────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("is_archived", tab === "archived")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setNotes(data as Note[]);
    }
    setIsLoading(false);
  }, [supabase, tab]);

  // Refetch when tab changes
  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  // ── CRUD handlers ──────────────────────────────────────────────────────

  async function handleCreate(data: { title: string; content: string }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesión expirada");

    const { error } = await supabase.from("notes").insert({
      profile_id: user.id,
      title: data.title || null,
      content: data.content,
    });

    if (error) throw new Error(error.message);
    await fetchNotes();
  }

  async function handleUpdate(data: { title: string; content: string }) {
    if (!editingNote) return;

    const { error } = await supabase
      .from("notes")
      .update({
        title: data.title || null,
        content: data.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingNote.id);

    if (error) throw new Error(error.message);
    setEditingNote(null);
    await fetchNotes();
  }

  async function handleDelete(noteId: string) {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      console.error("Error deleting note:", error.message);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  async function handleTogglePin(noteId: string, isPinned: boolean) {
    const { error } = await supabase
      .from("notes")
      .update({ is_pinned: isPinned })
      .eq("id", noteId);

    if (error) {
      console.error("Error toggling pin:", error.message);
      return;
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, is_pinned: isPinned } : n)),
    );
  }

  async function handleArchive(noteId: string) {
    const { error } = await supabase
      .from("notes")
      .update({ is_archived: true })
      .eq("id", noteId);

    if (error) {
      console.error("Error archiving note:", error.message);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  // ── Derived state ──────────────────────────────────────────────────────

  const filteredNotes = notes.filter((note) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (note.title?.toLowerCase().includes(q) ?? false) ||
      note.content.toLowerCase().includes(q) ||
      note.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar: tabs + search + create */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as NoteTab)}
        >
          <TabsList>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="archived">Archivadas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={() => { setEditingNote(null); setFormOpen(true); }}>
            + Nueva
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Cargando notas...
        </p>
      )}

      {/* Empty state */}
      {!isLoading && filteredNotes.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <p className="text-4xl">📝</p>
          <h3 className="text-lg font-medium">
            {tab === "archived"
              ? "No hay notas archivadas"
              : search
                ? "No se encontraron notas"
                : "No tienes notas aún"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {tab === "active" && !search
              ? 'Envía un mensaje por WhatsApp como "Guarda una nota: comprar leche" o crea una aquí.'
              : "Intenta con otro término de búsqueda."}
          </p>
          {tab === "active" && !search && (
            <Button
              onClick={() => {
                setEditingNote(null);
                setFormOpen(true);
              }}
              className="mt-2"
            >
              Crear primera nota
            </Button>
          )}
        </div>
      )}

      {/* Notes grid */}
      {!isLoading && filteredNotes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={(n) => {
                setEditingNote(n);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <NoteForm
        open={formOpen}
        onOpenChange={setFormOpen}
        note={editingNote}
        onSubmit={editingNote ? handleUpdate : handleCreate}
      />
    </div>
  );
}
