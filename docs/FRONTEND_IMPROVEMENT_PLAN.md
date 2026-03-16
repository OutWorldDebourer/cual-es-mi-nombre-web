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
| ~~Loading states~~ | ~~Texto plano "Cargando..."~~ | ✅ RESUELTO — Skeletons + Spinner + loading.tsx boundaries |
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

### Ola 2 — Conversion ✅ COMPLETA

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

### Ola 3 — Polish ✅ COMPLETA

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

#### M10.5 OG Tags, Favicon, Web Manifest ✅
**Archivos creados:**
- `src/app/icon.svg` — NUEVO: SVG favicon (sparkle teal gradient, 32x32)
- `src/app/apple-icon.tsx` — NUEVO: Dynamic Apple touch icon (180x180, edge runtime)
- `src/app/opengraph-image.tsx` — NUEVO: Dynamic OG image (1200x630, teal gradient + brand)
- `src/app/manifest.ts` — NUEVO: Web manifest (name, theme_color, start_url, icons)

**Archivos modificados:**
- `src/app/layout.tsx` — Metadata completo: title template, OG tags, Twitter card, keywords, metadataBase

#### M6.3 Error/404 Pages ✅
**Archivos creados:**
- `src/app/not-found.tsx` — NUEVO: Branded 404 (Sparkles icon, CTAs dashboard/inicio)
- `src/app/error.tsx` — NUEVO: Branded error (retry reset, digest ref, CTA dashboard)

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

### ~~M4 — Sistema de Feedback y Notificaciones~~ ✅ COMPLETO

**Implementado:**
- ✅ M4.1 — Sonner toast system instalado y configurado en root layout
- ✅ M4.1 — Migración completa: 7 componentes migrados de inline error divs a `<FormError />` / `toast`
- ✅ M4.2 — Componente `<FormError />` reutilizable con AlertCircle icon + fade-in-up animation
- ✅ M4.3 — Toast con undo para delete/archive notas + optimistic updates en pin/archive/delete

#### M4.2 — FormError component ✅
**Archivos creados:**
- `src/components/ui/form-error.tsx` — NUEVO: inline error con AlertCircle icon, role="alert", animate-[fade-in-up]

#### M4.1 — Migración de inline errors ✅
**Archivos modificados (FormError inline):**
- `src/components/auth/login-form.tsx` — inline div → `<FormError />`
- `src/components/auth/signup-form.tsx` — 2 inline divs → `<FormError />` + existing user banner → semantic colors
- `src/components/auth/recovery-form.tsx` — 3 inline divs → `<FormError />`
- `src/app/dashboard/settings/whatsapp/page.tsx` — 2 inline divs → `<FormError />`
- `src/components/notes/note-form.tsx` — inline p → `<FormError />`

**Archivos modificados (toast migration):**
- `src/app/dashboard/settings/page.tsx` — success `useState`+`setTimeout` → `toast.success()`, error → `<FormError />`
- `src/components/plans/plan-grid.tsx` — `useState(error)` eliminado → `toast.error()`

#### M4.3 — Toast con undo ✅
**Archivos modificados:**
- `src/components/notes/note-list.tsx` — delete con undo toast (5s delay), archive con undo toast, pin optimistic con rollback

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

### ~~M6 — Paginas de Auth (Login/Signup/Recovery)~~ ✅ COMPLETO

**Prioridad:** MEDIA-ALTA — Conversion y primera impresion post-landing.

#### M6.1 — Layout de auth con branding ✅
- [x] Split layout: branding panel izquierdo + form derecho (desktop, lg:grid-cols-2)
- [x] Panel con gradient mesh teal + logo Sparkles + tagline + 4 feature cards glass-morphism
- [x] Mobile: gradient header compacto con logo + tagline, form centrado debajo
- [x] Staggered fade-in-up animations en branding panel
- [x] Dot grid texture overlay + layered gradient orbs para profundidad
- [x] 4 paginas actualizadas (login, signup, recovery, set-password)

#### M6.2 — Formularios con polish ✅
- [x] Animacion de transicion entre pasos (signup: phone → OTP, recovery: phone → OTP → password)
- [x] Progress indicator para multi-step (StepIndicator con dots, connectors, labels)
- [x] Password strength indicator visual (4-segment bar con colores semánticos)
- [x] Inline error divs migrados a `<FormError />` en signup OTP step y recovery password step

**Archivos creados:**
- `src/components/auth/password-strength.tsx` — NUEVO: 4 niveles (muy débil/débil/buena/fuerte), barra segmentada con colores semánticos, animación fade-in
- `src/components/auth/step-indicator.tsx` — NUEVO: dots con ring activo, connectors animados, labels responsive (hidden sm:inline)

**Archivos modificados:**
- `src/components/auth/signup-form.tsx` — StepIndicator (2 pasos), PasswordStrength debajo del campo, slide-in-right en OTP step, error div → FormError
- `src/components/auth/recovery-form.tsx` — StepIndicator (3 pasos), PasswordStrength debajo del campo, slide-in-right en OTP y password steps, error div → FormError

#### M6.3 — Pagina de error/404 ✅
- [x] `app/not-found.tsx` — branded 404 con Sparkles icon, mensaje amigable, CTAs a dashboard/inicio
- [x] `app/error.tsx` — branded error con retry (reset), digest ref, CTA a dashboard

---

### ~~M7 — Dashboard Home~~ ✅ COMPLETO

**Implementado:**
- ✅ M7.1 — Iconos Lucide en cards (Coins, Gem, MessageCircle, Calendar)
- ✅ M7.1 — Status con CheckCircle2/XCircle + semantic colors
- ✅ M7.1 — Links de accion con ArrowRight hacia configuracion
- ✅ M7.1 — Count-up animado en creditos (ease-out cubic, 800ms)
- ✅ M7.1 — Hover effect sutil en cards (translate-y + shadow)
- ✅ M7.2 — Onboarding stepper visual con progress bar y 4 pasos interactivos
- ✅ M7.3 — Actividad reciente unificada (notas + recordatorios + creditos)

#### M7.2 — Onboarding Stepper ✅
**Archivos creados:**
- `src/components/dashboard/onboarding-stepper.tsx` — NUEVO: 4 pasos (WhatsApp, nombre, Google, plan), progress bar, step highlighting, completed strikethrough

**Archivos modificados:**
- `src/app/dashboard/page.tsx` — Onboarding card reemplazada por OnboardingStepper

#### M7.3 — Actividad Reciente ✅
**Archivos creados:**
- `src/components/dashboard/recent-activity.tsx` — NUEVO: timeline unificado de notas, recordatorios y creditos con iconos contextuales y timestamps relativos
- `src/components/dashboard/count-up.tsx` — NUEVO: CountUp animado con requestAnimationFrame + ease-out cubic

**Archivos modificados:**
- `src/app/dashboard/page.tsx` — Queries paralelas (notes, reminders, credit_transactions), normalización, RecentActivity + CountUp + hover en cards

---

### ~~M8 — Notas (UI/UX Polish)~~ ✅ COMPLETO

**Prioridad:** MEDIA

- [x] M8.1 — Toggle grid/list view
- [x] M8.2 — Icono de busqueda + debounce
- [x] M8.3 — Tags interactivos (click filtra, colores por hash)
- [ ] M8.4 — Drag and drop (futuro)
- [x] M8.5 — Empty state ilustrado

**Implementado:**

#### M8.1 — Toggle grid/list view ✅
- ✅ Botones toggle LayoutGrid/List con tooltips en la toolbar
- ✅ Grid mode: multi-columna (2 cols sm, 3 cols lg)
- ✅ List mode: horizontal compacto (título + preview + tags + actions en fila)
- ✅ NoteCard `layout` prop con preview truncado a 120 chars en lista
- ✅ Tags limitados a 3 con overflow badge "+N" en lista
- ✅ `aria-pressed` + `role="group"` para accesibilidad

#### M8.2 — Icono de búsqueda + debounce ✅
- ✅ Icono Search (Lucide) dentro del input
- ✅ Debounce de 300ms en búsqueda (searchInput inmediato, search debounced)
- ✅ Botón X para limpiar búsqueda
- ✅ `aria-label` en input y botón clear

#### M8.3 — Tags interactivos ✅
- ✅ 6 colores por hash determinístico (primary, chart-4, success, info, chart-3, destructive)
- ✅ Tags clickeables en NoteCard (grid y list mode)
- ✅ Filtro por tag activo con indicador visual (Tag icon + Badge con X)
- ✅ Click en badge del filtro para limpiar
- ✅ Empty state adaptado para filtro por tag

#### M8.5 — Empty state ilustrado ✅
- ✅ Icono StickyNote en contenedor rounded con bg-primary/10
- ✅ Tipografía mejorada (font-semibold, max-w-sm)
- ✅ Padding aumentado (py-16) para mejor presencia visual

**Archivos modificados:**
- `src/components/notes/note-card.tsx` — layout prop, tagColor hash, onTagClick callback, list layout horizontal
- `src/components/notes/note-list.tsx` — viewMode toggle, debounced search con icono, selectedTag filter, empty state ilustrado

**Tests:** 15 tests (12 existentes + 3 nuevos para list layout y tags overflow)

---

### ~~M9 — Planes y Pricing~~ ✅ COMPLETO

**Prioridad:** MEDIA

- [x] M9.1 — Plan destacado mas grande + ribbon "Mas popular"
- [x] M9.2 — Staggered entrance animation + hover scale
- [x] M9.3 — Badge "Tu plan" con check icon

#### M9.1 — Plan destacado + ribbon ✅
**Archivos modificados:**
- `src/components/plans/plan-card.tsx` — Rediseñado: gradient ribbon banner, Crown icon, Lucide Check icons, larger price/button for highlighted, hover translate-y + shadow, Button loading prop
- `src/components/plans/plan-grid.tsx` — Grid `items-center` para que el plan destacado sobresalga verticalmente

#### M9.2 — Staggered entrance animation ✅
**Archivos modificados:**
- `src/components/plans/plan-card.tsx` — `animate-[fade-in-up_0.5s_ease-out_both]` con `animationDelay` basado en index (0ms, 100ms, 200ms, 300ms)
- `src/components/plans/plan-grid.tsx` — Pasa `index` prop a cada PlanCard

#### M9.3 — Badge "Tu plan" ✅
**Archivos modificados:**
- `src/components/plans/plan-card.tsx` — Badge absoluto top-right con CheckCircle icon + texto "Tu plan" en color success, ring success en card cuando es plan actual

---

### ~~M10 — Accesibilidad y SEO~~ ✅ COMPLETO

**Prioridad:** MEDIA

**Implementado:**
- ✅ M10.1 — `lang="es"` corregido
- ✅ M10.5 — OG tags, favicon, web manifest
- ✅ M10.1 — Eliminado `tabIndex={-1}` del link "Olvidaste tu contrasena?" (ahora accesible por teclado)
- ✅ M10.2 — Skip navigation link en dashboard shell ("Ir al contenido principal") y auth layout ("Ir al formulario")
- ✅ M10.3 — Focus visible styles prominentes (`outline-2 outline-offset-2 outline-ring` global via `@layer base`)
- ✅ M10.4 — `prefers-reduced-motion: reduce` desactiva animaciones, transitions y scroll-behavior smooth

#### M10.2 — Skip Navigation ✅
**Archivos modificados:**
- `src/components/dashboard/shell.tsx` — Skip link "Ir al contenido principal" + `id="main-content"` en `<main>`
- `src/app/(auth)/layout.tsx` — Skip link "Ir al formulario" + `id="auth-form"` en form container

#### M10.3 — Focus Visible Styles ✅
**Archivos modificados:**
- `src/app/globals.css` — `:focus-visible` rule en `@layer base` con `outline-2 outline-offset-2 outline-ring`

#### M10.4 — Reduced Motion ✅
**Archivos modificados:**
- `src/app/globals.css` — `@media (prefers-reduced-motion: reduce)` elimina animation-duration, transition-duration, scroll-behavior

---

### ~~M11 — Dark Mode Toggle~~ ✅ COMPLETO

**Implementado:**
- ✅ M11.1 — `next-themes` con ThemeProvider (system default, class attribute)
- ✅ M11.2 — ThemeToggle dropdown (Claro/Oscuro/Sistema) con Lucide icons
- ✅ M11.3 — Callback banners + credit balance + reminder card migrados a semantic colors
- ✅ M11.3 — Dark theme completo con colores no-invertidos, ajustados para contraste

---

### ~~M12 — Rendimiento y Optimizacion~~ ✅ COMPLETO

**Prioridad:** MEDIA

- [x] M12.1 — `next/image` para ilustraciones ✅ (N/A — no hay `<img>` tags en el codebase)
- [x] M12.2 — Client components audit ✅ (6 componentes optimizados, auth pages ahora Static SSR)
- [x] M12.3 — React Query/SWR para cache ✅ (evaluado y diferido — Server Components ya cubren data fetching principal)
- [x] M12.4 — Bundle analysis ✅ (459KB gzipped, bundle saludable, analyzer configurado)

#### M12.2 — Client Components Audit ✅
**Archivos modificados (removido "use client" innecesario):**
- `src/app/(auth)/login/page.tsx` — Server Component: shell SSR + LoginForm client hydration
- `src/app/(auth)/recovery/page.tsx` — Server Component: shell SSR + RecoveryForm client hydration
- `src/app/(auth)/signup/page.tsx` — Server Component: shell SSR + SignupForm client hydration
- `src/components/dashboard/onboarding-stepper.tsx` — Server Component: SSR completo en dashboard page
- `src/components/credits/credit-balance.tsx` — Server Component: SSR completo en credits page
- `src/components/ui/form-error.tsx` — Limpieza semántica (usado en client components)

**Resultado:** Auth pages (`/login`, `/recovery`, `/signup`) pasaron de client-rendered a `○ Static` (prerendered at build time).

#### M12.3 — React Query/SWR (Evaluado y Diferido) ✅
- Server Components (dashboard, credits pages) ya hacen data fetching en servidor
- Client components con fetch (note-list, reminder-list, transaction-table) son simples
- Agregar React Query sumaría ~15-20KB sin beneficio proporcional
- Se implementará cuando la complejidad de la app lo justifique

#### M12.4 — Bundle Analysis ✅
- Total client JS: 1.7MB sin comprimir, ~459KB gzipped
- Framework (React): 188KB — irreducible
- Supabase client: ~200KB — necesario para client components
- Lucide icons: tree-shaken (named imports en 19 archivos)
- No barrel imports problemáticos detectados
- `@next/bundle-analyzer` configurado (`ANALYZE=true npx next build --webpack`)

**Dependencias agregadas:**
- `@next/bundle-analyzer` (devDependency) — para análisis bajo demanda

---

### ~~M13 — Componentes UI Faltantes~~ ✅ COMPLETO

**Prioridad:** BAJA-MEDIA

- [x] M13.1 — shadcn Select ✅ (reemplazar `<select>` nativo en settings)
- [x] M13.2 — shadcn Tooltip ✅ (TooltipProvider global + tooltips en icon buttons)
- [x] M13.3 — shadcn Sheet ✅ (componente base disponible, side variants top/bottom/left/right)
- [x] M13.4 — shadcn Skeleton ✅ (implementado en M5)
- [x] M13.5 — shadcn Progress ✅ (reemplazar div en credit-balance)
- [x] M13.6 — shadcn Avatar ✅ (perfil con iniciales en header)

#### M13.1 — shadcn Select ✅
**Archivos creados:**
- `src/components/ui/select.tsx` — NUEVO: shadcn Select completo (Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectValue, SelectLabel, SelectSeparator) con Radix primitives, data-slot, animaciones entrada/salida

**Archivos modificados:**
- `src/app/dashboard/settings/page.tsx` — `<select>` nativo reemplazado por `<Select>` shadcn con dropdown animado, check icon en item seleccionado, estilos consistentes con design system

#### M13.2 — shadcn Tooltip ✅
**Archivos creados:**
- `src/components/ui/tooltip.tsx` — NUEVO: shadcn Tooltip (TooltipProvider, Tooltip, TooltipTrigger, TooltipContent) con Radix primitives, data-slot pattern, animaciones entrada/salida, delayDuration=300ms

**Archivos modificados:**
- `src/app/layout.tsx` — `<TooltipProvider>` global envolviendo children (disponible en toda la app)
- `src/components/dashboard/theme-toggle.tsx` — Tooltip "Cambiar tema" en icon button del theme toggle
- `src/components/notes/note-card.tsx` — Tooltip "Acciones" en icon button del dropdown de acciones
- `src/__tests__/notes/note-card.test.tsx` — `renderCard()` wrapper con TooltipProvider para tests

#### M13.3 — shadcn Sheet ✅
**Archivos creados:**
- `src/components/ui/sheet.tsx` — NUEVO: shadcn Sheet (Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription) con Dialog primitive, cva side variants (top/bottom/left/right), slide animations, overlay con backdrop

#### M13.6 — shadcn Avatar ✅
**Archivos creados:**
- `src/components/ui/avatar.tsx` — NUEVO: shadcn Avatar (Avatar, AvatarImage, AvatarFallback) con Radix primitives, data-slot pattern, fallback con iniciales en primary/10

**Archivos modificados:**
- `src/components/dashboard/shell.tsx` — Header: email text plano reemplazado por Avatar con inicial + email al lado

#### M13.5 — shadcn Progress ✅
**Archivos creados:**
- `src/components/ui/progress.tsx` — NUEVO: shadcn Progress con Radix ProgressPrimitive, data-slot pattern, transición 300ms ease-in-out

**Archivos modificados:**
- `src/components/credits/credit-balance.tsx` — `<div>` manual reemplazado por `<Progress />` con color dinámico via data-slot selector (warning/success/primary), aria-label para accesibilidad

---

### M14 — Micro-interacciones y Animaciones

**Prioridad:** BAJA-MEDIA

- [ ] M14.1 — Page transitions (fade-in, staggered reveal)
- [x] M14.2 — Hover states ricos (shadow + translate en cards) ✅ (implementado en M7.1)
- [ ] M14.3 — Feedback tactil (active:scale-95 en botones)
- [x] M14.4 — Numbers animation (count-up en creditos) ✅ (implementado en M7.1)
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

### Ola 2 — Conversion ✅ COMPLETA
- ✅ M2: Landing page completa (hero, features, pricing, how-it-works, footer)
- ✅ M6.1: Auth pages con branding (split layout + gradient panel + glass feature cards)
- ✅ M9: Pricing page completo (ribbon + plan destacado + staggered animation + badge "Tu plan")

### Ola 3 — Polish ✅ COMPLETA
- ✅ M5: Skeletons y loading states
- ✅ M4: Feedback y notificaciones (FormError + toast migration + undo)
- ✅ M7: Dashboard Home completo (stepper + actividad reciente + count-up + hover)
- ✅ M8: Notas UX polish (grid/list, search, tags, empty state)

### Ola 4 — Refinamiento (EN PROGRESO)
- ✅ M13: Componentes UI completos (Select, Tooltip, Sheet, Skeleton, Progress, Avatar)
- ✅ M8: Notas UX polish (grid/list toggle, search debounce, tags interactivos, empty state)
- M3.4: Breadcrumbs
- ✅ M6.2: Auth form polish (step transitions, progress indicator, password strength)
- ✅ M10: Accesibilidad completa (skip nav, focus visible, reduced-motion, tabIndex fix)
- ✅ M12: Performance y optimización (client audit + bundle analysis + auth pages Static SSR)
- M3.4: Breadcrumbs
- M14: Micro-interacciones restantes (page transitions, active:scale-95)

---

## Metricas de Exito

| Metrica | Pre-Ola1 | Post-Ola1 | Post-M2 | Post-M6.1 | Post-M5+M10.5+M6.3 | Post-M9.1 | Post-M4 | Post-M7 | Post-M13 | Post-M10 | Post-M8 | Post-M12 | Post-M6.2 | Objetivo |
|---------|----------|-----------|---------|-----------|---------------------|-----------|---------|---------|----------|----------|---------|----------|-----------|----------|
| Lighthouse Performance | ~85 | ~85 | ~85 | ~85 | ~85 | ~85 | ~85 | ~85 | ~85 | ~85 | ~85 | ~88 (Static SSR) | ~88 | 95+ |
| Lighthouse Accessibility | ~80 | ~90 | ~90 | ~90 | ~90 | ~90 | ~92 (role=alert) | ~92 | ~93 (tooltips) | ~97 | ~97 (aria-pressed+labels) | ~97 | ~97 | 100 |
| Lighthouse SEO | ~70 | ~75 | ~75 | ~75 | ~95 (OG+manifest) | ~95 | ~95 | ~95 | ~95 | ~95 | ~95 | ~95 | ~95 | 100 |
| Mobile usability | FALLA | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | OK | 100 |
| Brand identity | Ninguna | Paleta + tipografia | Landing completa | Auth con branding | Favicon+OG+404+Error | Pricing premium | Pricing premium | Pricing premium | Avatar+Tooltips | Avatar+Tooltips | +Tag colors | +Tag colors | +Auth polish | Distintiva |
| Dark mode | No funcional | Completo | Completo | Completo | Completo | Completo | Completo | Completo | Completo | Completo | Completo | Completo | Completo | Completo |
| Loading states | Texto plano | Texto plano | Texto plano | Texto plano | Skeletons + Spinner | Skeletons + Spinner | Skeletons + Spinner | Skeletons + Spinner | Skeletons + Spinner | Skeletons + Spinner | Skeletons + Spinner | Skeletons + Spinner | Skeletons + Spinner | Premium |
| Error feedback | Inline divs | Inline divs | Inline divs | Inline divs | Inline divs | Inline divs | FormError + Toast + Undo | FormError + Toast + Undo | FormError + Toast + Undo | FormError + Toast + Undo | FormError + Toast + Undo | FormError + Toast + Undo | +OTP/password FormError | Premium |
| Auth forms | Basico | Basico | Basico | Split layout+branding | Split layout+branding | Split layout+branding | Split layout+branding | Split layout+branding | Split layout+branding | Split layout+branding | Split layout+branding | Split layout+branding | +Steps+PwdStrength+Transitions | Premium |
| Dashboard | Cards estaticas | Cards + iconos | Cards + iconos | Cards + iconos | Cards + iconos | Cards + iconos | Cards + iconos | Stepper+Activity+CountUp+Hover | +Avatar header | +Skip nav | +Skip nav | +Skip nav | +Skip nav | Premium |
| Pricing page | Badge simple | Badge simple | Badge simple | Badge simple | Badge simple | Ribbon+Crown+stagger+badge | Ribbon+Crown+stagger+badge | Ribbon+Crown+stagger+badge | Ribbon+Crown+stagger+badge | Ribbon+Crown+stagger+badge | Ribbon+Crown+stagger+badge | Ribbon+Crown+stagger+badge | Ribbon+Crown+stagger+badge | Premium |
| Notes UX | Basico | Basico | Basico | Basico | +Skeleton loading | +Skeleton loading | +Toast undo | +Toast undo | +Toast undo | +Toast undo | Grid/List+Search+Tags+EmptyState | Grid/List+Search+Tags+EmptyState | Grid/List+Search+Tags+EmptyState | Premium |
| UI components | shadcn base | shadcn base | shadcn base | shadcn base | +Skeleton+Spinner | +Skeleton+Spinner | +Skeleton+Spinner | +Skeleton+Spinner | +Tooltip+Sheet+Avatar+Progress+Select | +Tooltip+Sheet+Avatar+Progress+Select | +Tooltip+Sheet+Avatar+Progress+Select | +BundleAnalyzer | +PasswordStrength+StepIndicator | Completo |
| Accessibility | Basica | lang="es" | lang="es" | lang="es" | OG+manifest | OG+manifest | +FormError role=alert | +FormError role=alert | +Tooltips | Skip nav+Focus visible+Reduced motion | +aria-pressed+group | +aria-pressed+group | +aria-pressed+group | WCAG AA |
| Client bundle | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | 459KB gzip | 459KB gzip | <400KB |
| Test suite | 208 passing | 208 passing | 208 passing | 208 passing | 208 passing | 208 passing | 208 passing | 208 passing | 208 passing | 208 passing | 211 passing | 211 passing | 211 passing | Sin regresiones |
