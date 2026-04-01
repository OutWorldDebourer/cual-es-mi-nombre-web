# /src/

Application source code: Next.js App Router pages, React components, hooks, library utilities, types, and tests.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `middleware.ts` | Root middleware that refreshes Supabase auth sessions and protects /dashboard routes | initial · 2026-03-31 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `__tests__/` | Vitest test suites organized by feature (auth, credits, notes, reminders, lib) |
| `app/` | Next.js App Router pages: landing, auth flows, dashboard, and settings |
| `components/` | React components: dashboard shell, auth forms, UI primitives (shadcn/ui) |
| `hooks/` | Custom React hooks |
| `lib/` | Shared utilities: Supabase clients, helper functions |
| `types/` | TypeScript type definitions (database types) |
