/**
 * next-url — Safe handling of `?next=` query params for post-auth redirects.
 *
 * @module lib/auth/next-url
 */

import type { ReadonlyURLSearchParams } from "next/navigation";

const DUMMY_ORIGIN = "http://dummy.local";

// Dangerous URI schemes that could execute code if ever handed to `router.push`
// or injected into an href. Matched case-insensitively inside the raw input.
const DANGEROUS_SCHEMES = ["javascript:", "data:", "vbscript:"] as const;

/**
 * Sanitize a `next` query param from user-controlled input.
 *
 * Rejects: null/empty, absolute URLs, protocol-relative URLs (//evil),
 * javascript:/data:/vbscript: schemes, paths not starting with "/".
 *
 * Returns the safe relative path (identical to input when valid), or null
 * if input is invalid.
 */
export function sanitizeNextUrl(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }

  // Protocol-relative ("//evil.com/x") resolves against the current origin
  // in browsers but points to an external host — never safe as `next`.
  if (raw.startsWith("//")) {
    return null;
  }

  if (!raw.startsWith("/")) {
    return null;
  }

  const lower = raw.toLowerCase();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (lower.includes(scheme)) {
      return null;
    }
  }

  try {
    const parsed = new URL(raw, DUMMY_ORIGIN);
    if (parsed.origin !== DUMMY_ORIGIN) {
      return null;
    }
  } catch {
    return null;
  }

  return raw;
}

/**
 * Build a redirect URL to an auth page preserving the original destination.
 *
 * @example
 *   buildAuthRedirect("/login", "/dashboard/plans?status=approved")
 *   => "/login?next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved"
 */
export function buildAuthRedirect(
  target: "/login" | "/signup",
  originalPathAndQuery: string,
): string {
  return `${target}?next=${encodeURIComponent(originalPathAndQuery)}`;
}

/**
 * Build a target URL that preserves the current `?next=` param if present.
 *
 * Use for lateral links within auth flows (e.g., signup → login → recovery)
 * so the original post-auth destination isn't lost when users pivot
 * between auth screens.
 *
 * The `next` param is always appended as the last query key, BEFORE any hash
 * fragment on `target` — that matches URL grammar (`path?query#fragment`).
 * Invalid or missing `next` values are silently ignored (target returned
 * unchanged); sanitization follows the same rules as `sanitizeNextUrl`.
 *
 * @example
 *   // Current URL: /signup?next=/dashboard/plans
 *   preserveNext("/login", searchParams)
 *   // → "/login?next=%2Fdashboard%2Fplans"
 *
 *   preserveNext("/set-password?phone=123", searchParams)
 *   // → "/set-password?phone=123&next=%2Fdashboard%2Fplans"
 *
 *   preserveNext("/login#section", searchParams)
 *   // → "/login?next=%2Fdashboard%2Fplans#section"
 */
export function preserveNext(
  target: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): string {
  const rawNext = searchParams.get("next");
  const next = sanitizeNextUrl(rawNext);
  if (!next) return target;

  // Split target into [path+query, hash] so the query param lands BEFORE
  // the hash fragment, matching RFC 3986 grammar.
  const hashIndex = target.indexOf("#");
  const base = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : target.slice(hashIndex);

  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}next=${encodeURIComponent(next)}${hash}`;
}
