# /src/components/reminders/

Reminders CRUD interface with recurrence (RRULE) support, status filtering, and realtime sync.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `reminder-card.tsx` | Reminder display card (variant=interactive) with status badge, trigger time, recurrence info, and cancel/edit/delete actions | T1 · 2026-03-31 |
| `reminder-form.tsx` | Dialog form for creating and editing reminders with datetime picker and RRULE recurrence configuration | initial · 2026-03-30 |
| `reminder-list.tsx` | Main reminders orchestrator: CRUD, search, status tab filters, realtime sync, and auto-create support | initial · 2026-03-30 |
| `reminder-view-dialog.tsx` | Read-only dialog displaying full reminder details with recurrence description and edit action for pending items | initial · 2026-03-30 |
