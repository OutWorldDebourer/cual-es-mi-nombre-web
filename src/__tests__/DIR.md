# /src/__tests__/

Vitest test suites organized by feature area, with shared test setup and mocks.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `setup.ts` | Test environment setup: jest-dom matchers, Supabase client mocks, next/navigation mocks, matchMedia polyfill (reduced-motion), IntersectionObserver mock | T4 · 2026-03-31 |

## Subdirectories
| Directory | Description |
|-----------|-------------|
| `auth/` | Tests for authentication: login, signup, OTP, phone input, recovery, middleware |
| `credits/` | Tests for the credit balance display component |
| `lib/` | Tests for library/utility functions |
| `notes/` | Tests for the notes feature |
| `reminders/` | Tests for the reminders feature |
