# Plan de Mejora Frontend — "Cual es mi nombre" Web

## Diagnostico General

La web actual es **funcionalmente solida** (auth, CRUD, pagos, integraciones) pero
**visualmente generica** — indistinguible de cualquier template shadcn/ui sin personalizar.
Carece de identidad de marca, emocion visual, y las micro-interacciones que generan confianza
en un producto SaaS de pago.

### Problemas Criticos Identificados

| Area | Estado Actual | Impacto |
|------|---------------|---------|
| ~~Paleta de colores~~ | ~~100% escala de grises~~ | ✅ RESUELTO — Paleta "Warm Tech" con chroma real |
| ~~Landing page~~ | ~~Titulo + 2 botones sobre fondo blanco~~ | ✅ RESUELTO — Landing completa con hero, features, pricing, trust |
| ~~Tipografia~~ | ~~Solo Geist~~ | ✅ RESUELTO — Plus Jakarta Sans como display |
| ~~Animaciones~~ | ~~Casi ninguna (solo las de Radix por defecto)~~ | ✅ PARCIAL — Landing con staggered animations + hover effects |
| ~~Mobile~~ | ~~Sidebar oculta sin hamburger menu~~ | ✅ RESUELTO — Drawer mobile con backdrop |
| ~~Iconos~~ | ~~Emojis como iconos de navegacion~~ | ✅ RESUELTO — Lucide icons en toda la nav |
| Loading states | Texto plano "Cargando..." | Sin feedback visual |
| ~~Dark mode~~ | ~~Variables CSS existen, sin toggle~~ | ✅ RESUELTO — next-themes + ThemeToggle |
| ~~HTML lang~~ | ~~`lang="en"` en app 100% espanol~~ | ✅ RESUELTO — `lang="es"` |
| ~~Toast/feedback~~ | ~~`setTimeout` inline para confirmaciones~~ | ✅ RESUELTO — Sonner instalado y configurado |

---

## Progreso por Ola

### Ola 1 — Fundaciones ✅ COMPLETA
| Item | Estado |
|------|--------|
| M1.1 Paleta de marca con chroma | ✅ Deep Teal primary + Warm Amber accent + 3 semantic colors |
| M1.2 Tipografia display | ✅ Plus Jakarta Sans (h1/h2/h3 automaticos) |
| M1.3 Spacing tokens | Pendiente (mejora incremental) |
| M3.1 Iconos Lucide en nav | ✅ Home, StickyNote, Bell, CreditCard, Gem, Settings, etc. |
| M3.2 Mobile navigation | ✅ Hamburger + drawer con backdrop blur |
| M3.3 Sidebar refinada | ✅ Secciones separadas, plan badge con color, brand mark |
| M4.1 Toast system (Sonner) | ✅ Instalado en root layout, richColors, bottom-right |
| M10.1 `lang="es"` | ✅ Corregido |
| M11.1 Theme provider | ✅ next-themes con system default |
| M11.2 Toggle UI | ✅ Sun/Moon/Monitor dropdown en header |
| M11.3 Dark mode revision | ✅ Google callback banners + credit balance + reminder card migrados a semantic colors |
| M7.1 Dashboard cards (parcial) | ✅ Lucide icons, CheckCircle2/XCircle status, links de accion |

**Archivos modificados:**
- `src/app/globals.css` — Paleta completa reescrita (light + dark + semantic colors)
- `src/app/layout.tsx` — Plus Jakarta Sans, ThemeProvider, Toaster, lang="es"
- `src/components/theme-provider.tsx` — NUEVO: next-themes wrapper
- `src/components/dashboard/theme-toggle.tsx` — NUEVO: dropdown Claro/Oscuro/Sistema
- `src/components/dashboard/shell.tsx` — Reescrito: Lucide icons, mobile drawer, sidebar sections, plan badge
- `src/app/dashboard/page.tsx` — Lucide icons, semantic colors, action links
- `src/app/dashboard/settings/google/page.tsx` — Callback banners con semantic colors
- `src/components/credits/credit-balance.tsx` — Migrado a semantic colors
- `src/components/credits/transaction-table.tsx` — Migrado a semantic colors
- `src/components/reminders/reminder-card.tsx` — Migrado a semantic colors
- `src/app/dashboard/settings/page.tsx` — Success message con semantic colors

**Dependencias agregadas:**
- `next-themes@0.4.6` — Dark mode provider
- `sonner@2.0.7` — Toast notification system

### Ola 2 — Conversion (EN PROGRESO)

#### M2 Landing Page ✅
**Archivos modificados:**
- `src/app/page.tsx` — Reescrito: 6 secciones (nav, hero, features, how-it-works, pricing, footer)
- `src/app/globals.css` — Agregado: `scroll-behavior: smooth`, keyframes `fade-in-up` y `slide-in-right`

#### M6.1 Auth Layout ✅
**Archivos creados:**
- `src/app/(auth)/layout.tsx` — NUEVO: split layout con branding panel + form panel

**Archivos modificados:**
- `src/app/(auth)/login/page.tsx` — Removido wrapper externo (delegado al layout)
- `src/app/(auth)/signup/page.tsx` — Removido wrapper externo
- `src/app/(auth)/recovery/page.tsx` — Removido wrapper externo
- `src/app/(auth)/set-password/page.tsx` — Removido wrapper externo

### Ola 3 — Polish (EN PROGRESO)

#### M5 Loading States y Skeletons ✅
**Archivos creados:**
- `src/components/ui/skeleton.tsx` — NUEVO: shadcn Skeleton base (animate-pulse)
- `src/components/ui/spinner.tsx` — NUEVO: Lucide LoaderIcon con animate-spin
- `src/components/skeletons/dashboard-card-skeleton.tsx` — NUEVO: DashboardCardSkeleton + DashboardSkeleton
- `src/components/skeletons/note-card-skeleton.tsx` — NUEVO: NoteCardSkeleton + NotesGridSkeleton
- `src/components/skeletons/reminder-card-skeleton.tsx` — NUEVO: ReminderCardSkeleton + RemindersListSkeleton
- `src/components/skeletons/credits-skeleton.tsx` — NUEVO: CreditBalanceSkeleton + TransactionTableSkeleton + CreditsSkeleton
- `src/app/dashboard/loading.tsx` — NUEVO: Suspense boundary (DashboardSkeleton)
- `src/app/dashboard/notes/loading.tsx` — NUEVO: Suspense boundary (NotesGridSkeleton)
- `src/app/dashboard/reminders/loading.tsx` — NUEVO: Suspense boundary (RemindersListSkeleton)
- `src/app/dashboard/credits/loading.tsx` — NUEVO: Suspense boundary (CreditsSkeleton)

**Archivos modificados:**
- `src/components/ui/button.tsx` — Prop `loading` con Spinner + disabled automatico (compatible asChild)
- `src/components/notes/note-list.tsx` — "Cargando notas..." reemplazado por NotesGridSkeleton
- `src/components/reminders/reminder-list.tsx` — "Cargando recordatorios..." reemplazado por RemindersListSkeleton
- `src/components/credits/transaction-table.tsx` — "Cargando..." reemplazado por TransactionTableSkeleton

---

## Modulos de Mejora

Cada modulo es independiente y puede implementarse en aislamiento.

---

### ~~M1 — Sistema de Diseno y Brand Identity~~ ✅ COMPLETO

**Implementado:**
- Paleta "Warm Tech" en OKLCh con chroma real:
  - Primary: Deep Teal `oklch(0.52 0.14 195)` — confianza + tecnologia
  - Accent: Warm Amber `oklch(0.82 0.12 75)` — calidez + atencion
  - Destructive: Coral `oklch(0.59 0.22 25)` — firme, no agresivo
  - Background: Off-white calido (no esteril)
  - Foreground: Blue-gray (no negro puro)
- 3 colores semanticos: `success`, `warning`, `info` (con foreground variants)
- Dark theme completo (no inversion plana, colores ajustados para contraste)
- Sidebar teal-tinted diferenciada del fondo
- Plus Jakarta Sans como fuente display (peso 500-800)
- h1/h2/h3 heredan fuente display automaticamente via `@layer base`
- 7 componentes migrados de hardcoded colors a semantic tokens

**Pendiente (M1.3):**
- [ ] Definir escala de spacing consistente para secciones de pagina
- [ ] Estandarizar padding de contenido (`main.p-6` vs cards internas)
- [ ] Definir `max-w-*` consistente para contenido legible

---

### ~~M2 — Landing Page (Conversion)~~ ✅ COMPLETO

**Implementado:**

#### M2.1 — Hero Section ✅
- ✅ Gradient mesh background (teal + amber radial blurs)
- ✅ Staggered CSS animations (fade-in-up con delays incrementales)
- ✅ Badge "Potenciado por IA" con icono Sparkles
- ✅ WhatsApp conversation mockup realista (4 mensajes: agenda + recordatorio)
- ✅ CTA primario con shadow colored + ArrowRight icon
- ✅ Trust indicators: "Sin tarjeta requerida" + "Configura en 2 min"
- ✅ Sticky nav con backdrop blur + brand + auth buttons

#### M2.2 — Seccion de Features ✅
- ✅ Grid 4 columnas con Lucide icons (Calendar, StickyNote, Bell, MessageCircle)
- ✅ Cada feature: icono en circulo coloreado + titulo + descripcion
- ✅ Hover effect: translate-y + shadow elevation
- ✅ 4 colores distintos: primary, chart-4, success, info

#### M2.3 — Seccion de Pricing Preview ✅
- ✅ 3 planes (Basico, Pro, Premium) con precios en S/
- ✅ Plan Pro highlighted con ring + badge "Popular"
- ✅ Feature list con Check icons + CTA directo a signup
- ✅ Hover lift effect en cada plan card

#### M2.4 — Social Proof / Trust ✅
- ✅ Seccion "Empieza en 3 simples pasos" con iconos en circulos primary
- ✅ Connector dashed line entre pasos (desktop)
- ✅ Trust badges: WhatsApp, Google Calendar, MercadoPago

#### M2.5 — Footer ✅
- ✅ Branding con Sparkles icon + copyright dinamico
- ✅ Layout responsive (column mobile, row desktop)

**Pendiente (mejora futura):**
- [ ] M2.2 — Scroll-triggered reveal animations (IntersectionObserver)
- [ ] M2.4 — Testimonios reales o estadisticas de uso
- [ ] M2.5 — Links legales, contacto, redes sociales

---

### ~~M3 — Dashboard Shell y Navegacion~~ ✅ MAYORMENTE COMPLETO

**Implementado:**
- ✅ M3.1 — Iconos Lucide (Home, StickyNote, Bell, CreditCard, Gem, Settings, MessageCircle, Calendar)
- ✅ M3.2 — Mobile nav (hamburger + drawer lateral + backdrop blur + auto-close)
- ✅ M3.3 — Sidebar refinada (secciones separadas, plan badge, brand mark con Sparkles)
- ✅ M3.5 — Header mejorado (sticky + backdrop blur + theme toggle)

**Pendiente:**
- [ ] M3.4 — Breadcrumbs para paginas anidadas (`Configuracion > Google Calendar`)
- [ ] M3.3 — Sidebar collapsible en desktop (solo iconos)
- [ ] M3.5 — Avatar con dropdown menu (perfil, configuracion, cerrar sesion)

---

### ~~M4 — Sistema de Feedback y Notificaciones~~ ✅ PARCIALMENTE COMPLETO

**Implementado:**
- ✅ M4.1 — Sonner toast system instalado y configurado en root layout

**Pendiente:**
- [ ] M4.1 — Migrar componentes existentes de `useState(error)` inline a `toast.error()`
- [ ] M4.2 — Componente `<FormError />` reutilizable con animacion
- [ ] M4.3 — Toast de confirmacion post-accion con undo

---

### ~~M5 — Loading States y Skeletons~~ ✅ COMPLETO

**Prioridad:** ALTA — Percepcion de velocidad.

**Implementado:**

#### M5.1 — Skeleton components ✅
- [x] `<Skeleton />` generico (shadcn standard con animate-pulse)
- [x] `<NoteCardSkeleton />` + `<NotesGridSkeleton />` — replica estructura de NoteCard
- [x] `<ReminderCardSkeleton />` + `<RemindersListSkeleton />` — replica ReminderCard
- [x] `<TableRowSkeleton />` + `<TransactionTableSkeleton />` — replica tabla de transacciones
- [x] `<CreditBalanceSkeleton />` — replica balance card
- [x] `<DashboardCardSkeleton />` + `<DashboardSkeleton />` — replica las 4 cards + titulo

#### M5.2 — Loading.tsx files (Suspense boundaries) ✅
- [x] `/dashboard/loading.tsx` — DashboardSkeleton (titulo + 4 cards)
- [x] `/dashboard/notes/loading.tsx` — titulo + NotesGridSkeleton
- [x] `/dashboard/reminders/loading.tsx` — titulo + RemindersListSkeleton
- [x] `/dashboard/credits/loading.tsx` — titulo + CreditsSkeleton (balance + tabla)

#### M5.3 — Spinner para acciones ✅
- [x] `<Spinner />` componente (Lucide LoaderIcon con animate-spin)
- [x] Button `loading` prop: muestra Spinner + deshabilita automaticamente
- [x] Compatible con `asChild` (Slot single-child contract respetado)

#### M5.4 — Migracion de loading states inline ✅
- [x] `NoteList`: "Cargando notas..." → `<NotesGridSkeleton />`
- [x] `ReminderList`: "Cargando recordatorios..." → `<RemindersListSkeleton />`
- [x] `TransactionTable`: "Cargando..." → `<TransactionTableSkeleton />`

---

### M6 — Paginas de Auth (Login/Signup/Recovery)

**Prioridad:** MEDIA-ALTA — Conversion y primera impresion post-landing.

#### M6.1 — Layout de auth con branding ✅
- [x] Split layout: branding panel izquierdo + form derecho (desktop, lg:grid-cols-2)
- [x] Panel con gradient mesh teal + logo Sparkles + tagline + 4 feature cards glass-morphism
- [x] Mobile: gradient header compacto con logo + tagline, form centrado debajo
- [x] Staggered fade-in-up animations en branding panel
- [x] Dot grid texture overlay + layered gradient orbs para profundidad
- [x] 4 paginas actualizadas (login, signup, recovery, set-password)

#### M6.2 — Formularios con polish
- [ ] Animacion de transicion entre pasos (signup: phone -> OTP)
- [ ] Progress indicator para multi-step
- [ ] Password strength indicator visual

#### M6.3 — Pagina de error/404
- [ ] Crear `app/not-found.tsx` con diseno on-brand
- [ ] Crear `app/error.tsx` con recovery action

---

### ~~M7 — Dashboard Home~~ ✅ PARCIALMENTE COMPLETO

**Implementado:**
- ✅ M7.1 — Iconos Lucide en cards (Coins, Gem, MessageCircle, Calendar)
- ✅ M7.1 — Status con CheckCircle2/XCircle + semantic colors
- ✅ M7.1 — Links de accion con ArrowRight hacia configuracion
- ✅ Onboarding card con Rocket icon + semantic warning colors

**Pendiente:**
- [ ] M7.1 — Numeros con animacion count-up
- [ ] M7.1 — Hover effect sutil en cards
- [ ] M7.2 — Stepper visual de onboarding con progreso
- [ ] M7.3 — Seccion de actividad reciente

---

### M8 — Notas (UI/UX Polish)

**Prioridad:** MEDIA

- [ ] M8.1 — Toggle grid/list view
- [ ] M8.2 — Icono de busqueda + debounce
- [ ] M8.3 — Tags interactivos (click filtra, colores por hash)
- [ ] M8.4 — Drag and drop (futuro)
- [ ] M8.5 — Empty state ilustrado

---

### M9 — Planes y Pricing

**Prioridad:** MEDIA

- [ ] M9.1 — Plan destacado mas grande + ribbon "Mas popular"
- [ ] M9.2 — Staggered entrance animation + hover scale
- [ ] M9.3 — Badge "Tu plan" con check icon

---

### M10 — Accesibilidad y SEO

**Prioridad:** MEDIA

**Implementado:**
- ✅ M10.1 — `lang="es"` corregido

**Pendiente:**
- [ ] M10.1 — Eliminar `tabIndex={-1}` del link "Olvidaste tu contrasena?"
- [ ] M10.2 — Skip navigation link
- [ ] M10.3 — Focus visible styles mas prominentes
- [ ] M10.4 — `prefers-reduced-motion` en animaciones
- [ ] M10.5 — OG tags, favicon, web manifest

---

### ~~M11 — Dark Mode Toggle~~ ✅ COMPLETO

**Implementado:**
- ✅ M11.1 — `next-themes` con ThemeProvider (system default, class attribute)
- ✅ M11.2 — ThemeToggle dropdown (Claro/Oscuro/Sistema) con Lucide icons
- ✅ M11.3 — Callback banners + credit balance + reminder card migrados a semantic colors
- ✅ M11.3 — Dark theme completo con colores no-invertidos, ajustados para contraste

---

### M12 — Rendimiento y Optimizacion

**Prioridad:** MEDIA

- [ ] M12.1 — `next/image` para ilustraciones
- [ ] M12.2 — Client components audit (settings, whatsapp pages)
- [ ] M12.3 — React Query/SWR para cache
- [ ] M12.4 — Bundle analysis

---

### M13 — Componentes UI Faltantes

**Prioridad:** BAJA-MEDIA

- [ ] M13.1 — shadcn Select (reemplazar `<select>` nativo en settings)
- [ ] M13.2 — shadcn Tooltip (para icon buttons)
- [ ] M13.3 — shadcn Sheet (para mobile drawer alternativo)
- [x] M13.4 — shadcn Skeleton ✅ (implementado en M5)
- [ ] M13.5 — shadcn Progress (reemplazar div en credit-balance)
- [ ] M13.6 — shadcn Avatar (perfil en sidebar/header)

---

### M14 — Micro-interacciones y Animaciones

**Prioridad:** BAJA-MEDIA

- [ ] M14.1 — Page transitions (fade-in, staggered reveal)
- [ ] M14.2 — Hover states ricos (shadow + translate en cards)
- [ ] M14.3 — Feedback tactil (active:scale-95 en botones)
- [ ] M14.4 — Numbers animation (count-up en creditos)
- [ ] M14.5 — Evaluar `motion` (Framer Motion) para layout animations

---

## Hoja de Ruta

### Ola 1 — Fundaciones ✅ COMPLETA (2025-03-16)
- ✅ M1: Paleta, tipografia, semantic colors
- ✅ M3.1-3.3: Iconos Lucide, mobile nav, sidebar refinada
- ✅ M4.1: Toast system (Sonner)
- ✅ M7.1: Dashboard cards con iconos y semantic colors
- ✅ M10.1: `lang="es"`
- ✅ M11: Dark mode completo

### Ola 2 — Conversion (EN PROGRESO)
- ✅ M2: Landing page completa (hero, features, pricing, how-it-works, footer)
- ✅ M6.1: Auth pages con branding (split layout + gradient panel + glass feature cards)
- M9.1: Pricing page premium

### Ola 3 — Polish (EN PROGRESO)
- ✅ M5: Skeletons y loading states
- M7.2-7.3: Onboarding stepper, actividad reciente
- M8: Notas con views y tags

### Ola 4 — Refinamiento (PENDIENTE)
- M3.4: Breadcrumbs
- M4.2-4.3: FormError, toast con undo
- M10.2-10.5: Skip nav, focus, OG tags
- M12-M14: Performance, components, animations

---

## Metricas de Exito

| Metrica | Pre-Ola1 | Post-Ola1 | Post-M2 | Post-M6.1 | Post-M5 | Objetivo |
|---------|----------|-----------|---------|-----------|---------|----------|
| Lighthouse Performance | ~85 | ~85 | ~85 | ~85 | ~85 | 95+ |
| Lighthouse Accessibility | ~80 | ~90 | ~90 | ~90 | ~90 | 100 |
| Lighthouse SEO | ~70 | ~75 | ~75 | ~75 | ~75 | 100 |
| Mobile usability | FALLA | OK | OK | OK | OK | 100 |
| Brand identity | Ninguna | Paleta + tipografia | Landing completa | Auth con branding | Auth con branding | Distintiva |
| Dark mode | No funcional | Completo | Completo | Completo | Completo | Completo |
| Loading states | Texto plano | Texto plano | Texto plano | Texto plano | Skeletons + Spinner | Premium |
| Test suite | 208 passing | 208 passing | 208 passing | 208 passing | 208 passing | Sin regresiones |
