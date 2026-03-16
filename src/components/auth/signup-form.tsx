/**
 * SignupForm — Multi-step phone registration with Supabase OTP
 *
 * State machine:
 *   PHONE_PASSWORD → signUp() → VERIFY_OTP → verifyOtp() → redirect /dashboard
 *
 * Uses Supabase Auth native phone signup. OTP delivery is handled
 * transparently by the SMS Hook (A8.1.2) → WhatsApp.
 *
 * @module components/auth/signup-form
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PhoneInput } from "@/components/auth/phone-input";
import { OTPInput, useOTPTimer } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidE164 } from "@/lib/phone-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SignupStep = "phone_password" | "verify_otp";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** OTP expiry in seconds — matches backend OTP_TTL_SECONDS (300s = 5 min) */
const OTP_TIMER_SECONDS = 300;

/** Minimum password length — matches backend PASSWORD_MIN_LENGTH */
const PASSWORD_MIN_LENGTH = 6;

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Map Supabase error messages to user-friendly Spanish strings.
 * Supabase Auth error messages are in English — we translate the most common.
 */
function mapSignupError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "Este número de teléfono ya tiene una cuenta. Intenta iniciar sesión.";
  }
  if (lower.includes("phone") && lower.includes("invalid")) {
    return "Número de teléfono inválido. Verifica el formato.";
  }
  if (lower.includes("password") && lower.includes("short")) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Demasiados intentos. Espera unos minutos antes de intentar de nuevo.";
  }
  if (lower.includes("sms") || lower.includes("hook")) {
    return "No se pudo enviar el código de verificación. Intenta de nuevo.";
  }

  return message;
}

function mapVerifyError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("token has expired") || lower.includes("otp_expired")) {
    return "El código ha expirado. Solicita uno nuevo.";
  }
  if (lower.includes("invalid") || lower.includes("otp")) {
    return "Código incorrecto. Verifica e intenta de nuevo.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Demasiados intentos. Espera unos minutos.";
  }

  return message;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SignupForm() {
  const router = useRouter();

  // --- Step state ---
  const [step, setStep] = useState<SignupStep>("phone_password");

  // --- Form fields ---
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  // --- UI state ---
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [existingUser, setExistingUser] = useState(false);

  // --- OTP timer (starts when step transitions to verify_otp) ---
  const timer = useOTPTimer({
    initialSeconds: OTP_TIMER_SECONDS,
    autoStart: false,
  });

  // --- Phone change handler ---
  const handlePhoneChange = useCallback((e164: string) => {
    setPhone(e164);
  }, []);

  // --- Step 1: Submit phone + password ---
  async function handleSignup(e: React.FormEvent) {
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

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: { channel_origin: "web" },
        },
      });

      if (authError) {
        setError(mapSignupError(authError.message));
        return;
      }

      // Detect existing user (WA-first or previous signup with confirmed phone).
      // Supabase returns user with empty identities array for repeated signups
      // of already-confirmed users — no OTP is sent in this case.
      if (data?.user?.identities?.length === 0) {
        setExistingUser(true);
        return;
      }

      // Success — transition to OTP verification
      setStep("verify_otp");
      timer.restart();
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // --- Step 2: Verify OTP ---
  async function handleVerifyOtp(code?: string) {
    const otpCode = code ?? otp;
    if (otpCode.length !== 6) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otpCode,
        type: "sms",
      });

      if (verifyError) {
        setError(mapVerifyError(verifyError.message));
        return;
      }

      // OTP verified — session created, redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // --- Resend OTP (re-call signUp — Supabase generates new OTP) ---
  async function handleResend() {
    setError(null);
    setResending(true);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: { channel_origin: "web" },
        },
      });

      if (resendError) {
        setError(mapSignupError(resendError.message));
        return;
      }

      // Reset OTP input and restart timer
      setOtp("");
      timer.restart();
    } catch {
      setError("No se pudo reenviar el código. Intenta de nuevo.");
    } finally {
      setResending(false);
    }
  }

  // --- Go back to phone/password step ---
  function handleBack() {
    setStep("phone_password");
    setOtp("");
    setError(null);
  }

  // =========================================================================
  // Render — Existing user detected (WA-first)
  // =========================================================================

  if (existingUser) {
    const setPasswordHref = `/set-password?phone=${encodeURIComponent(phone)}&from=signup`;

    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 text-sm space-y-2">
          <p className="font-medium text-green-900 dark:text-green-100">
            Tu asistente de WhatsApp ya está activo
          </p>
          <p className="text-green-800 dark:text-green-200">
            Tu asistente de WhatsApp ya está activo con este número.
            Para acceder desde la web, necesitas crear una contraseña.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href={setPasswordHref}>Crear contraseña para la web</Link>
        </Button>

        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/recovery">Recuperar contraseña</Link>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setExistingUser(false);
            setError(null);
          }}
        >
          Usar otro número
        </Button>
      </div>
    );
  }

  // =========================================================================
  // Render — Step 1: Phone + Password
  // =========================================================================

  if (step === "phone_password") {
    return (
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Número de WhatsApp</Label>
          <PhoneInput
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            disabled={loading}
            aria-invalid={!!error}
          />
          <p className="text-xs text-muted-foreground">
            Recibirás un código de verificación por WhatsApp.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">Contraseña</Label>
          <Input
            id="signup-password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-confirm-password">Confirmar contraseña</Label>
          <Input
            id="signup-confirm-password"
            type="password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
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
          {loading ? "Enviando código..." : "Crear cuenta"}
        </Button>
      </form>
    );
  }

  // =========================================================================
  // Render — Step 2: OTP Verification
  // =========================================================================

  const canResend = !timer.isActive && !resending;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Enviamos un código de verificación a tu WhatsApp
        </p>
        <p className="text-sm font-medium">{phone}</p>
      </div>

      <div className="flex justify-center">
        <OTPInput
          value={otp}
          onChange={setOtp}
          onComplete={handleVerifyOtp}
          autoFocus
          disabled={loading}
          aria-invalid={!!error}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Timer & resend */}
      <div className="text-center text-sm text-muted-foreground">
        {timer.isActive ? (
          <p>El código expira en {timer.formatTime()}</p>
        ) : (
          <p>El código ha expirado.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          className="w-full"
          disabled={loading || otp.length !== 6}
          onClick={() => handleVerifyOtp()}
        >
          {loading ? "Verificando..." : "Verificar código"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={!canResend || loading}
          onClick={handleResend}
        >
          {resending ? "Reenviando..." : "Reenviar código"}
        </Button>
      </div>

      <button
        type="button"
        onClick={handleBack}
        disabled={loading}
        className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Cambiar número de teléfono
      </button>
    </div>
  );
}
