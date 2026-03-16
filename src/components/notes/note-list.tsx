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

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Note } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { NoteCard } from "@/components/notes/note-card";
import { NoteForm } from "@/components/notes/note-form";
import { NotesGridSkeleton } from "@/components/skeletons/note-card-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List, Search, StickyNote, Tag, X } from "lucide-react";

interface NoteListProps {
  /** Initial notes from server-side fetch (SSR hydration) */
  initialNotes: Note[];
}

type NoteTab = "active" | "archived";
type ViewMode = "grid" | "list";

export function NoteList({ initialNotes }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<NoteTab>("active");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = createClient();
  const pendingDeleteRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

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

  function handleDelete(noteId: string) {
    // Capture note for potential undo
    const deletedNote = notes.find((n) => n.id === noteId);
    if (!deletedNote) return;

    // Optimistic removal from UI
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    // Schedule actual DB delete after toast auto-dismiss
    const timeoutId = setTimeout(async () => {
      pendingDeleteRef.current.delete(noteId);
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) {
        // Restore on DB failure
        setNotes((prev) => [...prev, deletedNote]);
        toast.error("Error al eliminar la nota");
      }
    }, 5000);

    pendingDeleteRef.current.set(noteId, timeoutId);

    toast("Nota eliminada", {
      action: {
        label: "Deshacer",
        onClick: () => {
          clearTimeout(pendingDeleteRef.current.get(noteId));
          pendingDeleteRef.current.delete(noteId);
          setNotes((prev) => [...prev, deletedNote]);
        },
      },
    });
  }

  async function handleTogglePin(noteId: string, isPinned: boolean) {
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, is_pinned: isPinned } : n)),
    );

    const { error } = await supabase
      .from("notes")
      .update({ is_pinned: isPinned })
      .eq("id", noteId);

    if (error) {
      // Revert on failure
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, is_pinned: !isPinned } : n)),
      );
      toast.error("Error al fijar la nota");
    }
  }

  async function handleArchive(noteId: string) {
    const archivedNote = notes.find((n) => n.id === noteId);
    if (!archivedNote) return;

    // Optimistic removal from current view
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    const { error } = await supabase
      .from("notes")
      .update({ is_archived: true })
      .eq("id", noteId);

    if (error) {
      setNotes((prev) => [...prev, archivedNote]);
      toast.error("Error al archivar la nota");
      return;
    }

    toast("Nota archivada", {
      action: {
        label: "Deshacer",
        onClick: async () => {
          await supabase.from("notes").update({ is_archived: false }).eq("id", noteId);
          setNotes((prev) => [...prev, { ...archivedNote, is_archived: false }]);
        },
      },
    });
  }

  // ── Debounced search ─────────────────────────────────────────────────

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

  // ── Derived state ──────────────────────────────────────────────────────

  const filteredNotes = notes.filter((note) => {
    // Tag filter
    if (selectedTag && !note.tags.some((t) => t === selectedTag)) return false;
    // Text search
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
      {/* Toolbar: tabs + view toggle + search + create */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as NoteTab)}
          >
            <TabsList>
              <TabsTrigger value="active">Activas</TabsTrigger>
              <TabsTrigger value="archived">Archivadas</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex border rounded-md" role="group" aria-label="Vista de notas">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-r-none ${viewMode === "grid" ? "bg-muted" : ""}`}
                  aria-label="Vista cuadrícula"
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cuadrícula</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setViewMode("list")}
                  className={`rounded-l-none ${viewMode === "list" ? "bg-muted" : ""}`}
                  aria-label="Vista lista"
                  aria-pressed={viewMode === "list"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lista</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notas..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-8"
              aria-label="Buscar notas"
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
          <Button onClick={() => { setEditingNote(null); setFormOpen(true); }}>
            + Nueva
          </Button>
        </div>
      </div>

      {/* Active tag filter */}
      {selectedTag && (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtrando por:</span>
          <Badge
            variant="secondary"
            className="text-xs cursor-pointer gap-1"
            onClick={() => setSelectedTag(null)}
          >
            {selectedTag}
            <X className="h-3 w-3" />
          </Badge>
        </div>
      )}

      {/* Loading */}
      {isLoading && <NotesGridSkeleton count={6} />}

      {/* Empty state */}
      {!isLoading && filteredNotes.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <StickyNote className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">
            {tab === "archived"
              ? "No hay notas archivadas"
              : search || selectedTag
                ? "No se encontraron notas"
                : "No tienes notas aún"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {tab === "active" && !search && !selectedTag
              ? 'Envía un mensaje por WhatsApp como "Guarda una nota: comprar leche" o crea una aquí.'
              : selectedTag
                ? "No hay notas con esta etiqueta."
                : "Intenta con otro término de búsqueda."}
          </p>
          {tab === "active" && !search && !selectedTag && (
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

      {/* Notes grid/list */}
      {!isLoading && filteredNotes.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              layout={viewMode}
              onEdit={(n) => {
                setEditingNote(n);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onArchive={handleArchive}
              onTagClick={setSelectedTag}
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
