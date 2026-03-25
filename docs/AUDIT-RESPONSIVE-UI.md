# Auditoría de Responsive & UI/UX

**Fecha:** 2026-03-25
**Scope:** `src/components/**/*.tsx` + `src/app/**/*.tsx`

---

## Parte 1: Auditoría de Overflow y Responsive

### Resumen

Los 4 archivos corregidos hoy (`note-card.tsx`, `reminder-card.tsx`, `shell.tsx`, `settings/google/page.tsx`) están bien protegidos. El resto del codebase tiene pocos problemas críticos — el proyecto ya aplica `min-w-0` y `truncate` en la mayoría de los casos. Abajo están los hallazgos pendientes.

### Hallazgos

| Archivo | Línea | Patrón problemático | Severidad | Fix sugerido |
|---------|-------|---------------------|-----------|--------------|
| `dashboard/page.tsx` | 115-119 | `h1` con nombre de asistente largo sin `truncate` — saludo `"Hola ${displayName}, soy ${assistantName}"` puede desbordar en mobile si ambos nombres son largos | Media | Agregar `truncate` o `line-clamp-2` al `<h1>` |
| `dashboard/page.tsx` | 127,145,167,201 | `<Card>` de stats sin `overflow-hidden` | Baja | Agregar `overflow-hidden` a cada Card. No es crítico porque el contenido es corto/controlado, pero es defensive coding |
| `dashboard/page.tsx` | 173,207 | `CardTitle` con `flex items-center gap-2` que contiene texto + icono — sin `min-w-0` en padre | Baja | El texto es "Vinculado"/"Conectado" (corto), pero por consistencia agregar `min-w-0` |
| `settings/page.tsx` | — | `<Card>` (3 instancias) sin `overflow-hidden` | Baja | Agregar `overflow-hidden` como estándar defensivo |
| `settings/google/page.tsx` | 66 | `<Card>` del banner de callback sin `overflow-hidden` | Baja | Agregar `overflow-hidden` |
| `credits/credit-balance.tsx` | — | `<Card>` sin `overflow-hidden` | Baja | Agregar `overflow-hidden` |
| `chat/chat-header.tsx` | 16 | `truncate` en `<p>` con padre `min-w-0 flex-1` ✅ — **OK, ya protegido** | — | Ninguno |
| `onboarding-stepper.tsx` | 89 | `flex items-center justify-between` sin `min-w-0` — el título "Completa tu configuración" es fijo, pero el porcentaje podría competir en pantallas <320px | Baja | Agregar `min-w-0` al div padre del h3 |
| `recent-activity.tsx` | 88-102 | `flex items-center gap-3` con `min-w-0 flex-1` ✅ — **OK, bien protegido** | — | Ninguno |
| `note-card.tsx` (list layout) | 305 | `flex items-center gap-4` row con título fijo `w-48`, content `flex-1 truncate`, tags, y acciones — en mobile <375px el `w-48` más el gap puede desbordar | Media | Cambiar `w-48` a `w-40 sm:w-48` o usar `max-w-[12rem]` con `shrink` |
| `note-card.tsx` (list layout) | 305 | Card de layout `list` no tiene `overflow-hidden` | Media | Agregar `overflow-hidden` al Card |
| `note-card.tsx` (compact layout) | 215 | Card de layout `compact` no tiene `overflow-hidden` | Baja | Agregar `overflow-hidden` |
| `reminder-card.tsx` | 107 | `CardTitle` con `whitespace-nowrap shrink-0` para fecha — si la fecha es larga (ej: "Mié 25 mar 2026, 10:30 PM") esto fuerza al menú fuera del viewport en pantallas <360px | Media | Cambiar a `whitespace-nowrap` sin `shrink-0`, o permitir truncar la fecha con `truncate` |
| `reminder-card.tsx` | 165-172 | Row de badges `flex items-center gap-1.5` — si el rruleDescription es largo ("Cada semana los lunes, miércoles y viernes #15") y el badge de status está `shrink-0`, el badge de recurrencia (con `truncate min-w-0`) se trunca bien ✅ pero todo el row no tiene `overflow-hidden` | Baja | Agregar `overflow-hidden` al flex container de badges |
| `note-view-dialog.tsx` | 55-68 | `DialogTitle` con `flex items-center gap-2` — título largo + 2 badges `shrink-0` pueden exceder el ancho del dialog en mobile | Media | Agregar `min-w-0` y `flex-wrap` o mover badges debajo del título |
| `transaction-table.tsx` | 146 | `truncate max-w-[200px]` en celda de descripción ✅ — **OK** | — | Ninguno |
| `plan-card.tsx` | — | Card tiene `overflow-hidden` ✅ | — | Ninguno |
| `note-list.tsx` | 470 | `flex flex-col gap-3 sm:flex-row` para search bar — ✅ bien responsive | — | Ninguno |
| `whatsapp-linking.tsx` | — | Cards sin `overflow-hidden` | Baja | Agregar `overflow-hidden` |
| `step-indicator.tsx` | 12,18 | `flex items-center gap-2` con `flex-1` hijos — en pantallas pequeñas con 3+ pasos los labels pueden apretarse | Baja | Ocultar labels en mobile, mostrar solo iconos/números |

### Resumen por severidad

- **Alta:** 0 (los 4 bugs críticos ya fueron corregidos)
- **Media:** 4 instancias
- **Baja:** 10+ instancias (mayormente Cards sin `overflow-hidden` como patrón defensivo)

### Patrón recomendado para aplicar globalmente

Considerar agregar `overflow-hidden` al componente base `<Card>` en `src/components/ui/card.tsx` para que **todas** las cards lo tengan por defecto. Esto eliminaría ~10 hallazgos de golpe y previene futuros problemas.

---

## Parte 2: Propuesta de Mejoras de UI/UX

### 1. Mobile-First

**Qué:** El diseño actual es **desktop-first adaptado a mobile** — funciona bien, pero no se siente nativo en mobile.

**Por qué:** Las decisiones de layout parten de desktop (sidebar de 256px, grids de 4 columnas, etc.) y se adaptan con breakpoints. Un enfoque mobile-first partiría del mobile y expandiría.

**Cómo:**
- **Dashboard cards:** Las 4 cards de stats en `grid md:grid-cols-2 lg:grid-cols-4` podrían ser un scroll horizontal en mobile (como las stories de Instagram) en vez de stack vertical. Más compacto y scaneable.
  ```
  className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible"
  ```
  Cada card: `className="snap-center min-w-[200px] shrink-0 md:min-w-0 md:shrink"`
- **Bottom navigation en mobile:** En lugar de hamburger → drawer, una bottom tab bar fija con los 5 items principales (Home, Chat, Notas, Recordatorios, Settings). Es el patrón estándar de apps móviles. El sidebar se mantiene para desktop.
- **Touch targets:** Algunos botones `size="icon-xs"` (el menú ⋮ de las cards) tienen ~28px de target — el mínimo recomendado es 44px. Agregar padding invisible.

**Prioridad:** P1 — mejora significativa de experiencia mobile

---

### 2. Cards de Notas y Recordatorios

**Qué:** Optimizar la densidad de información en cards.

**Por qué:** En grid view, las note cards muestran: drag handle + priority dot + index + título + status badge + fecha + contenido + tags + menú. Son muchos elementos compitiendo.

**Cómo:**
- **Grid cards:** Eliminar el `index` en grid view — solo tiene sentido en list view. Menos ruido visual.
- **Reminder cards:** El título es la fecha/hora — considerar poner la fecha como metadata secundaria y usar `reminder.content` como título principal. El usuario busca "qué" tiene que hacer, no "cuándo".
  ```
  <CardTitle>{reminder.content}</CardTitle>
  <p className="text-xs text-muted-foreground">{formatDateTime(...)}</p>
  ```
- **Status badges:** En lugar de badges de texto, usar solo un dot de color con tooltip. Ahorra espacio horizontal. El status actual ya tiene dots en board view — unificar.
- **Tags como chips compactos:** En mobile, limitar a 2 tags + "+N" como ya se hace en compact — aplicar lo mismo a grid view en mobile.

**Prioridad:** P2 — nice to have, la experiencia actual funciona

---

### 3. Dashboard Principal

**Qué:** La información está razonablemente distribuida. Algunas mejoras posibles.

**Por qué:** El dashboard muestra stats + onboarding + actividad reciente. Falta contexto temporal (próximos eventos/recordatorios) y acciones rápidas.

**Cómo:**
- **Widget "Próximos":** Un card que muestre los próximos 3 recordatorios/eventos del día. Es lo más accionable cuando el usuario abre el dashboard.
  ```tsx
  <Card>
    <CardHeader><CardTitle>Hoy</CardTitle></CardHeader>
    <CardContent>
      {upcomingReminders.map(r => <ReminderMiniCard />)}
      {todayEvents.map(e => <EventMiniCard />)}
    </CardContent>
  </Card>
  ```
- **Quick actions:** Botones de "Nueva nota", "Nuevo recordatorio" directamente en el dashboard, no solo en sus páginas respectivas.
- **Actividad reciente:** Agregar un link "Ver todo" que lleve a una vista dedicada o a la sección correspondiente.

**Prioridad:** P2 — el dashboard actual es funcional

---

### 4. Navegación

**Qué:** El sidebar y breadcrumb funcionan correctamente. El mobile drawer es estándar.

**Por qué:** El breadcrumb en `/dashboard/settings/google` muestra `dashboard > Configuracion > Google Calendar` — útil para orientación. Sin embargo, ocupa espacio vertical en mobile.

**Cómo:**
- **Breadcrumb en mobile:** Ocultarlo o colapsarlo a solo "← Configuración" (back link). El breadcrumb completo solo tiene valor en desktop.
  ```
  <div className="hidden md:block border-b px-4 py-2 md:px-6">
    <Breadcrumb>...</Breadcrumb>
  </div>
  <div className="md:hidden border-b px-4 py-2">
    <Link href={parentPath}>← {parentLabel}</Link>
  </div>
  ```
- **Active state del sidebar:** ✅ Ya bien implementado con `bg-primary text-primary-foreground`.
- **Collapsed sidebar:** ✅ Implementado con tooltips. Buen UX.

**Prioridad:** P2 — el breadcrumb funciona bien, la optimización mobile es nice to have

---

### 5. Formularios

**Qué:** Los forms de nota y recordatorio usan dialogs modales.

**Por qué:** Los dialogs funcionan bien en desktop pero en mobile el `<DialogContent>` puede sentirse apretado, especialmente el form de recordatorio que tiene 5+ campos (contenido, fecha, recurrencia, frecuencia, días, fin).

**Cómo:**
- **Drawer en mobile:** Reemplazar `Dialog` por un componente que sea `Dialog` en desktop y `Drawer` (bottom sheet) en mobile. shadcn tiene el patrón `ResponsiveDialog`. El form se desliza desde abajo y ocupa ~80% de la pantalla.
- **Form de recordatorio:** Los campos de recurrencia podrían colapsarse en un accordion/disclosure por defecto y expandirse solo si el usuario marca "Repetir". Ya hay un toggle, pero el disclosure haría el form más limpio.
- **Textarea en mobile:** Agregar `rows={3}` mínimo para que el contenido no parezca un input de una línea.

**Prioridad:** P1 — los dialogs en mobile son el punto de fricción más notable

---

### 6. Microinteracciones

**Qué:** El proyecto ya tiene buenas animaciones base.

**Por qué:** Hay `animate-[fade-in-up]`, `transition-shadow`, `hover:-translate-y-0.5`, y stagger animations. Buen nivel.

**Cómo (lo que falta):**
- **Toast de éxito al crear nota/recordatorio:** ✅ Ya usa `sonner` — bien.
- **Optimistic updates:** ✅ Ya implementado con `useRealtimeTable` — bien.
- **Skeleton screens:** ✅ Tiene skeletons para notas, recordatorios, credits — bien.
- **Confirmación de delete:** ✅ Tiene `AlertDialog` — bien.
- **Falta: feedback de drag & drop.** Cuando se suelta una nota en board view, no hay feedback visual (flash, bounce, o highlight temporal). Agregar una animación `animate-[highlight_0.5s]` al card recién movido.
- **Falta: state transitions.** Cuando un reminder pasa de "Pendiente" a "Enviado" por realtime, el cambio es silencioso. Un flash sutil en la card llamaría la atención.

**Prioridad:** P2 — lo existente es bueno, estos son refinamientos

---

### 7. Accesibilidad

**Qué:** El proyecto tiene buenas bases de a11y.

**Hallazgos positivos:**
- ✅ Skip to main content link en `shell.tsx`
- ✅ `aria-label` en drag handles, botones de acción, dropdowns
- ✅ `role="region"` en board columns con labels
- ✅ Screen reader instructions para DnD
- ✅ Focus indicators vía Tailwind defaults

**Problemas encontrados:**
- **Emoji como iconos sin aria-label:** Los menús usan "⋮" como texto del botón de acciones — tiene `aria-label="Acciones de nota"` ✅ bien. Pero los emojis en los dropdown items (✏️ Editar, 📌 Fijar, 🗑️ Eliminar) no tienen `aria-hidden="true"`, por lo que screen readers leen "marca de verificación Editar" o similar.
  - Fix: `<span aria-hidden="true">✏️</span> Editar` o usar iconos de Lucide.
  - Prioridad: P2
- **Contraste:** Los badges `text-[10px]` con `opacity-60` en notas completadas podrían no pasar WCAG AA (4.5:1). Verificar con herramienta de contraste.
  - Prioridad: P2
- **Focus management en dialogs:** ✅ shadcn/radix maneja esto automáticamente — bien.
- **Formularios:** Los `<Label>` están asociados a inputs vía `htmlFor` ✅.

**Prioridad global:** P2 — las bases son sólidas, los problemas son menores

---

### 8. Performance Percibido

**Qué:** Los loading states son adecuados.

**Hallazgos:**
- ✅ Skeletons para notes grid, reminder list, credits, chat — bien implementados
- ✅ `loading.tsx` pages para dashboard, notes, reminders, chat, credits
- ✅ Stagger animations en las cards al cargar
- ✅ Optimistic UI con realtime subscriptions
- ✅ `tabular-nums` en números para evitar layout shifts

**Mejoras posibles:**
- **Transition entre tabs:** Al cambiar entre Active/Archived en notas, o entre tabs de reminders, hay un re-render abrupto. Un `transition-opacity` de 150ms suavizaría el cambio.
  ```
  <div className="transition-opacity duration-150" key={tab}>
  ```
- **Prefetch de rutas:** Agregar `prefetch` a los Link del sidebar para las rutas más comunes (notas, recordatorios, chat). Next.js lo hace por defecto con Links visibles, pero el sidebar colapsado podría no triggerearlo.
- **Image de onboarding:** El stepper podría tener una ilustración ligera (SVG inline) en el empty state para hacer el primer uso más invitador.

**Prioridad:** P2 — el performance percibido actual es bueno

---

## Resumen de Prioridades

| # | Mejora | Prioridad | Esfuerzo |
|---|--------|-----------|----------|
| 1 | `overflow-hidden` global en Card base | P1 | 5 min |
| 2 | Bottom navigation para mobile | P1 | 2-3h |
| 3 | Dialogs → Drawer en mobile para forms | P1 | 1-2h |
| 4 | Fix `w-48` en note-card list layout | P1 | 5 min |
| 5 | Fix `shrink-0` en reminder date CardTitle | P1 | 5 min |
| 6 | Fix title + badges overflow en note-view-dialog | P1 | 10 min |
| 7 | Dashboard h1 truncate para nombres largos | P1 | 5 min |
| 8 | Dashboard "Próximos hoy" widget | P2 | 2h |
| 9 | Horizontal scroll stats cards en mobile | P2 | 30 min |
| 10 | Breadcrumb → back link en mobile | P2 | 30 min |
| 11 | DnD drop feedback animation | P2 | 30 min |
| 12 | Emoji aria-hidden en dropdowns | P2 | 15 min |
| 13 | Tab transition animations | P2 | 15 min |
| 14 | Touch target sizes para icon-xs buttons | P2 | 15 min |
