# /src/app/

Next.js App Router root — layout, landing page, error/404 pages, PWA manifest, and OG image generation.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `apple-icon.tsx` | Edge-rendered 180x180 Apple Touch Icon with teal gradient and sparkle SVG | initial · 2026-03-30 |
| `error.tsx` | Global error boundary UI — logs error and shows retry/home buttons | initial · 2026-03-30 |
| `favicon.ico` | Binary favicon file | initial · 2026-03-30 |
| `globals.css` | Tailwind + design system tokens (OKLCh colors, fonts, light/dark themes) | initial · 2026-03-30 |
| `icon.svg` | SVG favicon — teal gradient rounded square with sparkle motif | initial · 2026-03-30 |
| `layout.tsx` | Root layout — loads Geist + Plus Jakarta fonts, ThemeProvider, MotionProvider, Toaster | initial · 2026-03-30 |
| `manifest.ts` | PWA web app manifest (standalone mode, dashboard start URL, teal theme) | initial · 2026-03-30 |
| `not-found.tsx` | Custom 404 page with branded UI and navigation links | initial · 2026-03-30 |
| `opengraph-image.tsx` | Edge-rendered 1200x630 Open Graph image with branding and tagline | initial · 2026-03-30 |
| `page.tsx` | Landing page — hero, features grid, pricing, how-it-works, footer; redirects authenticated users to /dashboard; uses LandingNavbar component | T2 · 2026-03-31 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `(auth)/` | Authentication route group — login, signup, recovery, set-password |
| `(legal)/` | Legal pages route group |
| `auth/` | Supabase auth callback handler routes |
| `dashboard/` | Authenticated dashboard with notes, reminders, calendar, chat |
