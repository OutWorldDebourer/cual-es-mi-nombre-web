# /src/components/dashboard/

Dashboard layout shell, navigation, and widget components.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `api-status-banner.tsx` | Warning banner shown when backend API is unreachable or unconfigured | initial · 2026-03-30 |
| `bottom-nav.tsx` | Fixed mobile bottom navigation bar with links to Inicio, Notas, Recordatorios, and Config | initial · 2026-03-30 |
| `breadcrumb-nav.tsx` | Breadcrumb navigation with mobile back-link and desktop full path display | initial · 2026-03-30 |
| `count-up.tsx` | Animated counter (0→target) with easeOutExpo, viewport trigger (useInView), reduced-motion support, delay/suffix/decimals props | T4 · 2026-03-31 |
| `google-connect-button.tsx` | Button that initiates Google Calendar OAuth connect flow via backend API | initial · 2026-03-30 |
| `google-disconnect-button.tsx` | Button to disconnect Google Calendar integration with confirmation dialog | initial · 2026-03-30 |
| `logout-button.tsx` | Simple sign-out button using Supabase client auth, redirects to /login | initial · 2026-03-30 |
| `onboarding-stepper.tsx` | Checklist-style onboarding guide showing setup progress (phone, name, Google, plan) with CountUp on progress % | T4 · 2026-03-31 |
| `recent-activity.tsx` | Activity feed widget displaying recent notes, reminders, and credit events with icons | initial · 2026-03-30 |
| `shell.tsx` | Main dashboard layout shell with collapsible sidebar, top bar, breadcrumbs, bottom nav, chat overlay, and FloatingOrbs background | T6 · 2026-04-01 |
| `theme-toggle.tsx` | Light/dark/system theme dropdown toggle using next-themes | initial · 2026-03-30 |
| `upcoming-today.tsx` | Widget card listing today's upcoming reminders with status badges and formatted times | initial · 2026-03-30 |
| `user-menu.tsx` | Avatar dropdown menu with links to settings, plans, and logout; avatar size-10 for 40px touch target | T8 · 2026-04-01 |
