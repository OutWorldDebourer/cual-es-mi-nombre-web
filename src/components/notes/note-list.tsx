/**
 * Note List Component — "Cual es mi nombre" Web
 *
 * Client component that manages the full notes CRUD lifecycle:
 * - Fetches notes from Supabase (RLS ensures user isolation)
 * - Search / filter by archived status / filter by note status
 * - Create, edit, pin/unpin, archive, and delete notes
 * - Group by tag with collapsible sections
 * - Empty state with onboarding hint
 *
 * @module components/notes/note-list
 */

"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import type { Note, NoteStatus } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTable } from "@/hooks/use-realtime-table";
import { NoteCard } from "@/components/notes/note-card";
import { NoteForm } from "@/components/notes/note-form";
import { NoteViewDialog } from "@/components/notes/note-view-dialog";
import { NoteGroupSection } from "@/components/notes/note-group-section";
import { NotesGridSkeleton } from "@/components/skeletons/note-card-skeleton";
import { NOTE_STATUS_CONFIG, NOTE_STATUSES } from "@/components/notes/note-status-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, LayoutGrid, List, Search, StickyNote, Tag, X } from "lucide-react";

interface NoteListProps {
  /** Initial notes from server-side fetch (SSR hydration) */
  initialNotes: Note[];
}

type NoteTab = "active" | "archived";
type ViewMode = "grid" | "list";
type StatusFilter = "all" | NoteStatus;
type GroupMode = "none" | "tag";

export function NoteList({ initialNotes }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<NoteTab>("active");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [groupMode, setGroupMode] = useState<GroupMode>("none");
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = createClient();
  const pendingDeleteRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Reset filters on tab/tag changes ───────────────────────────────────

  useEffect(() => {
    if (tab === "archived") setStatusFilter("all");
  }, [tab]);

  useEffect(() => {
    if (selectedTag) setGroupMode("none");
  }, [selectedTag]);

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

  // Auto-refresh when notes change from WhatsApp or other sources
  useRealtimeTable("notes", fetchNotes);

  // ── CRUD handlers ──────────────────────────────────────────────────────

  async function handleCreate(data: { title: string; content: string; status?: NoteStatus }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Sesion expirada");

    const { error } = await supabase.from("notes").insert({
      profile_id: user.id,
      title: data.title || null,
      content: data.content,
      status: data.status ?? "active",
    });

    if (error) throw new Error(error.message);
    await fetchNotes();
  }

  async function handleUpdate(data: { title: string; content: string; status?: NoteStatus }) {
    if (!editingNote) return;

    const { error } = await supabase
      .from("notes")
      .update({
        title: data.title || null,
        content: data.content,
        status: data.status ?? editingNote.status,
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

  async function handleStatusChange(noteId: string, status: NoteStatus) {
    const oldNote = notes.find((n) => n.id === noteId);
    if (!oldNote) return;

    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, status } : n)),
    );

    const { error } = await supabase
      .from("notes")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", noteId);

    if (error) {
      // Revert on failure
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, status: oldNote.status } : n)),
      );
      toast.error("Error al cambiar el estado");
    }
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

  const filteredNotes = useMemo(() => notes.filter((note) => {
    // Status filter
    if (statusFilter !== "all" && note.status !== statusFilter) return false;
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
  }), [notes, statusFilter, selectedTag, search]);

  // ── Grouped notes (by tag) ─────────────────────────────────────────────

  const groupedNotes = useMemo(() => {
    if (groupMode !== "tag") return null;

    const groups = new Map<string, Note[]>();
    const untagged: Note[] = [];

    for (const note of filteredNotes) {
      if (note.tags.length === 0) {
        untagged.push(note);
      } else {
        for (const tag of note.tags) {
          const group = groups.get(tag) ?? [];
          group.push(note);
          groups.set(tag, group);
        }
      }
    }

    const sorted = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
    if (untagged.length > 0) {
      sorted.push(["Sin etiqueta", untagged]);
    }
    return sorted;
  }, [filteredNotes, groupMode]);

  // ── Render helpers ───────────────────────────────────────────────────

  const gridClass =
    viewMode === "grid"
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      : "flex flex-col gap-3";

  function renderNoteCards(notesToRender: Note[], startIndex = 0, keyPrefix = "") {
    return notesToRender.map((note, idx) => (
      <NoteCard
        key={keyPrefix ? `${keyPrefix}-${note.id}` : note.id}
        note={note}
        index={startIndex + idx + 1}
        layout={viewMode}
        onView={setViewingNote}
        onEdit={(n) => {
          setEditingNote(n);
          setFormOpen(true);
        }}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        onArchive={handleArchive}
        onStatusChange={handleStatusChange}
        onTagClick={setSelectedTag}
      />
    ));
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar: tabs + view toggle + group toggle + search + create */}
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
                  aria-label="Vista cuadricula"
                  aria-pressed={viewMode === "grid"}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cuadricula</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setViewMode("list")}
                  className={`rounded-none border-x ${viewMode === "list" ? "bg-muted" : ""}`}
                  aria-label="Vista lista"
                  aria-pressed={viewMode === "list"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lista</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setGroupMode(groupMode === "none" ? "tag" : "none")}
                  className={`rounded-l-none ${groupMode === "tag" ? "bg-muted" : ""}`}
                  aria-label="Agrupar por etiqueta"
                  aria-pressed={groupMode === "tag"}
                  disabled={!!selectedTag}
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {groupMode === "tag" ? "Vista plana" : "Agrupar por etiqueta"}
              </TooltipContent>
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
                aria-label="Limpiar busqueda"
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

      {/* Status filter pills (only on active tab) */}
      {tab === "active" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant={statusFilter === "all" ? "default" : "outline"}
            className="text-xs cursor-pointer"
            onClick={() => setStatusFilter("all")}
          >
            Todas
          </Badge>
          {NOTE_STATUSES.map((s) => (
            <Badge
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              className={`text-xs cursor-pointer ${
                statusFilter === s ? "" : NOTE_STATUS_CONFIG[s].badgeClass
              }`}
              onClick={() => setStatusFilter(s)}
            >
              {NOTE_STATUS_CONFIG[s].label}
            </Badge>
          ))}
        </div>
      )}

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
              : search || selectedTag || statusFilter !== "all"
                ? "No se encontraron notas"
                : "No tienes notas aun"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {tab === "active" && !search && !selectedTag && statusFilter === "all"
              ? 'Envia un mensaje por WhatsApp como "Guarda una nota: comprar leche" o crea una aqui.'
              : statusFilter !== "all"
                ? `No hay notas con estado "${NOTE_STATUS_CONFIG[statusFilter as NoteStatus].label}".`
                : selectedTag
                  ? "No hay notas con esta etiqueta."
                  : "Intenta con otro termino de busqueda."}
          </p>
          {tab === "active" && !search && !selectedTag && statusFilter === "all" && (
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

      {/* Notes — flat view */}
      {!isLoading && filteredNotes.length > 0 && groupedNotes === null && (
        <div className={gridClass}>
          {renderNoteCards(filteredNotes)}
        </div>
      )}

      {/* Notes — grouped by tag */}
      {!isLoading && filteredNotes.length > 0 && groupedNotes !== null && (
        <div className="space-y-6">
          {groupedNotes.map(([tag, groupNotes]) => (
            <NoteGroupSection key={tag} tag={tag} count={groupNotes.length}>
              <div className={gridClass}>
                {renderNoteCards(groupNotes, 0, tag)}
              </div>
            </NoteGroupSection>
          ))}
        </div>
      )}

      {/* View dialog (read-only) */}
      <NoteViewDialog
        note={viewingNote}
        open={!!viewingNote}
        onOpenChange={(open) => { if (!open) setViewingNote(null); }}
        onEdit={(n) => {
          setViewingNote(null);
          setEditingNote(n);
          setFormOpen(true);
        }}
      />

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
