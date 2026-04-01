# /src/lib/supabase/

Supabase client factories and auth helpers for all runtime contexts.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `auth.ts` | Cached auth helpers using React `cache()` to deduplicate `getUser()` and `getProfile()` calls within a single Server Component render pass | initial · 2026-03-31 |
| `client.ts` | Browser-side Supabase client factory using `@supabase/ssr` `createBrowserClient` for Client Components | initial · 2026-03-31 |
| `middleware.ts` | Next.js middleware helper that refreshes Supabase sessions on every request and protects `/dashboard/*` routes with redirect to `/login` | initial · 2026-03-31 |
| `server.ts` | Server-side Supabase client factory using `@supabase/ssr` `createServerClient` with cookie management for Server Components, Actions, and Route Handlers | initial · 2026-03-31 |
