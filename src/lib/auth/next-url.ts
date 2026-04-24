/**
 * next-url — Safe handling of `?next=` query params for post-auth redirects.
 *
 * @module lib/auth/next-url
 */

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
  const params = new URLSearchParams();
  params.set("next", originalPathAndQuery);
  return `${target}?${params.toString()}`;
}
