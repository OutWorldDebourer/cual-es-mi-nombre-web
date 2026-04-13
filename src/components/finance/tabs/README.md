# src/components/finance/tabs/

Tab content panels for the Finance dashboard. Each file is a "use client" component rendered inside `finance-dashboard.tsx` TabsContent.

## Files

- `overview-tab.tsx` -- Main dashboard view: review banner, QuickEntry, 4 metric cards (balance/income/expense/available) in 4-col grid with hover effects and stagger animation, PeriodSelector, side-by-side charts row (Recharts donut + budget progress), last 5 transactions with "Ver todas" link. Exports: `OverviewTab`.
- `transactions-tab.tsx` -- Full transaction list with filter bar (status/type/category pills), date-grouped TransactionRow items, "Cargar mas" pagination, empty state, floating "+" FAB. Exports: `TransactionsTab`.
- `budgets-tab.tsx` -- Budget management with 3 mode UIs: fixed (progress bars), percentage (income reference + allocation pie chart + bars), envelope (Por Asignar hero + envelope cards with Asignar/Quitar). Exports: `BudgetsTab`.
- `reports-tab.tsx` -- Financial reports: period selector, category donut chart, monthly bar comparison, daily net trend line, savings rate gauge. All data computed client-side from transactions prop. Exports: `ReportsTab`.
- `categories-tab.tsx` -- Category management: grouped grids (expense/income/transfer) with icon, color dot, usage count, system badge. Edit/delete for user categories. Exports: `CategoriesTab`.
- `accounts-tab.tsx` -- Account management: total balance hero card, typed account cards (cash/bank/credit_card/savings/investment), active/inactive grouping. Exports: `AccountsTab`.
- `settings-tab.tsx` -- Finance profile settings: income type/period/amount, savings goal, budget mode, currency select, danger zone with delete confirmation. react-hook-form + zod validation. Exports: `SettingsTab`.

## Related

- `../finance-dashboard.tsx` -- Parent container that mounts these tabs.
- `../shared/` -- Shared presentational components consumed by all tabs.
