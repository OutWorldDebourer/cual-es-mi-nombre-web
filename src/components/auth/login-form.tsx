/**
 * LoginForm — Phone + password login with Supabase Auth
 *
 * Single-step form:
 *   Phone (E.164) + Password → signInWithPassword → redirect /dashboard
 *
 * No OTP step required — Supabase validates credentials directly
 * and creates a session on success.
 *
 * @module components/auth/login-form
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PhoneInput } from "@/components/auth/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidE164 } from "@/lib/phone-utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum password length — matches backend PASSWORD_MIN_LENGTH */
const PASSWORD_MIN_LENGTH = 6;

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Map Supabase signInWithPassword error messages to user-friendly Spanish.
 * Supabase returns English error messages — we translate the common ones.
 */
function mapLoginError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return "Teléfono o contraseña incorrectos.";
  }
  if (lower.includes("email logins are disabled")) {
    return "El inicio de sesión por correo electrónico está deshabilitado. Usa tu número de teléfono.";
  }
  if (lower.includes("phone not confirmed")) {
    return "Tu número de teléfono no ha sido verificado. Completa el registro primero.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Demasiados intentos. Espera unos minutos antes de intentar de nuevo.";
  }
  if (lower.includes("user not found")) {
    return "No existe una cuenta con este número. ¿Quieres registrarte?";
  }

  return message;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginForm() {
  const router = useRouter();

  // --- Form fields ---
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // --- UI state ---
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- Phone change handler ---
  const handlePhoneChange = useCallback((e164: string) => {
    setPhone(e164);
  }, []);

  // --- Submit handler ---
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!isValidE164(phone)) {
      setError("Ingresa un número de teléfono válido.");
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });

      if (authError) {
        setError(mapLoginError(authError.message));
        return;
      }

      // Session created — redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // --- Render ---
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-phone">Número de WhatsApp</Label>
        <PhoneInput
          id="login-phone"
          value={phone}
          onChange={handlePhoneChange}
          disabled={loading}
          aria-invalid={!!error}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Contraseña</Label>
          <Link
            href="/recovery"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
            tabIndex={-1}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          minLength={PASSWORD_MIN_LENGTH}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
