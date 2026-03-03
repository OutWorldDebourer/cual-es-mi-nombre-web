/**
 * Notes Page — "Cuál es mi nombre" Web Dashboard
 *
 * Server Component that fetches the user's notes from Supabase (with RLS)
 * and renders the NoteList client component for interactive CRUD.
 *
 * Route: /dashboard/notes
 *
 * @module app/dashboard/notes/page
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NoteList } from "@/components/notes/note-list";
import type { Note } from "@/types/database";

export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch active notes (non-archived), pinned first, newest first
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notas</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus notas. También puedes crear notas por WhatsApp.
        </p>
      </div>
      <NoteList initialNotes={(notes as Note[]) ?? []} />
    </div>
  );
}
