# /src/hooks/

Custom React hooks for client-side state and behavior.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `use-api-health.ts` | Pings the backend API on mount with retry logic (up to 2 retries, 3s delay) and returns status: checking, healthy, unreachable, or unconfigured | initial · 2026-03-31 |
| `use-is-mobile.ts` | Returns a boolean indicating whether the viewport is below 768px, using `matchMedia` listener | initial · 2026-03-31 |
| `use-note-drag.ts` | Manages dnd-kit drag-and-drop for note reordering: sensors (mouse/touch/keyboard), fractional-index position calculation, cross-section pin toggling, optimistic Supabase updates | initial · 2026-03-31 |
| `use-note-sort.ts` | Sorts notes by pinned status DESC, fractional position ASC, then updated_at DESC as fallback | initial · 2026-03-31 |
| `use-realtime-table.ts` | Subscribes to Supabase Realtime postgres_changes on a given table, forwarding typed `RealtimePayload<T>` (eventType + new/old row) to a debounced callback for incremental merge. Exports: `useRealtimeTable()`, `RealtimePayload` | FA22 · 2026-04-10 |
