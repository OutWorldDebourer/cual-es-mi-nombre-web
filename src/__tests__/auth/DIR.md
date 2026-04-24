# /src/__tests__/auth/

Tests for all authentication flows: login, signup, OTP verification, phone input, password recovery, and middleware route protection.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `login-form.test.tsx` | Tests for phone + password login flow: PhoneInput → signInWithPassword → redirect; loading assertions use regex for spinner a11y | T8 · 2026-04-01 |
| `middleware.test.ts` | Tests for updateSession route protection: dashboard guard, auth page redirect, passthrough | initial · 2026-03-31 |
| `otp-input.test.tsx` | Tests for OTPInput component and useOTPTimer hook: rendering, keyboard nav, paste, a11y | initial · 2026-03-31 |
| `phone-input.test.tsx` | Tests for PhoneInput component: country selector, E.164 output, keyboard access, search | initial · 2026-03-31 |
| `recovery-form.test.tsx` | Tests for phone-based password recovery: OTP request, verification, password set/reset; loading assertions use regex for spinner a11y | T8 · 2026-04-01 |
| `signup-form.test.tsx` | Tests for multi-step phone signup: phone + password form → OTP verification → redirect; loading assertions use regex for spinner a11y | T8 · 2026-04-01 |
| `auth-footer-link.test.tsx` | Tests for AuthFooterLink: preserves valid ?next, drops external/javascript, className passthrough | 2026-04-23 |
