# /src/app/(auth)/

Authentication route group — shared split-panel layout (branding left, form right) with server actions for logout.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `actions.ts` | Server action for logout — signs out via Supabase, revalidates cache, redirects to /login | initial · 2026-03-30 |
| `layout.tsx` | Auth layout — desktop split panel (teal branding + form), mobile compact header + centered form; orbs animated with float-orb keyframes; feature cards with backdrop-blur-xl + hover scale; brand link with focus-visible outline | T10 · 2026-04-01 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `login/` | Phone + password login page |
| `recovery/` | Phone-based OTP password recovery page |
| `set-password/` | First-time web password creation for WhatsApp-first users |
| `signup/` | New user registration page |
