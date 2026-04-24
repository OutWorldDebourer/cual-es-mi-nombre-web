/**
 * Tests for ``backendApi(supabase).funnel`` — post-payment funnel tracking.
 *
 * Covers:
 * - ``track`` calls ``POST /api/funnel/track`` with the correct body and auth.
 * - ``track`` swallows every failure (network, 4xx, 5xx, missing API_URL,
 *   missing session) without throwing — analytics must never break the
 *   user flow.
 * - Type-level assertion that only the 3 allowlisted events compile.
 *
 * @module __tests__/lib/api-funnel
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

const API_URL = "https://api.example.com";

/**
 * Build a minimal Supabase mock with a resolvable session.
 */
function makeSupabase(accessToken: string | null = "mock-token"): SupabaseClient {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: accessToken ? { access_token: accessToken } : null },
      }),
    },
  } as unknown as SupabaseClient;
}

describe("backendApi.funnel.track", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = API_URL;
    vi.resetModules();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
    vi.restoreAllMocks();
  });

  it("calls POST /api/funnel/track with the correct body and bearer token", async () => {
    const { backendApi } = await import("@/lib/api");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const supabase = makeSupabase("tok-123");
    await backendApi(supabase).funnel.track("post_payment_web_visit", {
      status: "approved",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${API_URL}/api/funnel/track`);
    expect(init?.method).toBe("POST");

    const headers = init?.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers.Authorization).toBe("Bearer tok-123");

    expect(JSON.parse(init?.body as string)).toEqual({
      event: "post_payment_web_visit",
      metadata: { status: "approved" },
    });
  });

  it("sends metadata=null when none is provided", async () => {
    const { backendApi } = await import("@/lib/api");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const supabase = makeSupabase();
    await backendApi(supabase).funnel.track("signup_completed");

    const [, init] = fetchSpy.mock.calls[0];
    expect(JSON.parse(init?.body as string)).toEqual({
      event: "signup_completed",
      metadata: null,
    });
  });

  it("swallows network errors without throwing", async () => {
    const { backendApi } = await import("@/lib/api");

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("ECONNREFUSED"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const supabase = makeSupabase();
    await expect(
      backendApi(supabase).funnel.track("login_succeeded_post_payment"),
    ).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(
      "funnel.track failed",
      expect.any(Error),
    );
  });

  it("swallows 4xx / 5xx responses without throwing", async () => {
    const { backendApi } = await import("@/lib/api");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "bad event" }), { status: 400 }),
    );
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const supabase = makeSupabase();
    await expect(
      backendApi(supabase).funnel.track("post_payment_web_visit"),
    ).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalled();
  });

  it("swallows missing-session (401) scenario without throwing", async () => {
    const { backendApi } = await import("@/lib/api");

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const supabase = makeSupabase(null);
    await expect(
      backendApi(supabase).funnel.track("post_payment_web_visit"),
    ).resolves.toBeUndefined();

    // No request was sent because getAccessToken threw 401 — swallowed.
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("swallows missing API_URL (503) without throwing", async () => {
    process.env.NEXT_PUBLIC_API_URL = "";
    const { backendApi } = await import("@/lib/api");

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const supabase = makeSupabase();
    await expect(
      backendApi(supabase).funnel.track("signup_completed"),
    ).resolves.toBeUndefined();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("accepts all three allowlisted events (compile-time contract)", async () => {
    const { backendApi } = await import("@/lib/api");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    const supabase = makeSupabase();
    const api = backendApi(supabase);

    // If the FunnelEvent union drifts, these lines stop compiling.
    await api.funnel.track("post_payment_web_visit");
    await api.funnel.track("signup_completed");
    await api.funnel.track("login_succeeded_post_payment");

    // @ts-expect-error — arbitrary strings must be rejected by TS.
    await api.funnel.track("random_event");
  });
});
