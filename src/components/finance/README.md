# src/components/finance

React components for the Finance module UI.

## Files

- `finance-dashboard.tsx` — "use client" tab container with 7 tabs (overview, transactions, budgets, reports, categories, accounts, settings). Shows `OnboardingWizard` when profile incomplete. Exports: `FinanceDashboard`.
- `use-finance-realtime.ts` — Realtime subscription hook for finance tables (transactions, budgets, categories, accounts). Exports: `useFinanceRealtime()`.
- `use-finance-profile.ts` — State management hook for finance profile with optimistic Supabase updates. Exports: `useFinanceProfile()`.
- `use-finance-mutations.ts` — Centralized Supabase CRUD mutations with toast notifications for all finance entities. Exports: `useFinanceMutations()`.

## Subdirectories

- `shared/` — 8 shared presentational components: AmountInput, PeriodSelector, BudgetProgressBar, CategoryPills, TransactionRow, EmptyState, QuickEntry, OnboardingWizard.
- `tabs/` — Tab-specific content panels (overview, transactions, budgets, reports, categories, accounts, settings).
- `modals/` — CRUD modal dialogs (add transaction, split transaction, edit category, create account, transfer between accounts).

## Related

- `../../app/dashboard/finance/` — App Router pages that consume these components.
- `../../types/database.ts` — Finance type definitions (`FinanceProfile`, `FinanceTransaction`, etc.).
