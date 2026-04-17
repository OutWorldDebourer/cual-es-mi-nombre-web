# src/app/qa-console/

Dashboard local para validación end-to-end de los 9 agentes WhatsApp. Renderiza
una grilla 3x3 con un chat por phone de prueba; dispara webhooks firmados a
producción y muestra respuestas en tiempo real (Supabase Realtime).

## Files

- `page.tsx` — Server entry. Renderiza `ConsoleClient` (force-dynamic).
- `ConsoleClient.tsx` — Client root. Estado, realtime subscription, grid, controles. Exports: `ConsoleClient`.

## Subdirectories

- `api/send/` — Route handler POST que firma + POSTea webhook a Railway.
- `api/cleanup/` — Route handler POST que borra datos de profiles fake (y opcionalmente datos del real en ventana de 60 min).
- `lib/` — Tipos, mapping de phones, métricas.

## Entry points

- `ConsoleClient` (ConsoleClient.tsx) — Componente raíz consumido solo por `page.tsx`.

## Variables de entorno

Agregar a `.env.local` antes de correr `pnpm dev`:

```bash
# Ya existentes
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…

# Nuevas (solo para QA console)
SUPABASE_SERVICE_ROLE_KEY=eyJ…   # required: usado solo por /api/cleanup, salta RLS
WHATSAPP_APP_SECRET=<de Railway api-service>   # required: para firmar webhooks
QA_WEBHOOK_URL=https://api.cualesminombre.com/webhook/whatsapp   # opcional, default este
QA_WA_PHONE_NUMBER_ID=1022524394270943   # opcional, default este
```

## Cómo usar

1. Asegura que el seed corrió: `psql "$SUPABASE_URL" -f scripts/e2e_seed_test_profiles.sql`.
2. (Si vas a probar calendario u orquestador) `python -m scripts.e2e_copy_google_token`.
3. `pnpm dev` y abre http://localhost:3000/qa-console.
4. Cada columna corresponde a un phone. Escribe en el input y `Enter` envía.
5. Las respuestas del bot llegan vía Supabase Realtime (~10-15s).
6. Los reply buttons aparecen automáticamente cuando el bot pide confirmación; click los simula con `interactiveId`.
7. Botón `Cleanup fakes` borra todo de los 8 profiles fake. `Cleanup all (60min)` además borra del profile real lo creado en los últimos 60 min.

## Reglas de seguridad

- La columna del phone real (`51942961598`) está marcada con badge ROJO. No enviar mensajes ahí casualmente.
- `WHATSAPP_APP_SECRET` y `SUPABASE_SERVICE_ROLE_KEY` solo se leen server-side (route handlers). Nunca llegan al cliente.
- El cleanup del profile real usa ventana de 60 min para no perder datos legítimos.

## Related

- `../../../../docs/agentes/conversaciones/` — Playbooks reproducibles que esta consola permite ejecutar a mano.
- `../../../../scripts/e2e_seed_test_profiles.sql` — Seed de los 8 profiles fake.
- `../../../../scripts/e2e_cleanup_test_profiles.sql` — Cleanup CLI alternativo.
- `../../../../.claude/skills/validate-agent-whatsapp/SKILL.md` — Skill base.
