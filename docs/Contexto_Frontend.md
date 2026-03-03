# Contexto del Frontend — "Cuál es mi nombre" Web

**Estado:** 🚧 En desarrollo activo  
**Fase actual:** Fase 6 — Hardening, Frontend Funcional y Preparación Beta  
**Repo:** `cual-es-mi-nombre-web` (Vercel)  
**Backend:** `Proyecto_Cual es mi nombre` (Railway) — repo separado  
**Última Actualización:** 2026-03-02

---

## 🎯 ¿Qué es este proyecto?

**"Cuál es mi nombre"** es un asistente personal inteligente por WhatsApp que gestiona notas, recordatorios, calendario y más. Este repo es el **frontend web** — el dashboard donde los usuarios:

1. Se registran (signup/login con Supabase Auth)
2. Vinculan su WhatsApp
3. Conectan Google Calendar
4. Ven sus notas, recordatorios e historial de créditos
5. (Futuro) Pagan por planes premium via MercadoPago

---

## 🏗️ Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 16.1.6 | Framework (App Router) |
| **React** | 19.2.3 | UI |
| **TypeScript** | ^5 | Tipado estricto |
| **Tailwind CSS** | 4 | Estilos |
| **shadcn/ui** | 3.8.5 | Componentes UI (Radix primitives) |
| **Supabase** | 2.98.0 | Auth + Database (RLS) |
| **@supabase/ssr** | 0.9.0 | SSR cookies integration |
| **Vitest** | 4.0.18 | Tests unitarios |
| **@testing-library/react** | 16.3.2 | Tests de componentes |
| **Vercel** | — | Deploy (auto-deploy on push) |

---

## 📁 Estructura del Proyecto

```
cual-es-mi-nombre-web/
├── docs/                              # ← ESTA CARPETA — documentación del frontend
│   ├── Contexto_Frontend.md           # Este archivo — visión general
│   ├── Arquitectura.md                # Patrones, convenciones, decisiones
│   └── Progreso_Fase6.md             # Estado detallado de avance Fase 6
│
├── public/                            # Assets estáticos
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (fonts, metadata)
│   │   ├── page.tsx                   # Landing page (/)
│   │   ├── globals.css                # Tailwind 4 + shadcn theme
│   │   ├── (auth)/                    # Grupo de rutas auth (sin layout propio)
│   │   │   ├── actions.ts             # Server Actions (signup, login)
│   │   │   ├── login/page.tsx         # /login
│   │   │   └── signup/page.tsx        # /signup
│   │   ├── auth/
│   │   │   ├── callback/route.ts      # OAuth callback handler
│   │   │   └── confirm/page.tsx       # Email confirmation
│   │   └── dashboard/
│   │       ├── layout.tsx             # Auth guard + profile fetch (Server Component)
│   │       ├── page.tsx               # /dashboard — home
│   │       ├── notes/page.tsx         # /dashboard/notes — CRUD notas
│   │       ├── reminders/page.tsx     # /dashboard/reminders — lista recordatorios
│   │       ├── credits/page.tsx       # /dashboard/credits — balance + historial
│   │       └── settings/
│   │           ├── page.tsx           # /dashboard/settings — general
│   │           ├── whatsapp/page.tsx  # /dashboard/settings/whatsapp — vincular WA
│   │           └── google/page.tsx    # /dashboard/settings/google — conectar Calendar
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── shell.tsx              # Sidebar + header layout (Client Component)
│   │   │   └── logout-button.tsx      # Logout con Supabase
│   │   ├── notes/
│   │   │   ├── note-card.tsx          # Card con acciones (pin, edit, archive, delete)
│   │   │   ├── note-form.tsx          # Dialog crear/editar nota
│   │   │   └── note-list.tsx          # Lista con CRUD, búsqueda, tabs
│   │   ├── reminders/
│   │   │   ├── reminder-card.tsx      # Card con status badges, cancel
│   │   │   └── reminder-list.tsx      # Lista con tabs (upcoming/sent/all)
│   │   ├── credits/
│   │   │   ├── credit-balance.tsx     # Balance card con progress bar
│   │   │   └── transaction-table.tsx  # Tabla paginada de transacciones
│   │   └── ui/                        # shadcn/ui primitives (14 componentes)
│   │       ├── alert-dialog.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── separator.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   │
│   ├── lib/
│   │   ├── api.ts                     # Backend API client (JWT auth built-in)
│   │   ├── dates.ts                   # Timezone-aware date formatting
│   │   ├── utils.ts                   # cn() helper (clsx + tailwind-merge)
│   │   └── supabase/
│   │       ├── client.ts              # Browser Supabase client (createBrowserClient)
│   │       ├── server.ts              # Server Supabase client (createServerClient + cookies)
│   │       └── middleware.ts          # Middleware Supabase client
│   │
│   ├── types/
│   │   └── database.ts               # TypeScript types matching SQL schema
│   │
│   ├── __tests__/                     # Tests (Vitest + RTL)
│   │   ├── setup.ts                   # Mocks: Supabase, next/navigation, next/headers
│   │   ├── notes/
│   │   │   ├── note-card.test.tsx     # 8 tests
│   │   │   └── note-form.test.tsx     # 4 tests
│   │   ├── reminders/
│   │   │   └── reminder-card.test.tsx # 6 tests
│   │   ├── credits/
│   │   │   └── credit-balance.test.tsx # 5 tests
│   │   └── lib/
│   │       └── dates.test.ts          # 9 tests
│   │
│   └── middleware.ts                  # Next.js middleware (auth redirect)
│
├── vitest.config.ts                   # Vitest config (jsdom, globals, aliases)
├── next.config.ts                     # Next.js config
├── tsconfig.json                      # TypeScript (strict, @/* path alias)
├── package.json                       # Dependencies + scripts
├── components.json                    # shadcn/ui config
├── postcss.config.mjs                 # PostCSS + Tailwind
└── eslint.config.mjs                  # ESLint
```

---

## 🔗 Relación con el Backend

El frontend se comunica con el backend de dos formas:

### 1. Supabase Directo (Browser Client)
- **Auth:** Login, signup, logout, session management
- **Database (RLS):** Queries directas a tablas `notes`, `reminders`, `credit_transactions`, `profiles`
- **Seguridad:** Row Level Security — cada usuario solo ve sus propios datos
- **Client:** `createBrowserClient()` desde `@/lib/supabase/client`

### 2. Backend Python (Railway API)
- **Vinculación WhatsApp:** `POST /auth/verify-whatsapp/send-code`, `POST /auth/verify-whatsapp/confirm`
- **Google Calendar:** `POST /auth/google/connect`
- **Auth:** JWT Bearer token via `backendApi()` helper (`src/lib/api.ts`)
- **El `user_id` se extrae del JWT en el backend** — nunca se envía en el body

### Diagrama de Flujo

```
[Browser] ──Supabase JS──→ [Supabase] (auth, RLS queries)
[Browser] ──backendApi()──→ [Railway API] (WA, Google, pagos)
                               │
                               └──→ [Supabase] (via service role)
                               └──→ [Redis] (colas, cache)
                               └──→ [Google APIs] (Calendar)
                               └──→ [WhatsApp API] (mensajes)
```

---

## 📊 Métricas Actuales

| Métrica | Valor | Fecha |
|---------|-------|-------|
| `npm run build` | 0 errors | 2026-03-02 |
| `npm run test` | 32 passed, 0 failed | 2026-03-02 |
| Rutas registradas | 12 (7 dinámicas, 5 estáticas) | 2026-03-02 |
| Componentes UI (shadcn) | 14 | 2026-03-02 |
| Componentes funcionales | 9 (notes:3, reminders:2, credits:2, dashboard:2) | 2026-03-02 |
| Tests | 32 (note-card:8, note-form:4, reminder-card:6, credit-balance:5, dates:9) | 2026-03-02 |
| Frontend HEAD | `e3b3308` | 2026-03-02 |
| Deploy | Vercel auto-deploy on push to main | — |

---

## 🔑 Variables de Entorno

```bash
# .env.local (desarrollo)
NEXT_PUBLIC_SUPABASE_URL=https://iknuuplnizdlaidjpwdh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000    # En Vercel: https://cual-es-mi-nombre-web.vercel.app
NEXT_PUBLIC_API_URL=<railway_api_url>          # Backend Python
```

---

## 🎯 Referencia Rápida para Agentes

Para cualquier agente (o desarrollador futuro) que trabaje en este repo:

1. **Instalar:** `npm install`
2. **Dev server:** `npm run dev`
3. **Build:** `npm run build`
4. **Tests:** `npm run test` (o `npm run test:watch`)
5. **Agregar componente shadcn:** `npx shadcn@latest add <component>`
6. **Path alias:** `@/` → `./src/`
7. **Documentación de Fase 6:** Ver [Progreso_Fase6.md](./Progreso_Fase6.md)
8. **Tipos DB:** `src/types/database.ts` — deben coincidir con `sql/*.sql` del backend
9. **API client:** `backendApi(supabase)` desde `src/lib/api.ts`
10. **Date formatting:** `src/lib/dates.ts` — siempre usar timezone del perfil
