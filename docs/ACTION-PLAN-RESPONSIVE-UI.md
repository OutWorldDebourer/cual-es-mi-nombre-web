# Plan de Acción — Responsive & UI/UX

**Fecha:** 2026-03-25
**Base:** `AUDIT-RESPONSIVE-UI.md`
**Estado:** Fase 1 ✅ | Fase 2 ✅

---

## Fase 1 — Fundamentos y Overflow (P0/P1 quick wins)

Tareas defensivas que previenen overflow en todo el proyecto. Se despliegan juntas como un "hardening" pass.

---

### ✅ Tarea 1.1 — Agregar `overflow-hidden` al componente base `<Card>`

- **Prioridad:** P0
- **Complejidad:** S (< 30 min)
- **Archivos:** `src/components/ui/card.tsx`
- **Dependencias:** ninguna
- **Qué hacer:** En la función `Card`, agregar `overflow-hidden` a las clases base del `<div>`:
  ```tsx
  className={cn(
    "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm overflow-hidden",
    className
  )}
  ```
  Esto elimina ~10 hallazgos de overflow defensivo de golpe (dashboard cards, settings cards, credit-balance, whatsapp-linking, etc.).
- **Criterio de éxito:** Todas las `<Card>` del proyecto tienen `overflow-hidden` por defecto. Verificar visualmente que ninguna card pierde contenido visible (scroll en note-card grid, reminder board, etc.). Grep `overflow-hidden` en card.tsx confirma.
- **Branch:** `dev/fase-1-tarea-1-card-overflow-hidden`

---

### ✅ Tarea 1.2 — Fix `truncate` en saludo del dashboard

- **Prioridad:** P1
- **Complejidad:** S (< 30 min)
- **Archivos:** `src/app/dashboard/page.tsx`
- **Dependencias:** ninguna
- **Qué hacer:** En el `<h1>` del saludo (línea ~115-119) que muestra `"Hola ${displayName}, soy ${assistantName}"`, agregar `truncate` o `line-clamp-2` para prevenir desbordamiento con nombres largos:
  ```tsx
  <h1 className="text-2xl font-bold tracking-tight line-clamp-2">
  ```
  Verificar que el `<h1>` está dentro de un contenedor con ancho limitado (no `w-full` sin restricción).
- **Criterio de éxito:** Con un displayName de 30+ caracteres y un assistantName largo, el texto no desborda horizontalmente en 320px. Se muestra en 2 líneas máximo con ellipsis.
- **Branch:** `dev/fase-1-tarea-2-dashboard-h1-truncate`

---

### ✅ Tarea 1.3 — Fix `w-48` en note-card list layout

- **Prioridad:** P1
- **Complejidad:** S (< 30 min)
- **Archivos:** `src/components/notes/note-card.tsx`
- **Dependencias:** ninguna
- **Qué hacer:** En el layout `list` (~línea 305), el título tiene `w-48` fijo que desborda en pantallas <375px. Cambiar a responsive:
  ```tsx
  // Antes
  className="w-48 truncate ..."
  // Después
  className="w-32 sm:w-48 truncate ..."
  ```
  O usar `max-w-[12rem] shrink min-w-0` para que sea flexible.
- **Criterio de éxito:** En viewport 320px, la fila de nota en list view no desborda horizontalmente. El título se trunca correctamente.
- **Branch:** `dev/fase-1-tarea-3-notecard-list-width`

---

### ✅ Tarea 1.4 — Fix `shrink-0` en fecha de reminder-card

- **Prioridad:** P1
- **Complejidad:** S (< 30 min)
- **Archivos:** `src/components/reminders/reminder-card.tsx`
- **Dependencias:** ninguna
- **Qué hacer:** En el `CardTitle` (~línea 107), la fecha tiene `whitespace-nowrap shrink-0`. En pantallas <360px con fechas largas ("Mié 25 mar 2026, 10:30 PM"), esto fuerza al menú fuera del viewport. Cambiar:
  ```tsx
  // Antes
  className="whitespace-nowrap shrink-0 ..."
  // Después
  className="truncate min-w-0 ..."
  ```
  El `whitespace-nowrap` se puede mantener si se agrega `truncate` (que lo incluye implícitamente). Lo importante es remover `shrink-0`.
- **Criterio de éxito:** En viewport 340px, una reminder con fecha larga muestra la fecha truncada y el menú ⋮ permanece visible.
- **Branch:** `dev/fase-1-tarea-4-reminder-date-shrink`

---

### ✅ Tarea 1.5 — Fix title + badges overflow en note-view-dialog

- **Prioridad:** P1
- **Complejidad:** S (< 30 min)
- **Archivos:** `src/components/notes/note-view-dialog.tsx`
- **Dependencias:** ninguna
- **Qué hacer:** En el `DialogTitle` (~línea 55-68), el `flex items-center gap-2` con título largo + 2 badges `shrink-0` excede el ancho del dialog en mobile. Aplicar:
  ```tsx
  <DialogTitle className="flex items-center gap-2 min-w-0">
    <span className="truncate min-w-0">{note.title}</span>
    <Badge className="shrink-0">...</Badge>
    <Badge className="shrink-0">...</Badge>
  </DialogTitle>
  ```
  O alternativamente, usar `flex-wrap` para que los badges bajen a la siguiente línea:
  ```tsx
  <DialogTitle className="flex items-center gap-2 flex-wrap">
  ```
- **Criterio de éxito:** En viewport 320px, un título de nota de 50+ caracteres con 2 badges no desborda el dialog. Los badges permanecen visibles (truncados o en segunda línea).
- **Branch:** `dev/fase-1-tarea-5-noteview-dialog-overflow`

---

## Fase 2 — Mobile Navigation & Forms (P1 experiencia) ✅

Mejoras de experiencia mobile que cambian cómo se siente la app en teléfono. Se despliegan juntas.

---

### ✅ Tarea 2.1 — Bottom navigation tab bar para mobile

- **Prioridad:** P1
- **Complejidad:** L (> 90 min)
- **Archivos:**
  - `src/components/layout/bottom-nav.tsx` (crear)
  - `src/components/layout/shell.tsx` (modificar — agregar bottom nav, ajustar padding-bottom)
  - `src/components/layout/sidebar.tsx` (modificar — ocultar hamburger trigger en mobile si bottom nav activa)
- **Dependencias:** ninguna
- **Qué hacer:**
  1. Crear `bottom-nav.tsx` con una barra fija en bottom con 5 tabs: Home (`/dashboard`), Chat (`/dashboard/chat`), Notas (`/dashboard/notes`), Recordatorios (`/dashboard/reminders`), Config (`/dashboard/settings`).
  2. Usar iconos de Lucide (`Home`, `MessageSquare`, `StickyNote`, `Bell`, `Settings`).
  3. Clases: `fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex items-center justify-around h-16 md:hidden`.
  4. Active state: `text-primary` vs `text-muted-foreground`.
  5. En `shell.tsx`: agregar `pb-16 md:pb-0` al contenedor principal para evitar que el contenido quede detrás de la barra.
  6. Considerar ocultar la barra cuando el keyboard está abierto (detectar con `visualViewport` API).
- **Criterio de éxito:** En mobile (<768px), aparece una bottom tab bar con 5 items. Cada tap navega a la ruta correcta. El item activo tiene color primario. El contenido no queda oculto detrás de la barra. En desktop (≥768px), no se muestra.
- **Branch:** `dev/fase-2-tarea-1-bottom-nav`

---

### ✅ Tarea 2.2 — Dialogs → Drawer (bottom sheet) en mobile para formularios

- **Prioridad:** P1
- **Complejidad:** L (> 90 min)
- **Archivos:**
  - `src/components/ui/responsive-dialog.tsx` (crear)
  - `src/components/notes/note-form-dialog.tsx` (modificar)
  - `src/components/reminders/reminder-form-dialog.tsx` (modificar)
  - `package.json` (si se necesita `vaul` para el Drawer — verificar si shadcn ya lo tiene)
- **Dependencias:** ninguna
- **Qué hacer:**
  1. Verificar si shadcn/ui ya tiene el componente `Drawer` (basado en `vaul`). Si no, instalar: `npx shadcn@latest add drawer`.
  2. Crear `responsive-dialog.tsx` que renderice `Dialog` en desktop (≥768px) y `Drawer` en mobile (<768px). Usar `useMediaQuery` hook o `useIsMobile` si ya existe.
     ```tsx
     export function ResponsiveDialog({ children, ...props }) {
       const isMobile = useIsMobile()
       const Component = isMobile ? Drawer : Dialog
       return <Component {...props}>{children}</Component>
     }
     // Exportar también ResponsiveDialogContent, ResponsiveDialogHeader, etc.
     ```
  3. Reemplazar `Dialog` → `ResponsiveDialog` en `note-form-dialog.tsx` y `reminder-form-dialog.tsx`.
  4. Asegurar que el Drawer ocupe ~85vh y tenga scroll interno para forms largos.
- **Criterio de éxito:** En mobile, al crear/editar nota o recordatorio, el form aparece como bottom sheet deslizándose desde abajo. Se puede cerrar con swipe down. En desktop, sigue siendo un dialog modal centrado.
- **Branch:** `dev/fase-2-tarea-2-responsive-dialog`

---

### ✅ Tarea 2.3 — Touch targets mínimos para botones icon-xs

- **Prioridad:** P1
- **Complejidad:** S (< 30 min)
- **Archivos:**
  - `src/components/notes/note-card.tsx`
  - `src/components/reminders/reminder-card.tsx`
  - Cualquier otro componente que use `size="icon-xs"` o botones de acción <44px
- **Dependencias:** ninguna
- **Qué hacer:** Los botones ⋮ (menú de acciones) y otros `size="icon-xs"` (~28px) no cumplen el mínimo de 44px para touch targets (WCAG 2.5.8). Agregar padding invisible:
  ```tsx
  // Opción A: padding en el botón
  <Button size="icon-xs" className="relative after:absolute after:inset-[-8px] after:content-['']">
  
  // Opción B: min-size con padding visual
  <Button size="icon-xs" className="min-h-[44px] min-w-[44px] flex items-center justify-center">
  ```
  La Opción B es más directa. Evaluar si afecta el layout de las cards (probablemente no si el contenedor tiene `items-center`).
- **Criterio de éxito:** Todos los botones de acción en cards tienen un área de toque de al menos 44×44px. Verificar en Chrome DevTools > "Show accessibility information" o midiendo visualmente.
- **Branch:** `dev/fase-2-tarea-3-touch-targets`

---

## Fase 3 — Mejoras de Layout Mobile (P2 polish)

Refinamientos de layout que hacen la app más pulida en mobile.

---

### Tarea 3.1 — Dashboard stats cards: horizontal scroll en mobile

- **Prioridad:** P2
- **Complejidad:** M (30-90 min)
- **Archivos:** `src/app/dashboard/page.tsx`
- **Dependencias:** ninguna
- **Qué hacer:** Las 4 cards de stats (`grid md:grid-cols-2 lg:grid-cols-4`) se apilan verticalmente en mobile. Cambiar a scroll horizontal tipo "stories":
  ```tsx
  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
  ```
  Cada card de stats:
  ```tsx
  <Card className="snap-center min-w-[200px] shrink-0 md:min-w-0 md:shrink">
  ```
  Agregar clase utilitaria `scrollbar-hide` si no existe (`-webkit-scrollbar: none; scrollbar-width: none`).
- **Criterio de éxito:** En mobile, las 4 stats cards se muestran en un carrusel horizontal con snap. Se puede scroll lateralmente. En desktop, se mantiene el grid actual.
- **Branch:** `dev/fase-3-tarea-1-stats-horizontal-scroll`

---

### Tarea 3.2 — Breadcrumb → back link en mobile

- **Prioridad:** P2
- **Complejidad:** M (30-90 min)
- **Archivos:**
  - `src/components/layout/shell.tsx` o donde se renderice el breadcrumb
  - Posiblemente `src/components/layout/breadcrumb.tsx` si existe como componente separado
- **Dependencias:** ninguna
- **Qué hacer:** El breadcrumb completo (`dashboard > Configuración > Google Calendar`) ocupa espacio vertical en mobile sin aportar mucho. En mobile (<768px), reemplazar por un back link:
  ```tsx
  <div className="hidden md:block border-b px-4 py-2 md:px-6">
    <Breadcrumb>...</Breadcrumb>
  </div>
  <div className="md:hidden border-b px-4 py-2">
    <Link href={parentPath} className="flex items-center gap-1 text-sm text-muted-foreground">
      <ChevronLeft className="h-4 w-4" /> {parentLabel}
    </Link>
  </div>
  ```
  Calcular `parentPath` y `parentLabel` a partir del path actual (quitar el último segmento).
- **Criterio de éxito:** En mobile, solo se muestra "← Configuración" en vez del breadcrumb completo. Tap navega al padre. En desktop, breadcrumb completo se mantiene.
- **Branch:** `dev/fase-3-tarea-2-breadcrumb-mobile`

---

### Tarea 3.3 — Tab transitions suaves

- **Prioridad:** P2
- **Complejidad:** S (< 30 min)
- **Archivos:**
  - `src/components/notes/note-list.tsx`
  - `src/components/reminders/reminder-list.tsx` (o donde se rendericen las tabs Active/Archived)
- **Dependencias:** ninguna
- **Qué hacer:** Al cambiar entre tabs (Active/Archived en notas, tabs de reminders), agregar una transición de opacidad para suavizar el re-render:
  ```tsx
  <div className="animate-in fade-in duration-150" key={activeTab}>
    {/* contenido de la tab */}
  </div>
  ```
  Usar las utilidades de animación de Tailwind (`animate-in fade-in`) o las de shadcn si están disponibles.
- **Criterio de éxito:** Al cambiar de tab, el contenido hace fade-in en ~150ms en vez de un corte abrupto. Sin afectar rendimiento.
- **Branch:** `dev/fase-3-tarea-3-tab-transitions`

---

## Fase 4 — Accesibilidad (P2 a11y)

Fixes de accesibilidad menores para cumplir WCAG AA.

---

### Tarea 4.1 — `aria-hidden` en emojis de dropdown menus

- **Prioridad:** P2
- **Complejidad:** S (< 30 min)
- **Archivos:**
  - `src/components/notes/note-card.tsx`
  - `src/components/reminders/reminder-card.tsx`
  - Cualquier otro componente con emojis en `DropdownMenuItem`
- **Dependencias:** ninguna
- **Qué hacer:** Los emojis en items de dropdown (✏️ Editar, 📌 Fijar, 🗑️ Eliminar) son leídos por screen readers como "marca de verificación Editar". Envolver en `<span aria-hidden="true">`:
  ```tsx
  // Antes
  <DropdownMenuItem>✏️ Editar</DropdownMenuItem>
  // Después
  <DropdownMenuItem><span aria-hidden="true">✏️</span> Editar</DropdownMenuItem>
  ```
  Buscar todos los usos con: `rg "DropdownMenuItem.*[^\x00-\x7F]" src/` para encontrar emojis en menús.
- **Criterio de éxito:** Screen readers leen "Editar", "Fijar", "Eliminar" sin el prefijo del emoji. Los emojis siguen siendo visibles para usuarios videntes.
- **Branch:** `dev/fase-4-tarea-1-emoji-aria-hidden`

---

### Tarea 4.2 — Verificar y corregir contraste en badges de notas completadas

- **Prioridad:** P2
- **Complejidad:** S (< 30 min)
- **Archivos:**
  - `src/components/notes/note-card.tsx`
- **Dependencias:** ninguna
- **Qué hacer:** Los badges `text-[10px]` con `opacity-60` en notas completadas podrían no pasar WCAG AA (ratio 4.5:1). Verificar:
  1. Inspeccionar en Chrome DevTools el color computado del badge text con opacity
  2. Usar herramienta de contraste (axe DevTools, WebAIM contrast checker)
  3. Si no pasa 4.5:1, subir la opacidad a `opacity-70` o `opacity-75`, o usar un color explícito con suficiente contraste en vez de opacity
- **Criterio de éxito:** Todos los badges de texto pasan WCAG AA contrast ratio (4.5:1) tanto en tema claro como oscuro.
- **Branch:** `dev/fase-4-tarea-2-badge-contrast`

---

## Fase 5 — Dashboard Enhancements (P2 features)

Mejoras funcionales del dashboard que añaden valor.

---

### Tarea 5.1 — Widget "Próximos hoy" en dashboard

- **Prioridad:** P2
- **Complejidad:** L (> 90 min)
- **Archivos:**
  - `src/components/dashboard/upcoming-widget.tsx` (crear)
  - `src/app/dashboard/page.tsx` (modificar — agregar widget)
  - Posiblemente hooks existentes de reminders/calendar para fetch de datos
- **Dependencias:** ninguna (pero requiere que existan endpoints/hooks para obtener recordatorios del día)
- **Qué hacer:**
  1. Crear `upcoming-widget.tsx` que muestre los próximos 3 recordatorios/eventos del día actual.
  2. Usar el hook existente de reminders (verificar `useReminders` o similar) filtrando por fecha de hoy.
  3. Layout: Card con título "Hoy", lista de items con hora + contenido + status badge.
  4. Empty state: "No hay recordatorios para hoy 🎉" con estilo sutil.
  5. Agregar al dashboard debajo de las stats cards y antes de la actividad reciente.
  ```tsx
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Clock className="h-4 w-4" /> Hoy
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {upcoming.map(item => (
        <div key={item.id} className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground tabular-nums">{item.time}</span>
          <span className="text-sm truncate">{item.content}</span>
        </div>
      ))}
    </CardContent>
  </Card>
  ```
- **Criterio de éxito:** El dashboard muestra un widget "Hoy" con los próximos recordatorios del día. Se actualiza en realtime. Tiene empty state. Es responsive.
- **Branch:** `dev/fase-5-tarea-1-upcoming-widget`

---

### Tarea 5.2 — Quick actions en dashboard

- **Prioridad:** P2
- **Complejidad:** M (30-90 min)
- **Archivos:**
  - `src/app/dashboard/page.tsx`
- **Dependencias:** ninguna
- **Qué hacer:** Agregar botones de acción rápida ("Nueva nota", "Nuevo recordatorio") en el dashboard header o debajo del saludo:
  ```tsx
  <div className="flex gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link href="/dashboard/notes?action=new">
        <Plus className="h-4 w-4 mr-1" /> Nueva nota
      </Link>
    </Button>
    <Button variant="outline" size="sm" asChild>
      <Link href="/dashboard/reminders?action=new">
        <Plus className="h-4 w-4 mr-1" /> Nuevo recordatorio
      </Link>
    </Button>
  </div>
  ```
  Verificar si las rutas de destino aceptan query param `action=new` para auto-abrir el dialog de creación. Si no, implementar el handling en las páginas correspondientes.
- **Criterio de éxito:** El dashboard tiene 2 botones de acción rápida visibles. Cada uno navega a la página correspondiente y abre el form de creación.
- **Branch:** `dev/fase-5-tarea-2-quick-actions`

---

## Fase 6 — Microinteracciones (P2 polish)

Refinamientos de feedback visual.

---

### Tarea 6.1 — Feedback visual de DnD drop en board view

- **Prioridad:** P2
- **Complejidad:** M (30-90 min)
- **Archivos:**
  - `src/components/notes/note-board.tsx` (o donde se maneje el drop en board view)
  - `src/components/notes/note-card.tsx` (agregar clase de highlight temporal)
  - Posiblemente `src/app/globals.css` (keyframe `highlight`)
- **Dependencias:** ninguna
- **Qué hacer:** Cuando se suelta una nota en board view, no hay feedback visual. Agregar un flash/highlight temporal:
  1. Definir keyframe en CSS:
     ```css
     @keyframes highlight {
       0% { background-color: hsl(var(--primary) / 0.15); }
       100% { background-color: transparent; }
     }
     ```
  2. Después del drop, agregar clase `animate-[highlight_0.7s_ease-out]` al card recién movido vía state temporal.
  3. Remover la clase después de la animación (o dejar que CSS lo maneje con `animation-fill-mode: forwards`).
- **Criterio de éxito:** Al soltar una nota en board view, la card hace un flash sutil de color primario que desaparece en ~700ms. Sin afectar performance.
- **Branch:** `dev/fase-6-tarea-1-dnd-drop-feedback`

---

### Tarea 6.2 — Highlight en reminder cards al cambiar status por realtime

- **Prioridad:** P2
- **Complejidad:** M (30-90 min)
- **Archivos:**
  - `src/components/reminders/reminder-card.tsx`
  - Hook de realtime de reminders (donde se detectan cambios de status)
- **Dependencias:** ninguna
- **Qué hacer:** Cuando un reminder cambia de "Pendiente" a "Enviado" vía realtime update, el cambio es silencioso. Agregar un flash sutil:
  1. Detectar cuando `reminder.status` cambia (comparar prev vs current en el hook de realtime o en un `useEffect`).
  2. Aplicar la misma animación de highlight de la Tarea 6.1.
  3. Usar un `ref` o state para controlar la animación.
- **Criterio de éxito:** Cuando un recordatorio se marca como enviado en tiempo real, la card hace un flash sutil para llamar la atención del usuario.
- **Branch:** `dev/fase-6-tarea-2-reminder-status-highlight`

---

## Resumen Ejecutivo

| Fase | Tareas | Prioridad | Esfuerzo total estimado |
|------|--------|-----------|------------------------|
| 1 — Fundamentos y Overflow | 5 | P0-P1 | ~1.5h |
| 2 — Mobile Navigation & Forms | 3 | P1 ✅ | ~4h |
| 3 — Layout Mobile Polish | 3 | P2 | ~1.5h |
| 4 — Accesibilidad | 2 | P2 | ~1h |
| 5 — Dashboard Enhancements | 2 | P2 | ~3h |
| 6 — Microinteracciones | 2 | P2 | ~2h |
| **Total** | **17 tareas** | | **~13h** |

### Orden de ejecución recomendado

```
Fase 1 (1.1 → 1.2 → 1.3 → 1.4 → 1.5)  ← primero, quick wins
Fase 2 (2.1 → 2.2 → 2.3)                ← después, mayor impacto UX
Fase 3, 4, 5, 6                          ← en cualquier orden, P2 polish
```

Las tareas dentro de cada fase son independientes entre sí (salvo Fase 1 donde 1.1 debería ir primero). Se pueden paralelizar si hay múltiples agentes disponibles.
