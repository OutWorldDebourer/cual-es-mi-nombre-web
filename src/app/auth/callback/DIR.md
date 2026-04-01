# /src/app/auth/callback/

Supabase OAuth callback endpoint for completing authentication flows (e.g. Google sign-in).

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `route.ts` | GET route handler that exchanges an OAuth code for a Supabase session, with open-redirect prevention, then redirects to /dashboard or /login on failure | initial · 2026-03-30 |
