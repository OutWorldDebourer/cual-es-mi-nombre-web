# /src/lib/

Shared utility modules, API client, and integration helpers.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `api.ts` | Centralized, typed client for the Python backend (Railway) with JWT auth from Supabase sessions; covers WhatsApp, chat, notes, reminders, credits, subscriptions, and Google endpoints | initial · 2026-03-31 |
| `dates.ts` | Date formatting utilities converting UTC Supabase timestamps to localized Spanish strings (es-PE), with relative time and smart date helpers | initial · 2026-03-31 |
| `fractional-index.ts` | Typed re-export of `fractional-indexing` library for lexicographically sortable note position keys | initial · 2026-03-31 |
| `google-auth.ts` | Google OAuth frontend helpers: builds the backend `/auth/google/connect` URL and parses callback query params into banner messages (Spanish) | initial · 2026-03-31 |
| `phone-utils.ts` | E.164 phone validation, Latin America-focused country dial code list, phone masking, and Zod schema for form integration | initial · 2026-03-31 |
| `rrule.ts` | RFC 5545 RRULE builder, parser, and human-readable Spanish describer for recurring reminders (port of Python `rrule_builder.py`) | initial · 2026-03-31 |
| `utils.ts` | Tailwind CSS class merging utility (`cn`) using clsx + tailwind-merge | initial · 2026-03-31 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `supabase/` | Supabase client factories and auth helpers for browser, server, and middleware contexts |
