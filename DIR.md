# /

Next.js 16 web dashboard for "Cuál es mi nombre", a WhatsApp AI assistant — uses Supabase Auth, shadcn/ui, and deploys on Vercel.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `.env.local.example` | Template for local environment variables (Supabase, API URL, site URL) | initial · 2026-03-31 |
| `.env.vercel` | Auto-generated Vercel CLI env file with OIDC token for AI Gateway | initial · 2026-03-31 |
| `.gitignore` | Git ignore rules for node_modules, .next, .env files, .vercel, and Claude Code | initial · 2026-03-31 |
| `README.md` | Project overview: stack, architecture diagram, setup instructions, and deploy guide | initial · 2026-03-31 |
| `components.json` | shadcn/ui configuration (new-york style, neutral base, Lucide icons, path aliases) | initial · 2026-03-31 |
| `eslint.config.mjs` | ESLint flat config with Next.js core-web-vitals and TypeScript rules | initial · 2026-03-31 |
| `next.config.ts` | Next.js config with security headers (CSP, X-Frame-Options), image optimization, and bundle analyzer | initial · 2026-03-31 |
| `package.json` | Project manifest — Next.js 16, React 19, Supabase SSR, shadcn/ui, motion, zod, vitest | initial · 2026-03-31 |
| `postcss.config.mjs` | PostCSS config enabling Tailwind CSS v4 plugin | initial · 2026-03-31 |
| `tsconfig.json` | TypeScript config targeting ES2017 with bundler resolution and `@/*` path alias | initial · 2026-03-31 |
| `vitest.config.ts` | Vitest config with jsdom environment, React plugin, and `@/` alias | initial · 2026-03-31 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `.claude/` | Claude Code project settings and permissions |
| `docs/` | Architecture docs, action plans, audits, and improvement plans |
| `public/` | Static SVG assets (Next.js, Vercel, and decorative icons) |
| `src/` | Application source code: pages, components, hooks, lib, types, tests |
