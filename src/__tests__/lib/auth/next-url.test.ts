/**
 * next-url Tests — sanitizeNextUrl + buildAuthRedirect + preserveNext
 *
 * @module __tests__/lib/auth/next-url.test
 */

import { describe, it, expect } from "vitest";
import { sanitizeNextUrl, buildAuthRedirect, preserveNext } from "@/lib/auth/next-url";

describe("sanitizeNextUrl — rejection cases", () => {
  it("returns null for null input", () => {
    expect(sanitizeNextUrl(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(sanitizeNextUrl(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(sanitizeNextUrl("")).toBeNull();
  });

  it("returns null for protocol-relative URLs (//evil.com/path)", () => {
    expect(sanitizeNextUrl("//evil.com/path")).toBeNull();
  });

  it("returns null for https absolute URLs", () => {
    expect(sanitizeNextUrl("https://evil.com/path")).toBeNull();
  });

  it("returns null for http absolute URLs", () => {
    expect(sanitizeNextUrl("http://evil.com/path")).toBeNull();
  });

  it("returns null for javascript: scheme", () => {
    expect(sanitizeNextUrl("javascript:alert(1)")).toBeNull();
  });

  it("returns null for uppercase DATA: scheme (case-insensitive)", () => {
    expect(sanitizeNextUrl("DATA:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("returns null for vbscript: scheme", () => {
    expect(sanitizeNextUrl("vbscript:msgbox(1)")).toBeNull();
  });

  it("returns null for mixed-case JavaScript: scheme", () => {
    expect(sanitizeNextUrl("JaVaScRiPt:alert(1)")).toBeNull();
  });

  it("returns null for paths that don't start with /", () => {
    expect(sanitizeNextUrl("dashboard")).toBeNull();
  });

  it("returns null for relative paths with dot prefix", () => {
    expect(sanitizeNextUrl("./dashboard")).toBeNull();
  });

  it("returns null when path contains javascript: anywhere", () => {
    expect(sanitizeNextUrl("/legit?foo=javascript:alert(1)")).toBeNull();
  });

  // Backslash handling — browsers normalize "\" to "/" in URL parsing, so a
  // seemingly-local path like "/\evil.com" resolves to origin "http://evil.com".
  // The sanitizer must block all these cases.

  it("rejects leading backslash", () => {
    // "\evil.com" never starts with "/", so it's rejected up-front.
    expect(sanitizeNextUrl("\\evil.com")).toBeNull();
  });

  it("rejects /<backslash>host because URL parsing resolves to external origin", () => {
    // Documenting real behavior: "/\evil.com" passes the startsWith("/") check,
    // but `new URL("/\\evil.com", "http://dummy.local")` resolves to origin
    // "http://evil.com" (browsers treat "/\" like "//"), so origin-equality
    // rejects it. Safer than treating it as a local path.
    expect(sanitizeNextUrl("/\\evil.com")).toBeNull();
  });

  it("rejects protocol-relative with backslash trick", () => {
    expect(sanitizeNextUrl("\\\\evil.com")).toBeNull();
  });
});

describe("sanitizeNextUrl — acceptance cases", () => {
  it("accepts a simple path", () => {
    expect(sanitizeNextUrl("/dashboard")).toBe("/dashboard");
  });

  it("accepts a path with query", () => {
    expect(sanitizeNextUrl("/dashboard/plans?status=approved")).toBe(
      "/dashboard/plans?status=approved",
    );
  });

  it("accepts a path with multiple query params", () => {
    expect(sanitizeNextUrl("/dashboard?a=1&b=2&c=3")).toBe("/dashboard?a=1&b=2&c=3");
  });

  it("accepts a path with hash fragment", () => {
    expect(sanitizeNextUrl("/dashboard#section")).toBe("/dashboard#section");
  });

  it("accepts nested external URLs inside a query param (the raw next is internal)", () => {
    // The root next is a safe internal path; whatever query params it carries
    // are the destination page's concern, not ours.
    expect(sanitizeNextUrl("/path?next=//external")).toBe("/path?next=//external");
  });

  it("accepts deep paths", () => {
    expect(sanitizeNextUrl("/dashboard/settings/profile")).toBe(
      "/dashboard/settings/profile",
    );
  });
});

describe("buildAuthRedirect", () => {
  it("builds a /login redirect with encoded next", () => {
    const result = buildAuthRedirect("/login", "/dashboard/plans?status=approved");
    expect(result).toBe("/login?next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved");
  });

  it("builds a /signup redirect with encoded next", () => {
    const result = buildAuthRedirect("/signup", "/dashboard/plans?status=approved");
    expect(result).toBe("/signup?next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved");
  });

  it("produces a URL where ?next round-trips via URLSearchParams", () => {
    const original = "/dashboard/plans?status=approved&token=abc";
    const redirect = buildAuthRedirect("/login", original);

    // Extract the query string, parse, confirm `next` decodes back to the original
    const [, queryString] = redirect.split("?");
    const parsed = new URLSearchParams(queryString);
    expect(parsed.get("next")).toBe(original);
  });

  it("encodes special characters deterministically", () => {
    const result = buildAuthRedirect("/login", "/a b/c?x=1&y=2");
    expect(result).toBe("/login?next=%2Fa%20b%2Fc%3Fx%3D1%26y%3D2");
  });

  it("builds a /login redirect with a plain path (no query)", () => {
    expect(buildAuthRedirect("/login", "/dashboard")).toBe("/login?next=%2Fdashboard");
  });
});

describe("preserveNext", () => {
  /** Build URLSearchParams from a query string for readable test setup. */
  const params = (query: string) => new URLSearchParams(query);

  it("returns target unchanged when no next param", () => {
    expect(preserveNext("/login", params(""))).toBe("/login");
  });

  it("returns target unchanged when next is empty string", () => {
    expect(preserveNext("/login", params("next="))).toBe("/login");
  });

  it("appends ?next when target has no query", () => {
    expect(preserveNext("/login", params("next=/dashboard"))).toBe(
      "/login?next=%2Fdashboard",
    );
  });

  it("appends &next when target already has query", () => {
    expect(
      preserveNext(
        "/set-password?phone=%2B51999888777&from=signup",
        params("next=/dashboard/plans"),
      ),
    ).toBe(
      "/set-password?phone=%2B51999888777&from=signup&next=%2Fdashboard%2Fplans",
    );
  });

  it("ignores invalid next (external URL)", () => {
    expect(preserveNext("/login", params("next=https%3A%2F%2Fevil.com%2Fpath"))).toBe(
      "/login",
    );
  });

  it("ignores invalid next (protocol-relative)", () => {
    expect(preserveNext("/login", params("next=%2F%2Fevil.com%2Fpath"))).toBe("/login");
  });

  it("ignores invalid next (javascript scheme)", () => {
    expect(preserveNext("/login", params("next=javascript%3Aalert(1)"))).toBe("/login");
  });

  it("places next before a hash fragment on target (query before hash)", () => {
    // URL grammar: path?query#fragment. The hash MUST come after the query.
    expect(preserveNext("/login#section", params("next=/x"))).toBe(
      "/login?next=%2Fx#section",
    );
  });

  it("places next before hash when target has both query and hash", () => {
    expect(preserveNext("/login?a=1#section", params("next=/x"))).toBe(
      "/login?a=1&next=%2Fx#section",
    );
  });

  it("URL-encodes next with special characters (ampersand, equals, slashes)", () => {
    const result = preserveNext(
      "/login",
      params("next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved%26token%3Dabc"),
    );
    expect(result).toBe(
      "/login?next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved%26token%3Dabc",
    );
    // Round-trip: decoding the next param yields the original safe path.
    const [, queryString] = result.split("?");
    const parsed = new URLSearchParams(queryString);
    expect(parsed.get("next")).toBe("/dashboard/plans?status=approved&token=abc");
  });
});
