# Action Plan Final — Post-Deploy

**Fecha:** 2026-03-25
**Estado del deploy:** ✅ Redeploy forzado a producción completado

---

## Estado actual

- **Deploy:** Nuevo build en producción (Vercel) con `NEXT_PUBLIC_API_URL=https://api.cualesminombre.com` inyectada
- **Backend:** Responde correctamente (`401 Not authenticated` = requiere auth, OK)
- **Fases 1-8:** Todas deployadas (commit `b9c8775` es el más reciente)

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
- [ ] Agregar validación defensiva en `backendApi()` que loguee warning si `API_URL` está vacía
- [ ] Considerar un health-check en el dashboard que detecte si la API es alcanzable

---

## 2. Chat overlay — verificación post-fix

El chat overlay (Fase 8) incluye:
- [x] FAB flotante con posición corregida (no tapa bottom-nav)
- [x] Botón X para cerrar overlay
- [x] Retry logic con backoff
- [x] Validación de `API_URL` con mensaje de error descriptivo
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

De `AUDIT-RESPONSIVE-UI.md`, items de severidad **media** aún pendientes:

- [ ] `dashboard/page.tsx` L115: h1 del saludo sin `line-clamp-2` (nombres largos desbordan)
- [ ] `note-card.tsx` L305 (list layout): `w-48` fijo puede desbordar en <375px
- [ ] `note-card.tsx` (list layout): Card sin `overflow-hidden`
- [ ] `reminder-card.tsx` L107: `shrink-0` en fecha puede empujar menú fuera del viewport en <360px
- [ ] `note-view-dialog.tsx` L55-68: título + badges pueden exceder ancho en mobile

Items de severidad **baja** (defensive coding, no urgentes):
- Cards sin `overflow-hidden` en: settings, credits, whatsapp-linking (6+ instancias)
- `onboarding-stepper.tsx`: labels apretados en <320px
- `min-w-0` faltante en algunos flex containers

---

## 5. Tests pendientes

- [ ] Test para `backendApi` cuando `API_URL` es vacía (debe dar error descriptivo, no request a ruta relativa)
- [ ] Test para chat retry logic (mock de fetch failures)
- [ ] Test para `google-auth.ts` throw cuando URL vacía (ya implementado, falta test)

---

## 6. Mejoras futuras (nice-to-have)

- [ ] Runtime env check: mostrar banner en dashboard si API no responde
- [ ] Sentry en frontend para capturar errores de red
- [ ] PWA: revisar service worker caching de API calls
- [ ] Performance: lazy load del chat overlay (solo cargar JS cuando se abre)

---

## Prioridades

1. **Inmediato:** Verificar chat funciona con usuario real (browser test)
2. **Esta semana:** Items media de auditoría responsive
3. **Próxima semana:** Tests + Sentry frontend
4. **Backlog:** Items baja severidad + nice-to-have
