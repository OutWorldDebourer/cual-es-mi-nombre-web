# Arquitectura del Frontend — "Cuál es mi nombre" Web

**Última Actualización:** 2026-03-02

---

## 🏛️ Patrones de Arquitectura

### Server Components vs Client Components

Seguimos la convención de Next.js App Router:

| Tipo | Dónde | Qué hace |
|------|-------|----------|
| **Server Component** | `page.tsx`, `layout.tsx` | Fetch de datos, auth guard, pasar props |
| **Client Component** | Archivos con `"use client"` | Interactividad, estado, event handlers |

**Regla:** Los `page.tsx` de dashboard son Server Components que:
1. Obtienen el usuario de Supabase Auth (server-side)
2. Hacen queries directas a DB con RLS
3. Pasan datos down como props a Client Components

```
[Server] dashboard/notes/page.tsx
  └── fetch notes from Supabase (RLS)
  └── render <NoteList initialNotes={notes} />

[Client] components/notes/note-list.tsx
  └── useState, useEffect
  └── CRUD con Supabase browser client
  └── render <NoteCard /> + <NoteForm />
```

### Auth Guard Pattern

`dashboard/layout.tsx` actúa como guard:

```typescript
// Server Component
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");

const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();

return <DashboardShell user={user} profile={profile}>{children}</DashboardShell>;
```

Esto garantiza que **ninguna página dentro de `/dashboard/*` se renderiza sin usuario autenticado**.

### Backend API Communication

Para endpoints del backend Python (Railway), usamos `backendApi()`:

```typescript
import { createClient } from "@/lib/supabase/client";
import { backendApi, ApiError } from "@/lib/api";

const supabase = createClient();
const api = backendApi(supabase);

// El JWT se incluye automáticamente
await api.whatsapp.sendCode(phone);
await api.whatsapp.confirmCode(code);
await api.google.getConnectUrl();
```

**Importante:** El `user_id` **nunca** se envía en el body. Se extrae del JWT en el backend.

---

## 🗃️ Tipos de Datos (database.ts)

Los tipos en `src/types/database.ts` deben coincidir **exactamente** con el SQL del backend:

| Tipo | Tabla SQL | Campos Clave |
|------|-----------|--------------|
| `Profile` | `profiles` | `plan`, `credits_remaining`, `google_token_vault_id`, `timezone` |
| `Note` | `notes` | `title`, `content`, `tags[]`, `is_pinned`, `is_archived` |
| `Reminder` | `reminders` | `content`, `trigger_at`, `status` (enum), `channel` |
| `CreditTransaction` | `credit_transactions` | `amount`, `action` (enum), `balance_after` |
| `Subscription` | `subscriptions` | `plan`, `status`, `mp_preapproval_id` |

### Enums (deben coincidir con `001_enums.sql`)

```typescript
type ReminderStatus = "pending" | "processing" | "sent" | "failed" | "cancelled";
type CreditAction = "message" | "calendar_op" | "note" | "reminder" | "audio_transcription" 
                   | "complex_query" | "monthly_reset" | "admin_adjustment" | "bonus";
type SubscriptionPlan = "free" | "basic" | "pro" | "premium";
```

---

## 🔒 Seguridad (RLS)

Todas las queries del frontend pasan por **Row Level Security** de Supabase:

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `notes` | ✅ Propias | ✅ Crear | ✅ Propias | ✅ Propias |
| `reminders` | ✅ Propias | ❌ | ✅ Propias (solo cancel) | ❌ |
| `credit_transactions` | ✅ Propias | ❌ | ❌ | ❌ |
| `profiles` | ✅ Propio | ❌ | ✅ Propio (limitado) | ❌ |

**Regla:** Reminders y credit_transactions solo se **crean desde el backend** (vía agentes de WhatsApp). El frontend solo los **lee** (y cancela reminders).

---

## 🎨 Componentes UI

### shadcn/ui Components (14 instalados)

```
alert-dialog  badge      button     card       dialog
dropdown-menu form       input      label      separator
table         tabs       textarea
```

Para agregar más: `npx shadcn@latest add <nombre>`

### Componentes Funcionales

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `DashboardShell` | `components/dashboard/shell.tsx` | Sidebar + header (Client Component) |
| `LogoutButton` | `components/dashboard/logout-button.tsx` | Logout de Supabase |
| `NoteCard` | `components/notes/note-card.tsx` | Card con dropdown (edit, pin, archive, delete) |
| `NoteForm` | `components/notes/note-form.tsx` | Dialog crear/editar nota |
| `NoteList` | `components/notes/note-list.tsx` | Manager con CRUD, búsqueda, tabs |
| `ReminderCard` | `components/reminders/reminder-card.tsx` | Status badges, overdue, cancel |
| `ReminderList` | `components/reminders/reminder-list.tsx` | Tabs upcoming/sent/all |
| `CreditBalance` | `components/credits/credit-balance.tsx` | Balance + progress bar + warnings |
| `TransactionTable` | `components/credits/transaction-table.tsx` | Tabla paginada, color-coded |

---

## 🧪 Testing

### Stack
- **Vitest** 4.0.18 — Test runner (compatible con Vite ecosystem)
- **@testing-library/react** — Render + queries
- **@testing-library/jest-dom** — Matchers (`toBeInTheDocument`, etc.)
- **@testing-library/user-event** — Simulación de interacciones
- **jsdom** — DOM environment

### Config
- **Config:** `vitest.config.ts` (jsdom env, globals: true, `@/` alias)
- **Setup:** `src/__tests__/setup.ts` (mocks de Supabase, next/navigation, next/headers)

### Mocks Globales

```typescript
// Supabase client mock — mockSupabaseClient
// Soporta: auth.getUser(), auth.getSession(), from().select/insert/update/delete chains

// Next.js mocks
// next/navigation: useRouter(), usePathname(), redirect()
// next/headers: cookies()
```

### Tests Existentes (32 total)

| Archivo | Tests | Qué verifica |
|---------|-------|-------------|
| `note-card.test.tsx` | 8 | Render, pin indicator, tags, truncation, delete dialog, edit, toggle pin |
| `note-form.test.tsx` | 4 | Create mode, edit mode, validation (empty content), submit |
| `reminder-card.test.tsx` | 6 | Render, sent badge, cancel visibility, cancel click, original_text, failed_reason |
| `credit-balance.test.tsx` | 5 | Render, low warning, zero message, premium (no upgrade), upgrade button |
| `dates.test.ts` | 9 | formatDateTime, formatDate, formatRelativeTime (×3), isPast (×2), isToday (×2) |

### Comandos

```bash
npm run test          # vitest run — corre todos y sale
npm run test:watch    # vitest — modo watch para desarrollo
```

---

## 📌 Convenciones

1. **Idioma de UI:** Español (es-PE target audience)
2. **Idioma de código:** Inglés (variables, funciones, componentes)
3. **Idioma de comentarios:** Español en JSDoc headers, inglés en inline
4. **Path alias:** `@/` → `./src/`
5. **Imports:** Absolutas con `@/`, nunca relativas cruzando carpetas
6. **Componentes:** PascalCase, un componente por archivo
7. **Páginas:** `page.tsx` — Server Component por defecto
8. **Client Components:** Añadir `"use client"` al inicio
9. **Types:** En `types/database.ts` para tipos de DB, inline para props
10. **Fechas:** Siempre usar `lib/dates.ts` — nunca `toLocaleString()` directo
