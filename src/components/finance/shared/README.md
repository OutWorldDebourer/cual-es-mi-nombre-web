# src/components/finance/shared/

Shared presentational components for the Finance dashboard. Pure UI + callbacks, no business logic.

## Files

- `amount-input.tsx` -- Currency prefix input with 3 sizes (sm/md/lg) and 3 variants (default/income/expense). Numeric-only with 2-decimal validation. Exports: `AmountInput`.
- `period-selector.tsx` -- 5-period pill selector (Hoy/Semana/Quincena/Mes/Ano) backed by shadcn Tabs. Exports: `PeriodSelector`, `PeriodValue`.
- `budget-progress-bar.tsx` -- Progress bar with auto-color (green <70%, yellow 70-90%, red >90%) and mode-aware labels (fixed/percentage/envelope). Exports: `BudgetProgressBar`.
- `category-pills.tsx` -- Horizontal scrollable pill list with overflow dropdown. Shows icon + name + color dot per category. Exports: `CategoryPills`.
- `transaction-row.tsx` -- Single transaction list item with category icon, amount color-coding, source badge (WA/Web/Auto/Rec), review badge, and 3-dot action menu. Exports: `TransactionRow`.
- `empty-state.tsx` -- Centered placeholder with icon, title, description, and optional CTA button. Exports: `EmptyState`.
- `quick-entry.tsx` -- Two collapsible widgets (income green / expense red) with CategoryPills + AmountInput + description + submit. Shows daily running total. Exports: `QuickEntry`, `QuickEntrySubmit`, `TodayTotals`.
- `onboarding-wizard.tsx` -- 3-step responsive wizard dialog: income type, accounts setup, favorite categories. react-hook-form + zod validation. Exports: `OnboardingWizard`, `OnboardingResult`.
- `format-utils.ts` -- Shared formatting utilities. Exports: `formatAmount()`.

## Related

- `../` -- Finance module parent, will contain page-level components.
- `../../ui/` -- shadcn/ui primitives consumed by all components here.
