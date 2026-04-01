# /src/app/dashboard/plans/

Next.js route for the subscription plans page.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `page.tsx` | Server Component that fetches plan catalog from backend API (with static fallback), user's current plan and subscription status from Supabase, renders PlanGrid for MercadoPago checkout | initial · 2026-03-30 |
| `loading.tsx` | Skeleton loading state matching PlanGrid layout — 4-column card grid with shimmer | T3 · 2026-03-31 |
