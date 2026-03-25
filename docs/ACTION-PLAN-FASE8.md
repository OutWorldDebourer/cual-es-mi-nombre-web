# Plan de Acción — Fase 8: Fixes críticos + Chat flotante

**Fecha:** 2026-03-25
**Estado:** ✅ Completado

---

## ✅ Tarea 8.1 — Fix definitivo del badge "Pendiente" en reminder-card

- **Prioridad:** P0
- **Complejidad:** M (30-90 min)
- **Archivos:** `src/components/reminders/reminder-card.tsx`
- **Problema:** El badge "Pendiente" se sigue cortando como "Pendient" en mobile. Los fixes anteriores (Fases 1, post-fase, y Fase 7) no resolvieron el problema completamente. El badge de recurrencia ("📅 Cada día hasta el 31 de marzo de 2026") + "#6" + "Pendiente" compiten por espacio en la fila de badges.
- **Qué hacer:**
  1. Lee el archivo actual y entiende la estructura del header (2 filas: fecha + badges)
  2. El badge de STATUS ("Pendiente", "Enviado", etc.) es CORTO y NUNCA debe truncarse. Debe tener `shrink-0 whitespace-nowrap`
  3. El badge de RECURRENCIA es el que debe ceder espacio — aplicar `truncate min-w-0 max-w-[40%]` o similar
  4. El "#6" (índice) debe tener `shrink-0`
  5. Si no cabe todo en una fila, considerar mover el badge de recurrencia a una TERCERA fila debajo
  6. Alternativa: en mobile, el badge de recurrencia puede mostrarse como solo un ícono "🔄" con tooltip, sin el texto completo
  7. PRUEBA MENTAL: "📅 Cada día hasta el 31 de marzo de 2026  #6  Pendiente" en 360px con padding → ¿cabe? Si no, reducir
- **Criterio de éxito:** "Pendiente" se lee COMPLETO en pantallas de 360px con badge de recurrencia largo
- **Branch:** `dev/fase-8-tarea-1-reminder-badge-fix`

---

## ✅ Tarea 8.2 — Chat flotante (FAB + drawer/overlay)

- **Prioridad:** P1
- **Complejidad:** L (> 90 min)
- **Archivos:**
  - `src/components/chat/chat-fab.tsx` (crear)
  - `src/components/chat/chat-overlay.tsx` (crear)
  - `src/components/dashboard/shell.tsx` (modificar — agregar FAB)
  - `src/components/dashboard/bottom-nav.tsx` (modificar — remover tab de Chat)
  - `src/app/dashboard/chat/page.tsx` (puede mantenerse como fallback desktop o eliminarse)
- **Problema:** El chat es una página separada (`/dashboard/chat`) con su propia ruta. En mobile no carga. Debería ser un botón flotante (FAB) disponible en TODAS las vistas del dashboard que abre un overlay/drawer de chat.
- **Qué hacer:**
  1. Crear `chat-fab.tsx` — botón flotante fijo en bottom-right (encima de la bottom nav en mobile)
     - Ícono de MessageSquare de Lucide
     - Badge con conteo de mensajes no leídos (si existe el dato) o sin badge
     - Posición: `fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50`
     - El FAB se oculta cuando el chat está abierto
  2. Crear `chat-overlay.tsx` — panel de chat que se abre al hacer tap en el FAB
     - En MOBILE: Drawer desde abajo (85vh) usando el componente Drawer de vaul/shadcn
     - En DESKTOP: Panel lateral derecho (400px width) con posición fixed, o Drawer desde la derecha
     - Reutilizar los componentes existentes: `ChatHeader`, `ChatMessageList`, `ChatInput`
     - Cerrar con swipe down (mobile) o botón X (desktop)
  3. Modificar `shell.tsx` — agregar `<ChatFab />` y `<ChatOverlay />` al layout
  4. Modificar `bottom-nav.tsx` — REMOVER el tab de "Chat" (ya no es una página, es un overlay)
     - Quedan 4 tabs: Inicio, Notas, Recordatorios, Config
  5. La página `/dashboard/chat/page.tsx` puede redirigir al dashboard o mantenerse como fallback
  6. El chat overlay debe:
     - Cargar mensajes al abrirse (no pre-cargar)
     - Mantener el scroll position al cerrar y reabrir (mientras la sesión esté activa)
     - No interferir con la navegación de otras páginas
     - Tener un skeleton/loading state
- **Criterio de éxito:** Botón de chat visible en todas las vistas del dashboard. Al tocarlo, abre el chat como overlay. En mobile se puede cerrar con swipe. No es una página separada.
- **Branch:** `dev/fase-8-tarea-2-chat-flotante`

---

## ✅ Tarea 8.3 — Investigar por qué el chat no carga en mobile

- **Prioridad:** P0 (bloquea 8.2)
- **Complejidad:** M
- **Archivos:** `src/components/chat/chat-view.tsx`, `src/app/dashboard/chat/page.tsx`, `src/lib/api.ts`
- **HACER ANTES de 8.2**
- **Qué hacer:**
  1. Leer `chat/page.tsx` y `chat-view.tsx` — entender el flujo de carga
  2. Buscar qué podría fallar en mobile: ¿es un problema de auth? ¿de API? ¿de layout?
  3. Verificar si `backendApi` tiene el endpoint correcto
  4. Verificar si hay algún `useEffect` que dependa de window/document no disponible en SSR
  5. Si encuentras el bug, corregirlo ANTES de implementar el chat flotante
  6. Si no puedes reproducir, documenta lo que encontraste
- **Branch:** `dev/fase-8-tarea-3-chat-debug`

---

## Resumen

| Tarea | Prioridad | Complejidad | Descripción |
|-------|-----------|-------------|-------------|
| 8.3 | P0 | M | Debug chat mobile (hacer PRIMERO) |
| 8.1 | P0 | M | Fix badge "Pendiente" cortado |
| 8.2 | P1 | L | Chat como FAB + overlay flotante |

**Orden de ejecución:** 8.3 → 8.1 → 8.2
**Esfuerzo total estimado:** ~4-5h

---

## Resultado de Ejecución

**Fecha:** 2026-03-25
**Vitest:** ✅ 229 tests passed, 0 failed

### Tarea 8.3 — Diagnóstico chat mobile
- **Hallazgo:** El error "Error al cargar historial" es un error de red/API (fetch falla silenciosamente), NO un problema de SSR/layout/hydration
- **Causa probable:** `TypeError` en fetch (CORS, mixed content, o API timeout) — el catch solo mostraba mensaje genérico sin retry
- **Fix:** Retry hasta 2 veces con backoff exponencial en errores de red/servidor + mensajes descriptivos por tipo de error
- **Archivo:** `src/components/chat/chat-view.tsx`
- **Commit:** `45a441f`

### Tarea 8.1 — Badge "Pendiente"
- **Fix:** Separé `#N` del badge de recurrencia en su propio `<span shrink-0>`. En mobile (<640px) el badge de recurrencia muestra solo "🔄", en desktop muestra texto completo
- **Archivo:** `src/components/reminders/reminder-card.tsx`
- **Also fixed:** `onView` prop faltante en test, `NODE_ENV` en vitest.config.ts (resolvió 150 fallos pre-existentes de React.act)
- **Commit:** `358925b`

### Tarea 8.2 — Chat flotante
- **Archivos creados:** `chat-fab.tsx`, `chat-overlay.tsx`
- **Archivos modificados:** `shell.tsx` (FAB+Overlay), `bottom-nav.tsx` (removió tab Chat), `chat/page.tsx` (redirect)
- **Mobile:** Drawer bottom (85vh) via vaul, swipe to close
- **Desktop:** Sheet right (400px) via radix/Sheet
- **Lazy load:** Mensajes se cargan al abrir por primera vez, no pre-cargados
- **Bottom nav:** 4 tabs (Inicio, Notas, Recordatorios, Config)
- **Commit:** `212f080`
