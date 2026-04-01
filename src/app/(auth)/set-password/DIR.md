# /src/app/(auth)/set-password/

Set password page — allows WhatsApp-first users (no web password yet) to create one via phone OTP verification.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `page.tsx` | Client Component using RecoveryForm (purpose="set_password"), reads ?phone and ?from=signup search params, validates E.164 input; uses semantic success tokens for banner; MotionReveal entrance animation + Suspense with AuthFormSkeleton fallback | T10 · 2026-04-01 |
