# src/app/dashboard/finance

Next.js App Router pages for the Finance module.

## Files

- `page.tsx` — Server Component. Fetches finance_profiles, transactions, categories, accounts, budgets from Supabase; passes to `FinanceDashboard`. Supports `?tab=` deep-linking.
- `loading.tsx` — Skeleton matching Overview layout: 4 metric cards, 2 chart areas, 5 transaction rows.
- `error.tsx` — Client error boundary with retry button for the finance route.

## Subdirectories

None yet. Future: onboarding, transactions, budgets sub-routes.

## Related

- `../../components/finance/` — Shared finance UI components (tabs, modals, shared).
