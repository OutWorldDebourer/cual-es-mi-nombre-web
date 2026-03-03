# Progreso Fase 6 — Frontend Web

**Documento maestro:** `Proyecto_Cual es mi nombre/docs/Fase6_Hardening_Frontend_Beta.md`  
**Este archivo:** Resumen orientado al frontend de dónde estamos y qué falta  
**Última Actualización:** 2026-03-03

---

## 📍 ¿Dónde estamos?

```
Fase 6: Hardening, Frontend Funcional y Preparación Beta
═══════════════════════════════════════════════════════════

Step  1 [I]   Infra quick wins (env vars, Sentry)       ████████████ ✅ COMPLETADO
Step  2 [B]   Rate limiting por IP                       ████████████ ✅ COMPLETADO
Step  3 [B+F] Alinear frontend con JWT auth              ████████████ ✅ COMPLETADO
Step  4 [F]   Frontend: Notas CRUD                       ████████████ ✅ COMPLETADO
Step  5 [F]   Frontend: Recordatorios + Créditos         ████████████ ✅ COMPLETADO
Step  6 [F]   Frontend: Tests (Vitest + RTL)             ████████████ ✅ COMPLETADO
Step  7 [B]   Smoke test E2E (5 escenarios)              ████████████ ✅ COMPLETADO
Step  8 [B+F] Validar onboarding completo                ░░░░░░░░░░░░ 💤 PENDIENTE
Step  9 [B+F] MercadoPago producción                     ░░░░░░░░░░░░ 💤 PENDIENTE
Step 10 [B]   Calendar: Cache Redis + CRUD               ░░░░░░░░░░░░ 💤 PENDIENTE
Step 11 [B]   Optimizaciones P2/P3                       ░░░░░░░░░░░░ 💤 FUTURO
Step 12 [B]   Docs audit final                           ░░░░░░░░░░░░ 💤 FUTURO

Progreso global: ~54% (6.5/12 Steps)
```

**Labels:** `[B]` = Backend only, `[F]` = Frontend only, `[B+F]` = Ambos repos, `[I]` = Infraestructura

---

## ✅ Steps Completados (resumen)

### Step 1 — Infra Quick Wins `[I]` ✅
- `NEXT_PUBLIC_SITE_URL` configurado en Vercel
- Sentry DSN en 3 servicios Railway (api, worker, cron)
- Logs confirman `sentry_initialized`

### Step 2 — Rate Limiting `[B]` ✅
- `RateLimitMiddleware` con sliding window Redis
- Per-route limits (WA:60, MP:30, verify-wa:10, health:120 req/min)
- 21 tests, 486 backend tests total

### Step 3 — Alinear Frontend con JWT Auth `[B+F]` ✅

**Lo que se hizo:**
- Creado `src/lib/api.ts` — `backendApi()` factory con JWT auth built-in
- Refactorizado `whatsapp/page.tsx` y `google/page.tsx` para usar `backendApi()`
- Fix crítico: ruta `/send` → `/send-code` (causaba 404)
- Eliminado envío de `user_id` en body (ahora se extrae del JWT en backend)
- 4 tests JWT nuevos en backend (503 tests total)
- E2E validation: Railway API healthy, JWT auth enforced (401 sin token), Vercel env vars confirmadas (`vercel env ls`)
- Frontend build 0 errors, 32 tests pass
- Commit: `c6af9ab` (incluido en Step 4 commit)
- **Nota:** Live E2E con phone real bloqueado por identidad dual (WA user ≠ Web user) → Resolución en Step 8

### Step 4 — Frontend: Notas CRUD `[F]` ✅
- **Commit:** `c6af9ab`
- Fix crítico en `database.ts`: corregidos tipos Note, Reminder, CreditTransaction para matchear SQL real
- `lib/dates.ts` — 5 funciones timezone-aware
- 7 componentes shadcn/ui instalados (textarea, badge, dialog, alert-dialog, dropdown-menu, table, tabs)
- 3 componentes funcionales: `NoteCard`, `NoteForm`, `NoteList`
- Server Component page `/dashboard/notes` con RLS queries
- Sidebar actualizado con 3 nuevos enlaces (Notes, Reminders, Credits)

### Step 5 — Frontend: Recordatorios + Créditos `[F]` ✅
- **Commit:** `62d770a`
- `ReminderCard` — status badges (pending/processing/sent/failed/cancelled), overdue detection, cancel
- `ReminderList` — tabs Upcoming/Sent/All
- `CreditBalance` — progress bar, low/zero warnings, upgrade CTA
- `TransactionTable` — paginada (20/page), color-coded amounts
- Server Components timezone-aware

### Step 6 — Frontend: Tests `[F]` ✅
- **Commit:** `e3b3308`
- Vitest 4.0.18 + RTL + jest-dom + user-event + jsdom
- 32 tests en 5 archivos — ALL PASSING
- Mocks: Supabase client, next/navigation, next/headers

### Step 7 — Smoke Test E2E `[B]` ✅
- 6/6 escenarios verificados en producción (Railway + WhatsApp)
- 3 bugs encontrados y corregidos inline:
  - Bug-7A P0: UUID→TEXT en `credit_transactions.reference_id`
  - Bug-7B P1: classifier sin few-shot → intent incorrecto
  - Bug-7C P1: `gemini-2.0-flash` deprecado → upgrade a `gemini-2.5-flash`
- 490 backend tests pass post-fixes
- Commits: `531e65e`, `df71026`

---

## 💤 Steps Pendientes (próximos)

### Step 8 — Validar Onboarding Completo `[B+F]` ← **EN PROGRESO**

**Sub-steps 8.A-F (CRUD WA Agents):**
- **8.A** — Classifier: agregar 4 intents faltantes (`note_delete`, `reminder_read`, `reminder_update`, `reminder_cancel`) a `VALID_INTENTS` + categorías en prompt — **PARCIAL** (prompt hardened con REGLA CRÍTICA + `_extract_intent_from_text()` fallback, pero intents NOT in frozenset aún)
- **8.B** — Notes Agent UPDATE: implementar búsqueda por título → `update_note()` real
- **8.C** — Notes Agent DELETE/ARCHIVE: implementar `archive_note()` real
- **8.D** — Reminders Agent: agregar LIST + CANCEL
- **8.E** — Router: mapear nuevos intents en `_INTENT_TO_AGENT` dict
- **8.F** — Tests: ≥ 15 nuevos tests

**Sub-steps 8.1-8.6 (Onboarding E2E):**
- 8.1 — Crear usuario test desde frontend (signup + email)
- 8.2 — Vincular WhatsApp desde dashboard (JWT)
- 8.3 — Enviar mensajes WA → verificar agentes
- 8.4 — Probar flujo de pago (si MP sandbox)
- 8.5 — Bidireccionalidad WA↔Web (notas visibles)
- 8.6 — Documentar resultados

**Bloqueante:** 2 auth.users separados sin vincular (WA `ba441ed5` vs Web `ad01b992`). Resolver en 8.2.

### Step 9 — MercadoPago Producción `[B+F]`

**Impacto frontend importante:**
- Crear página `/dashboard/plans` o `/payment` con pricing
- Conectar botón de pago con API de preapproval
- Verificar que créditos se acreditan post-pago

### Step 10 — Calendar: Cache + CRUD `[B]`
Backend only — sin impacto directo en frontend actual.

### Step 11-12 — Optimizaciones + Docs Audit `[B]`
Mayormente backend.

---

## 🔴 Temas Pendientes que afectan al Frontend

| # | Tema | Prioridad | Step | Estado |
|---|------|-----------|------|--------|
| 1 | ~~Test manual WA linking con JWT~~ | ~~Alta~~ | ~~3.6~~ | ✅ Validado (E2E: Railway JWT 401, Vercel env vars, build 0 errors) |
| 2 | Página de pricing/checkout (MercadoPago) | Crítica | 9.5-9.6 | No iniciado |
| 3 | Bidireccionalidad WA↔Web (notas visibles) | Alta | 8.5 | Bloqueado por identidad dual |
| 4 | Tests de integración (forms submit, API calls) | Media | Futuro | No iniciado |
| 5 | Responsive/mobile optimization | Media | Futuro | No iniciado |
| 6 | Loading states y error boundaries | Media | Futuro | No iniciado |
| 7 | PWA / offline support | Baja | Futuro | No iniciado |

---

## 📝 Historial de Cambios del Frontend

| Fecha | Commit | Descripción |
|-------|--------|-------------|
| 2026-03-03 | `faf16fb` | docs: update Progreso_Fase6 with Step 3 completion, Step 7/8 status |
| 2026-03-02 | `e3b3308` | test(frontend): Vitest + RTL test suite (32 tests) |
| 2026-03-02 | `62d770a` | feat(frontend): Reminders and Credits History pages |
| 2026-03-02 | `c6af9ab` | feat(frontend): Notes CRUD page with full lifecycle |
| 2026-03-01 | `ef99ab2` | docs: add NEXT_PUBLIC_SITE_URL to .env.local.example |
| 2026-03-01 | `1dfb190` | fix(whatsapp): correct API routes, add user_id, phone validation |
| 2026-03-01 | `d3c9831` | fix(auth): dynamic getSiteURL() for email redirect |
| 2026-03-01 | `be3ff9a` | fix: align frontend types with real DB schema |
| 2026-02-28 | `fbb89a2` | feat: frontend scaffold (Next.js 16 + Supabase SSR + shadcn/ui) |

---

## 🎯 Siguiente Acción Recomendada

**Para el frontend:** El trabajo de Steps 4-6 está completado. Los próximos Steps con impacto frontend son:

1. **Step 8.5** (Bidireccionalidad WA↔Web) — Verificar que notas/recordatorios creados vía WhatsApp aparecen en dashboard. Bloqueado por identidad dual.
2. **Step 9** (MercadoPago) — Crear página `/dashboard/plans` o `/payment` con pricing

**Para el backend:** Step 8.A (intents faltantes en classifier) es la siguiente acción inmediata.

```
Ruta crítica:    1✅ → 2✅ → 3✅ → 7✅ → 8🚧 → 9💤
Frontend done:   4✅ → 5✅ → 6✅
```
