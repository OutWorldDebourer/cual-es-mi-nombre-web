# /src/app/dashboard/

Authenticated dashboard area with overview stats, activity feed, and onboarding stepper.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `layout.tsx` | Async Server Component layout that fetches the authenticated user and profile, redirects to /login if unauthenticated, and wraps children in DashboardShell | initial · 2026-03-30 |
| `loading.tsx` | Suspense fallback that renders a DashboardSkeleton placeholder while the page loads | initial · 2026-03-30 |
| `page.tsx` | Main dashboard page showing credit/plan/WhatsApp/Calendar stat cards, today's upcoming reminders, onboarding stepper, and recent activity feed | initial · 2026-03-30 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `chat/` | Chat interface (currently redirects to dashboard) |
| `credits/` | Credit balance and transaction history |
| `notes/` | Notes management |
| `plans/` | Subscription plan selection |
| `reminders/` | Reminders management |
| `settings/` | User settings (WhatsApp linking, Google Calendar connection) |
