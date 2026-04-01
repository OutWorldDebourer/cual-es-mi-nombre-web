# /src/app/dashboard/notes/

Next.js route for the notes management page.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `loading.tsx` | Suspense loading skeleton using NotesGridSkeleton component | initial · 2026-03-30 |
| `page.tsx` | Server Component that fetches active notes (pinned first, then by position/date) from Supabase and renders NoteList with optional auto-create via `?action=new` | initial · 2026-03-30 |
