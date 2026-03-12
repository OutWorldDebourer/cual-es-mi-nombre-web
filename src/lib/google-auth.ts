/**
 * Google OAuth frontend contract helpers.
 *
 * A7.3.2 keeps the dashboard aligned with the stable backend entrypoint:
 * the web app only knows `/auth/google/connect?token=...`, while the
 * backend retains ownership of `user_id`, OAuth state, and redirect rules.
 *
 * @module lib/google-auth
 */

export interface GoogleConnectionSnapshot {
  google_token_vault_id?: string | null;
}

export interface GoogleAuthCallbackParams {
  google_auth?: string | string[] | null;
  reason?: string | string[] | null;
}

export type GoogleAuthCallbackTone = "idle" | "success" | "warning" | "error";

export interface GoogleAuthCallbackBanner {
  tone: GoogleAuthCallbackTone;
  title: string | null;
  description: string | null;
}

const GOOGLE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  consent_denied: "Cancelaste el permiso en Google antes de completar la conexión.",
  missing_params: "Google no devolvió los parámetros necesarios para cerrar la conexión.",
  invalid_or_expired_state: "La sesión de autorización expiró o ya fue consumida.",
  token_exchange_failed: "No se pudo intercambiar el código OAuth por un token válido.",
  no_refresh_token: "Google no devolvió un refresh token reusable para Calendar.",
  vault_storage_failed: "No se pudo guardar el token seguro de Google en el backend.",
};

export function isGoogleCalendarConnected(
  profile: GoogleConnectionSnapshot | null | undefined,
): boolean {
  return Boolean(profile?.google_token_vault_id);
}

export function buildGoogleAuthCallbackBanner(
  params: GoogleAuthCallbackParams,
  connected: boolean,
): GoogleAuthCallbackBanner {
  const status = getSingleQueryValue(params.google_auth);
  const reason = getSingleQueryValue(params.reason);

  if (status === "success") {
    if (connected) {
      return {
        tone: "success",
        title: "Google Calendar conectado",
        description: "El dashboard ya refleja el estado real de tu perfil en Supabase.",
      };
    }

    return {
      tone: "warning",
      title: "Autorización recibida",
      description: "El redirect volvió correctamente, pero tu perfil aún no refleja la conexión de Google Calendar.",
    };
  }

  if (status === "error") {
    return {
      tone: "error",
      title: "No se pudo completar la conexión",
      description: reason
        ? (GOOGLE_AUTH_ERROR_MESSAGES[reason] ?? `La conexión falló con el motivo: ${reason}.`)
        : "La conexión con Google Calendar no se pudo completar.",
    };
  }

  return {
    tone: "idle",
    title: null,
    description: null,
  };
}

export function buildGoogleConnectContractUrl(
  apiUrl: string,
  accessToken: string,
): string {
  const normalizedApiUrl = apiUrl.trim();
  const normalizedAccessToken = accessToken.trim();

  if (!normalizedApiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required to start Google OAuth.");
  }

  if (!normalizedAccessToken) {
    throw new Error("A valid Supabase access token is required.");
  }

  const connectUrl = new URL("/auth/google/connect", `${normalizedApiUrl}/`);
  connectUrl.searchParams.set("token", normalizedAccessToken);
  return connectUrl.toString();
}

function getSingleQueryValue(
  value: string | string[] | null | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}