# Progreso Fase 6 — Frontend Web

**Documento maestro:** `Proyecto_Cual es mi nombre/docs/Fase6_Hardening_Frontend_Beta.md`  
**Este archivo:** Resumen orientado al frontend de dónde estamos y qué falta  
**Última Actualización:** 2026-03-05

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
Step  8 [B+F] Validar onboarding completo                ████████████ ✅ COMPLETADO
Step  9 [B+F] MercadoPago producción                     ████████████ ✅ COMPLETADO (9.1-9.10)
Step 10 [B]   Calendar: Cache Redis + CRUD               ████████████ ✅ COMPLETADO
Step 11 [B]   Optimizaciones P2/P3                       ████████████ ✅ COMPLETADO
Step 12 [B]   Docs audit final                           ████████████ ✅ COMPLETADO

Progreso global: 100% (12/12 Steps) — FASE 6 CERRADA
Post-Fase 6:  MP Producción desplegado + E2E Payment ✅
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

## ✅ Step 8 — Validar Onboarding Completo `[B+F]` ✅

**Completado:** 8.A-8.F (CRUD WA Agents) + 8.1-8.6 (Onboarding E2E)
- 8.A: Classifier hardened con 4 intents faltantes, `_extract_intent_from_text()` fallback
- 8.B-8.D: Notes UPDATE/DELETE/ARCHIVE + Reminders LIST/CANCEL implementados
- 8.E: Router `_INTENT_TO_AGENT` mapeado completo
- 8.F: 138 nuevos tests (total 626 backend tests post Step 8)
- Identidad dual resuelta en 8.2 (WA + Web users vinculados)
- 644 backend tests total (post Step 8.6 + Step 9 additions)

---

## 🚧 Steps Pendientes (próximos)

### Step 9 — MercadoPago Producción `[B+F]` ✅ COMPLETADO (9.1-9.10)

**Backend (9.1-9.9):**
- 9.2A: `PlanConfig` en `constants.py` con description, features, badge, is_highlighted
- 9.2B: `mercadopago_service.py` hardened (PEN, dynamic back_urls, `create_plan_preference()`)
- 9.2C: `checkout.py` — `GET /api/plans` (público) + `POST /api/checkout/create-preference` (JWT)
- 9.2D: 18 tests en `test_checkout.py`
- 9.7: Webhook IPN pipeline audited, 2 bugs P0/P1 corregidos (reference parser + notification_url)
- 9.8: E2E payment pipeline verified (23/23 checks), API_PUBLIC_URL configured
- 9.9: Production readiness hardening (token detection, health check MP section)

**Frontend (9.5-9.6, 9.10):**
- 9.5A: **Página `/dashboard/plans`** — `PlanCard` + `PlanGrid` components + Server Component page
- 9.5B: **Checkout flow** — `paymentsApi` module en `api.ts`, redirect a MercadoPago `init_point`
- Nav: "Planes 💎" en sidebar, "Mejorar plan" button en credit-balance
- 9.10: Commit `92cf99a` — `feat(payments): add checkout/pricing page`
- Types: `PlanInfo`, `PlansListResponse`, `CheckoutPreferenceResponse` en `database.ts`

**Baseline:** 666 backend tests, 32 frontend tests, build 0 errors

**Nota:** Railway `MERCADOPAGO_ACCESS_TOKEN` actualizado a producción (`APP_USR-...3086167086`). 5 bugs corregidos post-Fase6 (retry 429, start_date/end_date, LLM URL reuse, payer_email, FRONTEND_URL). E2E suscripción exitosa con test accounts (Operation 148054818703). 713 backend tests.

### Step 10 — Calendar: Cache + CRUD `[B]` ✅ COMPLETADO
Backend only — cache read-through Redis (TTL 300s), `update_event()` PATCH, `delete_event()`. 29 tests nuevos. 692 tests total.

### Step 11-12 — Optimizaciones + Docs Audit `[B]` ✅ COMPLETADO
Cron 60s, Estructura_Proyecto.md auditado (11 deltas), future items documented inline. Docs audit final — Fase 6 cerrada.

---

## 🔴 Temas Pendientes que afectan al Frontend

| # | Tema | Prioridad | Step | Estado |
|---|------|-----------|------|--------|
| 1 | ~~Test manual WA linking con JWT~~ | ~~Alta~~ | ~~3.6~~ | ✅ Validado (E2E: Railway JWT 401, Vercel env vars, build 0 errors) |
| 2 | Página de pricing/checkout (MercadoPago) | Crítica | 9.5-9.6 | ✅ Código completo + MP producción desplegado |
| 3 | Bidireccionalidad WA↔Web (notas visibles) | Alta | 8.5 | ✅ Resuelto en Step 8 |
| 4 | Tests de integración (forms submit, API calls) | Media | Fase 7 | No iniciado |
| 5 | Responsive/mobile optimization | Media | Fase 7 | No iniciado |
| 6 | Loading states y error boundaries | Media | Fase 7 | No iniciado |
| 7 | PWA / offline support | Baja | Futuro | No iniciado |

---

## 📝 Historial de Cambios del Frontend

| Fecha | Commit | Descripción |
|-------|--------|-------------|
| 2026-03-03 | `92cf99a` | feat(payments): add checkout/pricing page (Step 9.10) |
| 2026-03-03 | `8dc341a` | docs: orientation update Steps 7/8 status |
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

**Fase 6 COMPLETADA (12/12 Steps).** MP Producción desplegado y validado E2E.

**Siguiente (Fase 7 — Beta con usuario real):**
1. Primer pago real con tarjeta real (no test accounts)
2. Verificar webhook IPN en producción → créditos acreditados automáticamente
3. Tests de integración frontend (forms submit, API calls)
4. Responsive/mobile optimization
5. Loading states y error boundaries
6. Calendar dashboard page

```
Fase 6:          1✅ → 2✅ → 3✅ → 4✅ → 5✅ → 6✅ → 7✅ → 8✅ → 9✅ → 10✅ → 11✅ → 12✅ — CERRADA
Post-Fase 6:     MP Prod ✅ → 5 bug fixes ✅ → E2E Payment ✅
Fase 7:          Primer pago real 💤 → Webhook IPN prod 💤 → Frontend hardening 💤
```
