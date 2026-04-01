# /src/__tests__/lib/

Unit tests for shared library utilities (API client, dates, phone formatting, Google auth).

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `api.test.ts` | Tests backendApi and publicFetch behavior when API_URL is empty or present (503 errors, auth tokens) | initial · 2026-03-30 |
| `chat-retry.test.ts` | Tests chat retry logic — verifies fetch retries on network failure via backendApi mock | initial · 2026-03-30 |
| `dates.test.ts` | Tests date formatting utilities: formatDateTime, formatDate, formatRelativeTime, isPast, isToday | initial · 2026-03-30 |
| `google-auth.test.ts` | Tests Google Calendar auth helpers: connect URL builder, connected-state check, callback banners | initial · 2026-03-30 |
| `phone-utils.test.ts` | Tests E.164 validation, country lookups, formatting, masking, and Zod schemas for phone numbers | initial · 2026-03-30 |
