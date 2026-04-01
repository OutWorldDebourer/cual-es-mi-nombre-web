# /src/components/auth/

Phone-based authentication components: login, signup, password recovery, and shared form primitives.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `login-form.tsx` | Phone + password login form using Supabase signInWithPassword, redirects to /dashboard | initial · 2026-03-30 |
| `otp-input.tsx` | 6-digit OTP verification input with auto-advance, paste support, and useOTPTimer hook | initial · 2026-03-30 |
| `password-strength.tsx` | Visual password strength meter with 4-level scoring (muy debil to fuerte) | initial · 2026-03-30 |
| `phone-input.tsx` | Country-selector + national number input that outputs E.164 format, default Peru (+51) | initial · 2026-03-30 |
| `recovery-form.tsx` | Multi-step password recovery/set-password form (phone > OTP > new password) via backend API | initial · 2026-03-30 |
| `signup-form.tsx` | Multi-step phone registration with pre-signup check, Supabase OTP verification, and WA-first user detection | initial · 2026-03-30 |
| `step-indicator.tsx` | Dot-based step progress indicator used by signup and recovery multi-step flows | initial · 2026-03-30 |
