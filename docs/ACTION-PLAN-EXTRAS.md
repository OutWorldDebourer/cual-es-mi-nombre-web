# Plan de Acción — Mejoras Adicionales (Post Fase 6)

**Fecha:** 2026-03-25
**Base:** Análisis del codebase post-implementación de 6 fases (17 tareas)
**Estado:** Pendiente

---

## Fase 7 — Áreas no cubiertas (P1-P2)

Componentes y vistas que no fueron tocados en las 6 fases originales pero tienen oportunidades de mejora.

---

### Tarea 7.1 — Chat: responsive y UX mobile

- **Prioridad:** P1
- **Complejidad:** M (30-90 min)
- **Archivos:** `src/components/chat/chat-view.tsx`, `chat-input.tsx`, `chat-message.tsx`, `chat-message-list.tsx`
- **Dependencias:** Tarea 2.1 (bottom nav — ya completada)
- **Qué hacer:**
  1. Verificar que el chat view ocupa el viewport completo en mobile sin quedar detrás de la bottom nav
  2. El input de chat debe tener safe area padding en iPhone (teclado + notch)
  3. Asegurar que `chat-input.tsx` tenga `pb-safe` o equivalente cuando la bottom nav está visible
  4. Auto-scroll al último mensaje al abrir y al enviar
  5. Mensajes largos: verificar que hacen word-break correcto y no desbordan horizontalmente
- **Criterio de éxito:** Chat funciona perfectamente en mobile con bottom nav visible. Input no queda oculto. Mensajes no desbordan.
- **Branch:** `dev/fase-7-tarea-1-chat-mobile`

---

### Tarea 7.2 — Landing page: responsive polish

- **Prioridad:** P2
- **Complejidad:** M (30-90 min)
- **Archivos:** `src/components/landing/hero-content.tsx`, `pricing-section.tsx`, `animated-chat-demo.tsx`, `animated-steps.tsx`
- **Dependencias:** ninguna
- **Qué hacer:**
  1. Landing tiene mínimos breakpoints — verificar en 320px y 414px que nada desborda
  2. `pricing-section.tsx` tiene `sm:grid-cols-3` — en mobile los 3 planes se apilan, verificar que el plan destacado (Pro) se diferencia visualmente al estar stacked
  3. `hero-content.tsx` — verificar tamaño de texto y CTA en mobile
  4. `animated-chat-demo.tsx` — verificar que la demo animada no desborda en pantallas pequeñas
  5. `feature-card.tsx` y `tilt-card.tsx` — agregar `overflow-hidden` si no lo tienen (las cards de la landing NO usan el componente base Card de shadcn)
- **Criterio de éxito:** Landing page 100% funcional y estética en 320px-414px. Sin overflow, sin texto cortado.
- **Branch:** `dev/fase-7-tarea-2-landing-responsive`

---

### Tarea 7.3 — Auth pages: mobile polish

- **Prioridad:** P2
- **Complejidad:** S (< 30 min)
- **Archivos:** `src/components/auth/login-form.tsx`, `signup-form.tsx`, `recovery-form.tsx`, `phone-input.tsx`, `otp-input.tsx`, `step-indicator.tsx`
- **Dependencias:** ninguna
- **Qué hacer:**
  1. `step-indicator.tsx` — en mobile con 3+ pasos los labels se aprietan. Ocultar labels en mobile, mostrar solo números/dots: `<span className="hidden sm:inline">{label}</span>`
  2. `phone-input.tsx` — verificar que el selector de país + input no desbordan en 320px
  3. `otp-input.tsx` — verificar que los 6 inputs caben en 320px con gap adecuado
  4. Forms de auth — verificar que los botones tienen `w-full` en mobile
- **Criterio de éxito:** Flujos de login, signup, recovery funcionan visualmente en 320px.
- **Branch:** `dev/fase-7-tarea-3-auth-mobile`

---

### Tarea 7.4 — Plans y Credits: overflow defensivo

- **Prioridad:** P2
- **Complejidad:** S (< 30 min)
- **Archivos:** `src/components/plans/plan-card.tsx`, `plan-grid.tsx`, `cancel-subscription-dialog.tsx`, `src/components/credits/credit-balance.tsx`, `transaction-table.tsx`
- **Dependencias:** ninguna
- **Qué hacer:**
  1. `plan-card.tsx` — verificar que la card tiene `overflow-hidden` (puede que use Card base que ya lo tiene, confirmar)
  2. `credit-balance.tsx` — verificar overflow y responsive
  3. `transaction-table.tsx` — en mobile las tablas son problemáticas. Verificar que hay scroll horizontal o que las columnas se ocultan con `hidden sm:table-cell`
  4. `cancel-subscription-dialog.tsx` — verificar que el dialog es responsive (debería usar ResponsiveDialog si tiene contenido largo)
- **Criterio de éxito:** Vistas de planes y créditos sin overflow en mobile. Tablas con scroll o columnas ocultas adecuadamente.
- **Branch:** `dev/fase-7-tarea-4-plans-credits`

---

### Tarea 7.5 — WhatsApp linking: responsive

- **Prioridad:** P2
- **Complejidad:** S (< 30 min)
- **Archivos:** `src/components/settings/whatsapp-linking.tsx`
- **Dependencias:** ninguna
- **Qué hacer:**
  1. Verificar que las cards de vinculación WhatsApp tienen overflow-hidden (ya cubierto por Card base, confirmar)
  2. Si hay QR code, verificar que el tamaño es responsive y no desborda en 320px
  3. Si hay botones de acción, verificar stack vertical en mobile
- **Criterio de éxito:** Flujo de vinculación WhatsApp funcional y estético en mobile.
- **Branch:** `dev/fase-7-tarea-5-whatsapp-responsive`

---

## Resumen

| Tarea | Prioridad | Complejidad | Área |
|-------|-----------|-------------|------|
| 7.1 Chat mobile | P1 | M | Chat |
| 7.2 Landing responsive | P2 | M | Landing |
| 7.3 Auth mobile | P2 | S | Auth |
| 7.4 Plans/Credits overflow | P2 | S | Payments |
| 7.5 WhatsApp linking | P2 | S | Settings |

**Esfuerzo total estimado:** ~3-4h
