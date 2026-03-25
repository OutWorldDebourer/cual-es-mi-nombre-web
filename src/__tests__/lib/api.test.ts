import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// We need to test backendApi and publicFetch behavior when API_URL is empty.
// Since API_URL is read at module level from process.env, we use dynamic imports.

describe("backendApi — API_URL validation", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    vi.resetModules();
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  });

  it("authFetch throws ApiError 503 when API_URL is empty", async () => {
    process.env.NEXT_PUBLIC_API_URL = "";
    const { backendApi, ApiError } = await import("@/lib/api");

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { access_token: "token" } },
        }),
      },
    } as any;

    const api = backendApi(mockSupabase);

    await expect(api.chat.history()).rejects.toThrow(ApiError);
    await expect(api.chat.history()).rejects.toThrow(
      "Backend no configurado",
    );
  });

  it("publicFetch throws ApiError 503 when API_URL is empty", async () => {
    process.env.NEXT_PUBLIC_API_URL = "";
    const { getPlans, ApiError } = await import("@/lib/api");

    await expect(getPlans()).rejects.toThrow(ApiError);
    await expect(getPlans()).rejects.toThrow("Backend no configurado");
  });

  it("authFetch makes request when API_URL is configured", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const { backendApi } = await import("@/lib/api");

    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { access_token: "token" } },
        }),
      },
    } as any;

    // Mock fetch to return a successful response
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ messages: [], has_more: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = backendApi(mockSupabase);
    const result = await api.chat.history();

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.example.com/api/chat/history",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
      }),
    );

    fetchSpy.mockRestore();
  });
});
