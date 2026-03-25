# Action Plan Final — Post-Deploy

**Fecha:** 2026-03-25
**Estado del deploy:** ✅ Redeploy forzado a producción completado
**Última actualización:** 2026-03-25 (Fase A+B+C completadas)

---

## Estado actual

- **Deploy:** Nuevo build en producción (Vercel) con `NEXT_PUBLIC_API_URL=https://api.cualesminombre.com` inyectada
- **Backend:** Responde correctamente (`401 Not authenticated` = requiere auth, OK)
- **Fases 1-8:** Todas deployadas (commit `b9c8775` es el más reciente pre-hardening)
- **Hardening + Tests:** Commit `8699270` — merged a main

---

## 1. Features que dependen de `backendApi` (riesgo de URL vacía)

Todos estos archivos usan `backendApi()` y fallarían si `NEXT_PUBLIC_API_URL` está vacía:

| Archivo | Feature | Riesgo |
|---------|---------|--------|
| `chat/chat-overlay.tsx` | Chat flotante (history + send) | **Alto** — ya confirmado que fallaba |
| `chat/chat-view.tsx` | Vista de chat completa | **Alto** — mismo problema |
| `dashboard/google-connect-button.tsx` | Conexión Google Calendar | Medio |
| `dashboard/google-disconnect-button.tsx` | Desconexión Google | Medio |
| `plans/cancel-subscription-dialog.tsx` | Cancelar suscripción | Medio |
| `plans/plan-grid.tsx` | Listar planes / checkout | Medio |
| `settings/whatsapp-linking.tsx` | Vincular WhatsApp | **Alto** — feature core |
| `lib/google-auth.ts` | OAuth Google | Medio — ya tiene throw si URL vacía |

### Acción recomendada
- [x] ✅ `authFetch()` ya tenía validación defensiva — throw ApiError 503 si `API_URL` vacía
- [x] ✅ `publicFetch()` ahora también tiene la misma validación (era un gap)
- [x] ✅ Health-check hook (`useApiHealth`) + `ApiStatusBanner` en dashboard shell
- [x] ✅ Banner muestra warning si API unreachable o unconfigured al cargar dashboard

---

## 2. Chat overlay — verificación post-fix

El chat overlay (Fase 8) incluye:
- [x] FAB flotante con posición corregida (no tapa bottom-nav)
- [x] Botón X para cerrar overlay
- [x] Retry logic con backoff
- [x] Validación de `API_URL` con mensaje de error descriptivo
- [x] ✅ `NEXT_PUBLIC_API_URL` confirmada en Vercel env vars (verificado via `vercel env ls`)
- [ ] **Pendiente:** Verificar funcionamiento real con usuario autenticado (probar en browser)

---

## 3. Cambios de Fase 8 — status

| Item | Estado |
|------|--------|
| Badge "Pendiente" sin truncar | ✅ Deployado (`358925b`) |
| FAB position (no tapar bottom-nav) | ✅ Deployado (`212f080`) |
| Botón X en overlay | ✅ Deployado (`212f080`) |
| Retry logic mejorada | ✅ Deployado (`b9c8775`) |
| API_URL validation | ✅ Deployado (`b9c8775`) |

---

## 4. Pendientes de auditoría (severidad media+)

De `AUDIT-RESPONSIVE-UI.md`, items de severidad **media** — **TODOS VERIFICADOS COMO RESUELTOS:**

- [x] ✅ `dashboard/page.tsx` L141: h1 del saludo YA tiene `line-clamp-2`
- [x] ✅ `note-card.tsx` L315 (list layout): Cambiado a `w-32 sm:w-48` con `min-w-0` — responsive
- [x] ✅ `note-card.tsx` (list layout): Card YA tiene `overflow-hidden` (L398)
- [x] ✅ `reminder-card.tsx` L111: Card YA tiene `overflow-hidden`
- [x] ✅ `note-view-dialog.tsx` L51-52: DialogTitle tiene `min-w-0`, título usa `truncate min-w-0`

Items de severidad **baja** (defensive coding, no urgentes):
- Cards sin `overflow-hidden` en: settings, credits, whatsapp-linking (6+ instancias)
- `onboarding-stepper.tsx`: labels apretados en <320px
- `min-w-0` faltante en algunos flex containers

---

## 5. Tests pendientes

- [x] ✅ Test para `backendApi` cuando `API_URL` es vacía — 3 tests (`api.test.ts`)
- [x] ✅ Test para chat retry logic — 2 tests (`chat-retry.test.ts`)
- [x] ✅ Test para `google-auth.ts` throw cuando URL vacía — 2 tests añadidos a `google-auth.test.ts`
- [x] ✅ **236 tests pasando**, `tsc --noEmit` clean

---

## 6. Mejoras futuras (nice-to-have)

- [x] ✅ Runtime env check: banner en dashboard si API no responde (ApiStatusBanner)
- [ ] Sentry en frontend para capturar errores de red
- [ ] PWA: revisar service worker caching de API calls
- [ ] Performance: lazy load del chat overlay (solo cargar JS cuando se abre)

---

## Prioridades

1. ~~**Inmediato:** Verificar chat funciona con usuario real (browser test)~~ → Pendiente manual
2. ~~**Esta semana:** Items media de auditoría responsive~~ → ✅ Todos resueltos
3. ~~**Próxima semana:** Tests + Sentry frontend~~ → ✅ Tests completados
4. **Backlog:** Items baja severidad + nice-to-have + Sentry frontend
