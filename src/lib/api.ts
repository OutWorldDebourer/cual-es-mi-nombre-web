/**
 * Backend API Client — "Cuál es mi nombre" Web
 *
 * Centralized, typed client for all calls to the Python backend (Railway).
 * Automatically includes JWT auth from the Supabase session.
 *
 * Design principles:
 * - Single source of truth for API_URL and auth headers
 * - Typed request/response for each endpoint
 * - Consistent error handling (throws ApiError)
 * - Reusable across all dashboard pages (Settings, Notes, Reminders, etc.)
 *
 * Usage:
 *   import { backendApi } from "@/lib/api";
 *   const api = backendApi(supabaseClient);
 *   const result = await api.whatsapp.sendCode("+51999888777");
 *
 * @module lib/api
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CheckoutPreferenceResponse,
  PlansListResponse,
} from "@/types/database";

// ── Configuration ──────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ── Error type ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

// ── Types — WhatsApp Verification ──────────────────────────────────────────

export interface VerifyResponse {
  status: string;
  message: string;
}

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Get the current session's access token, or throw if expired/missing.
 */
async function getAccessToken(
  supabase: SupabaseClient,
): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new ApiError(401, "Sesión expirada. Recarga la página.");
  }

  return session.access_token;
}

/**
 * Execute a fetch to the backend with JWT auth and JSON content type.
 * Throws ApiError on non-2xx responses.
 */
async function authFetch<T>(
  supabase: SupabaseClient,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken(supabase);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = `Error ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // response body wasn't JSON — keep the generic message
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

// ── WhatsApp Verification API ──────────────────────────────────────────────

function whatsappApi(supabase: SupabaseClient) {
  return {
    /**
     * POST /auth/verify-whatsapp/send-code
     * Sends a 6-digit verification code to the given phone number via WhatsApp.
     */
    async sendCode(phoneNumber: string): Promise<VerifyResponse> {
      return authFetch<VerifyResponse>(
        supabase,
        "/auth/verify-whatsapp/send-code",
        {
          method: "POST",
          body: JSON.stringify({ phone_number: phoneNumber }),
        },
      );
    },

    /**
     * POST /auth/verify-whatsapp/confirm
     * Confirms the 6-digit verification code and links the WhatsApp number.
     */
    async confirmCode(code: string): Promise<VerifyResponse> {
      return authFetch<VerifyResponse>(
        supabase,
        "/auth/verify-whatsapp/confirm",
        {
          method: "POST",
          body: JSON.stringify({ code }),
        },
      );
    },
  };
}

// ── Google Calendar API ────────────────────────────────────────────────────

function googleApi(supabase: SupabaseClient) {
  return {
    /**
     * Build the OAuth2 connect URL for Google Calendar.
     * This redirects the browser — doesn't use fetch.
     */
    async getConnectUrl(): Promise<string> {
      const token = await getAccessToken(supabase);
      return `${API_URL}/auth/google/connect?token=${token}`;
    },
  };
}

// ── Payments / Checkout API (Step 9) ───────────────────────────────────────

/**
 * Fetch the public plan catalog — no auth needed.
 */
export async function getPlans(): Promise<PlansListResponse> {
  const res = await fetch(`${API_URL}/api/plans`);
  if (!res.ok) {
    throw new ApiError(res.status, "Error al obtener planes.");
  }
  return res.json() as Promise<PlansListResponse>;
}

function paymentsApi(supabase: SupabaseClient) {
  return {
    /**
     * POST /api/checkout/create-preference
     * Creates a MercadoPago Checkout Pro preference for the given plan.
     * Returns { init_point, preference_id }.
     */
    async createPreference(
      plan: string,
    ): Promise<CheckoutPreferenceResponse> {
      return authFetch<CheckoutPreferenceResponse>(
        supabase,
        "/api/checkout/create-preference",
        {
          method: "POST",
          body: JSON.stringify({ plan }),
        },
      );
    },
  };
}

// ── Factory ────────────────────────────────────────────────────────────────

/**
 * Create a typed backend API client bound to the current Supabase session.
 *
 * @example
 * ```tsx
 * const supabase = createClient();
 * const api = backendApi(supabase);
 * await api.whatsapp.sendCode("+51999888777");
 * ```
 */
export function backendApi(supabase: SupabaseClient) {
  return {
    whatsapp: whatsappApi(supabase),
    google: googleApi(supabase),
    payments: paymentsApi(supabase),
  };
}
