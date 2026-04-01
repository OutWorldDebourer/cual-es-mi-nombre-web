# /src/app/dashboard/reminders/

Next.js route for the reminders management page.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `loading.tsx` | Suspense loading skeleton using RemindersListSkeleton component | initial · 2026-03-30 |
| `page.tsx` | Server Component that fetches pending/processing reminders ordered by trigger time from Supabase, renders ReminderList with user timezone and optional auto-create via `?action=new` | initial · 2026-03-30 |
