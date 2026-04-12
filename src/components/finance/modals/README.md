# src/components/finance/modals

Modal dialogs for finance CRUD operations. All use ResponsiveDialog (Sheet on mobile, Dialog on desktop), react-hook-form + zod validation, and the project's shared form components.

## Files

- `add-transaction-modal.tsx` — Create income/expense transaction with type toggle, amount, category pills, account select, date, tags. Exports: `AddTransactionModal`, `AddTransactionData`.
- `split-transaction-modal.tsx` — Split a single expense into multiple category-assigned items using FieldArray. Validates sum equals total. Exports: `SplitTransactionModal`, `SplitTransactionData`, `SplitItem`.
- `edit-category-modal.tsx` — Create or edit a finance category (name, emoji icon, hex color, type). Pre-populates when editing. Exports: `EditCategoryModal`, `CategorySubmitData`.
- `create-account-modal.tsx` — Create a financial account (name, type, currency PEN/USD/EUR, initial balance). Exports: `CreateAccountModal`, `CreateAccountData`.
- `transfer-modal.tsx` — Transfer money between two accounts with from/to validation. Exports: `TransferModal`, `TransferData`.

## Related

- `../shared/` — Shared form components (AmountInput, CategoryPills) used by all modals.
- `../../ui/responsive-dialog.tsx` — Dialog/Drawer wrapper for mobile responsiveness.
