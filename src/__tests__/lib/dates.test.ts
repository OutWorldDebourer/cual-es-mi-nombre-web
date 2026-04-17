/**
 * Date Utilities Tests — "Cuál es mi nombre" Web
 *
 * Tests for the formatting utility functions used across the dashboard.
 *
 * @module __tests__/lib/dates.test
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  formatDateTime,
  formatDate,
  formatRelativeTime,
  isPast,
  isToday,
} from "@/lib/dates";

describe("formatDateTime", () => {
  it("formats a UTC date to a locale string", () => {
    const result = formatDateTime("2026-03-01T15:30:00Z", "America/Lima");
    // Peru is UTC-5, so 15:30 UTC → 10:30 local
    expect(result).toContain("10:30");
    expect(result).toMatch(/mar/i); // "mar" for March in Spanish
  });
});

describe("formatDate", () => {
  it("formats date-only (no time)", () => {
    const result = formatDate("2026-03-01T15:30:00Z", "America/Lima");
    expect(result).toMatch(/1/);
    expect(result).toMatch(/mar/i);
    expect(result).not.toContain(":");
  });
});

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 'hace un momento' for < 60 seconds", () => {
    const now = new Date("2026-03-01T12:00:30Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const result = formatRelativeTime("2026-03-01T12:00:00Z");
    expect(result).toBe("hace un momento");
  });

  it("returns 'hace Xh' for hours", () => {
    const now = new Date("2026-03-01T15:00:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const result = formatRelativeTime("2026-03-01T12:00:00Z");
    expect(result).toBe("hace 3h");
  });

  it("returns 'hace Xd' for days", () => {
    const now = new Date("2026-03-03T12:00:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const result = formatRelativeTime("2026-03-01T12:00:00Z");
    expect(result).toBe("hace 2d");
  });

  it("clamps future timestamps (clock drift) to 'hace un momento'", () => {
    const now = new Date("2026-03-01T12:00:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);

    // Message timestamp 10s in the future relative to "now"
    const result = formatRelativeTime("2026-03-01T12:00:10Z");
    expect(result).toBe("hace un momento");
  });
});

describe("isPast", () => {
  it("returns true for past dates", () => {
    expect(isPast("2020-01-01T00:00:00Z")).toBe(true);
  });

  it("returns false for future dates", () => {
    expect(isPast("2099-01-01T00:00:00Z")).toBe(false);
  });
});

describe("isToday", () => {
  it("returns true for today's date", () => {
    const now = new Date().toISOString();
    expect(isToday(now)).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(isToday(yesterday)).toBe(false);
  });
});
