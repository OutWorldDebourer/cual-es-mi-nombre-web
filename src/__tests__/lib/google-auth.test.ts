import { describe, expect, it } from "vitest";

import {
  buildGoogleAuthCallbackBanner,
  buildGoogleConnectContractUrl,
  isGoogleCalendarConnected,
} from "@/lib/google-auth";

describe("google-auth contract helpers", () => {
  it("builds the stable backend Google connect URL", () => {
    const url = buildGoogleConnectContractUrl(
      "https://api.example.com",
      "jwt-token",
    );

    expect(url).toBe("https://api.example.com/auth/google/connect?token=jwt-token");
    expect(url).not.toContain("user_id=");
    expect(url).not.toContain("/auth/google/login");
  });

  it("uses google_token_vault_id as the canonical connected signal", () => {
    expect(isGoogleCalendarConnected({ google_token_vault_id: "vault-123" })).toBe(true);
    expect(isGoogleCalendarConnected({ google_token_vault_id: null })).toBe(false);
    expect(isGoogleCalendarConnected(null)).toBe(false);
  });

  it("builds a success banner only when the callback and profile converge", () => {
    expect(buildGoogleAuthCallbackBanner({ google_auth: "success" }, true)).toEqual({
      tone: "success",
      title: "Google Calendar conectado",
      description: "El dashboard ya refleja el estado real de tu perfil en Supabase.",
    });

    expect(buildGoogleAuthCallbackBanner({ google_auth: "success" }, false)).toEqual({
      tone: "warning",
      title: "Autorización recibida",
      description: "El redirect volvió correctamente, pero tu perfil aún no refleja la conexión de Google Calendar.",
    });
  });

  it("throws when apiUrl is empty", () => {
    expect(() => buildGoogleConnectContractUrl("", "jwt-token")).toThrow(
      "NEXT_PUBLIC_API_URL is required",
    );
  });

  it("throws when accessToken is empty", () => {
    expect(() => buildGoogleConnectContractUrl("https://api.example.com", "")).toThrow(
      "A valid Supabase access token is required",
    );
  });

  it("maps backend callback errors to deterministic dashboard messages", () => {
    expect(
      buildGoogleAuthCallbackBanner(
        { google_auth: "error", reason: "consent_denied" },
        false,
      ),
    ).toEqual({
      tone: "error",
      title: "No se pudo completar la conexión",
      description: "Cancelaste el permiso en Google antes de completar la conexión.",
    });
  });
});