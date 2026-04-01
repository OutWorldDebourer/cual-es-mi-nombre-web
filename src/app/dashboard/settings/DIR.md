# /src/app/dashboard/settings/

Next.js route for user and assistant profile settings.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `page.tsx` | Client Component with form to edit display name, assistant name, timezone (LATAM presets), and message wait seconds; writes directly to Supabase profiles table | T5 · 2026-04-01 |
| `loading.tsx` | Skeleton loading state matching settings form layout — 2 cards with field placeholders + shimmer | T3 · 2026-03-31 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `google/` | Google Calendar connection/disconnection settings page |
| `whatsapp/` | WhatsApp phone number linking settings page |
