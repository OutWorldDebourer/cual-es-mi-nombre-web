# /src/components/

Shared React components for the application, organized by feature domain.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `motion-provider.tsx` | Client Component wrapping Framer Motion's MotionConfig with `reducedMotion="user"` for accessibility | initial · 2026-03-30 |
| `theme-provider.tsx` | Client Component wrapping next-themes ThemeProvider for dark/light mode support | initial · 2026-03-30 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `auth/` | Authentication forms: login, signup, recovery, OTP input, phone input, password strength, step indicator |
| `chat/` | Chat UI: overlay panel, message list, individual messages, input bar, FAB trigger, typing indicator |
| `credits/` | Credit balance display card and transaction history table |
| `dashboard/` | Dashboard shell/layout, navigation (bottom nav, breadcrumbs), user menu, theme toggle, onboarding stepper, activity widgets |
| `landing/` | Landing page sections: hero, animated chat demo, feature cards, pricing, motion reveal, tilt card |
| `notes/` | Notes CRUD: list view, card, board/column views, drag-and-drop, form, priority/status config, tag colors |
| `plans/` | Subscription plan grid, individual plan card, cancel subscription dialog |
| `reminders/` | Reminder CRUD: list, card, form, and view dialog components |
| `settings/` | Settings components: WhatsApp phone number linking flow |
| `skeletons/` | Loading skeleton placeholders for dashboard cards, credits, notes, and reminders |
| `ui/` | Shared UI primitives (shadcn/ui): button, card, dialog, drawer, dropdown, form, input, select, table, tabs, etc. |
