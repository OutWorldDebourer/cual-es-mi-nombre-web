# ¿Cuál es mi nombre? — Frontend Web

Dashboard web para **"Cuál es mi nombre"**, un asistente virtual de WhatsApp basado en IA.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS 4** + **shadcn/ui**
- **Supabase Auth** (`@supabase/ssr`) — SSR session management
- **Deploy:** Vercel (free tier)

## Arquitectura

```
src/
├── app/
│   ├── (auth)/           # Login, Signup (route group)
│   │   ├── actions.ts    # Server actions for auth
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── auth/
│   │   ├── callback/route.ts  # OAuth callback
│   │   └── confirm/page.tsx   # Email verification
│   ├── dashboard/
│   │   ├── layout.tsx         # Auth guard + sidebar
│   │   ├── page.tsx           # Home (credits, plan, status)
│   │   └── settings/
│   │       ├── page.tsx       # Name + timezone
│   │       ├── whatsapp/      # WA linking flow
│   │       └── google/        # Calendar OAuth
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/
│   ├── dashboard/
│   │   ├── shell.tsx          # Sidebar + header layout
│   │   └── logout-button.tsx
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client (RSC)
│   │   └── middleware.ts      # Session refresh
│   └── utils.ts               # cn() utility
├── types/
│   └── database.ts            # DB type definitions
└── middleware.ts               # Root middleware (auth + routes)
```

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 3. Ejecutar en modo desarrollo
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase (pública) |
| `NEXT_PUBLIC_API_URL` | URL del backend Python en Railway |

## Deploy en Vercel

1. Ir a [vercel.com](https://vercel.com) → **New Project**
2. Importar repo `OutWorldDebourer/cual-es-mi-nombre-web`
3. Configurar variables de entorno en Vercel Dashboard
4. Deploy automático en cada push a `main`

## Observabilidad (Sentry)

Sentry está configurado en cliente/server/edge. Para activarlo, setear estas env vars en Vercel (Preview + Production):

- `NEXT_PUBLIC_SENTRY_DSN` — DSN del cliente (público, se inyecta al bundle)
- `SENTRY_DSN` — DSN del servidor
- `SENTRY_ORG`, `SENTRY_PROJECT` — para source map upload
- `SENTRY_AUTH_TOKEN` — token de API con permiso `project:releases`, solo en build

Sin estas env vars, Sentry queda deshabilitado (no-op) y la app funciona normalmente.

## Relación con el Backend

Este frontend es la contraparte web del sistema **"Cuál es mi nombre"**.  
El backend Python (FastAPI + LangGraph + Redis) está en un repo separado: [`cual-es-mi-nombre`](https://github.com/OutWorldDebourer/cual-es-mi-nombre).

- El frontend habla **directo con Supabase** para el 80% de operaciones (RLS protege)
- Solo llama al backend para: vincular WhatsApp y conectar Google Calendar (OAuth2)
