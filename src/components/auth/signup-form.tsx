/**
 * SignupForm — Multi-step phone registration with Supabase OTP
 *
 * State machine:
 *   PHONE_PASSWORD → checkStatus() → signUp() → VERIFY_OTP → verifyOtp() → redirect /dashboard
 *                  ↘ (existing user) → existingUser banner
 *
 * Pre-signup check: calls ``POST /auth/phone/check-status`` before
 * ``supabase.auth.signUp()`` to detect WA-first users and prevent
 * unnecessary OTP dispatch.
 *
 * @module components/auth/signup-form
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { phoneAuthApi } from "@/lib/api";
import type { CheckPhoneStatusResponse } from "@/lib/api";
import { PhoneInput } from "@/components/auth/phone-input";
import { OTPInput, useOTPTimer } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { PasswordStrength } from "@/components/auth/password-strength";
import { StepIndicator } from "@/components/auth/step-indicator";
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

/**
 * WhatsApp bot phone number for the "message first" deeplink.
 * Read from public env; fall back to a hardcoded constant if missing.
 * TODO: set ``NEXT_PUBLIC_WA_BOT_NUMBER`` in Vercel env to avoid this fallback.
 */
const WHATSAPP_BOT_NUMBER = process.env.NEXT_PUBLIC_WA_BOT_NUMBER ?? "51942961598";

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

/**
 * Structured signup error. The ``kind: "window_closed"`` variant is produced
 * when the backend ``POST /hooks/sms`` returns the sentinel
 * ``WA_WINDOW_CLOSED`` — it indicates the user has no open 24h WhatsApp
 * conversation window with the bot and must message it first before we can
 * deliver the OTP.
 */
type SignupError =
  | { kind: "window_closed" }
  | { kind: "generic"; message: string };

/**
 * Map Supabase error messages to a structured SignupError.
 * Supabase Auth error messages are in English — we translate the most common
 * and detect the ``WA_WINDOW_CLOSED`` sentinel coming from our SMS Hook.
 */
function mapSignupError(message: string): SignupError {
  const lower = message.toLowerCase();

  // Sentinel forwarded from src/api/routes/sms_hook.py on window_closed.
  // Supabase wraps our body inside ``unexpected_failure``/``sms_send_failed``
  // but preserves the ``message`` string — match case-insensitively.
  if (lower.includes("wa_window_closed")) {
    return { kind: "window_closed" };
  }

  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return { kind: "generic", message: "Este número de teléfono ya tiene una cuenta. Intenta iniciar sesión." };
  }
  if (lower.includes("phone") && lower.includes("invalid")) {
    return { kind: "generic", message: "Número de teléfono inválido. Verifica el formato." };
  }
  if (lower.includes("password") && lower.includes("short")) {
    return { kind: "generic", message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.` };
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return { kind: "generic", message: "Demasiados intentos. Espera unos minutos antes de intentar de nuevo." };
  }
  if (lower.includes("sms") || lower.includes("hook")) {
    return { kind: "generic", message: "No se pudo enviar el código de verificación. Intenta de nuevo." };
  }

  return { kind: "generic", message };
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

const SIGNUP_STEPS = [
  { label: "Datos" },
  { label: "Verificación" },
];

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
  const [windowClosed, setWindowClosed] = useState(false);
  const [existingAction, setExistingAction] = useState<CheckPhoneStatusResponse["action"] | null>(null);
  const [existingChannel, setExistingChannel] = useState<string | null>(null);

  // --- OTP timer (starts when step transitions to verify_otp) ---
  const timer = useOTPTimer({
    initialSeconds: OTP_TIMER_SECONDS,
    autoStart: false,
  });

  // --- Phone change handler ---
  const handlePhoneChange = useCallback((e164: string) => {
    setPhone(e164);
  }, []);

  /**
   * Apply a SignupError: toggle the ``windowClosed`` banner OR set the
   * generic error message. Centralised so both signUp() and resend paths
   * use the same mapping without duplicating logic.
   */
  const applySignupError = useCallback((message: string) => {
    const mapped = mapSignupError(message);
    if (mapped.kind === "window_closed") {
      setWindowClosed(true);
      setError(null);
      return;
    }
    setError(mapped.message);
  }, []);

  // --- Step 1: Submit phone + password ---
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWindowClosed(false);

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
      // ── Pre-check: is this phone already registered? ─────────────
      // Calls backend BEFORE supabase.auth.signUp() to prevent
      // unnecessary OTP dispatch via SMS Hook to existing users.
      const phoneStatus = await phoneAuthApi.checkStatus(phone);

      if (phoneStatus.action !== "signup") {
        setExistingUser(true);
        setExistingAction(phoneStatus.action);
        setExistingChannel(phoneStatus.channel_origin);
        return;
      }

      // ── Phone is available — proceed with Supabase signup ────────
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: { channel_origin: "web" },
        },
      });

      if (authError) {
        applySignupError(authError.message);
        return;
      }

      // Fallback: detect existing user via Supabase identities array
      // (safety net in case check-status and auth.users are briefly out of sync)
      if (data?.user?.identities?.length === 0) {
        setExistingUser(true);
        setExistingAction("login");
        setExistingChannel(null);
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
        applySignupError(resendError.message);
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
  // Render — 24h WhatsApp window closed (new user has not messaged the bot)
  // =========================================================================

  if (windowClosed) {
    const waHref = `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=Hola`;

    async function handleRetryAfterWhatsApp() {
      setWindowClosed(false);
      setError(null);
      // Re-submit with current phone/password state. We synthesize a minimal
      // event so handleSignup runs its full validation + signUp path.
      await handleSignup({ preventDefault: () => {} } as React.FormEvent);
    }

    return (
      <div className="space-y-4 animate-[fade-in-up_0.3s_ease-out_both]">
        <div className="rounded-md bg-accent/10 border border-accent/20 p-4 text-sm space-y-2">
          <p className="font-medium text-foreground">Un paso antes de registrarte</p>
          <p className="text-muted-foreground">
            Para enviarte el código por WhatsApp, primero necesitamos que nos escribas.
            Envía la palabra <span className="font-semibold">Hola</span> a nuestro
            asistente, espera unos segundos a que responda, y luego vuelve aquí para
            continuar.
          </p>
        </div>

        <Button asChild className="w-full">
          <a href={waHref} target="_blank" rel="noopener noreferrer">
            Abrir WhatsApp y escribir &ldquo;Hola&rdquo;
          </a>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleRetryAfterWhatsApp}
          disabled={loading}
          loading={loading}
        >
          Ya lo envié, intentar de nuevo
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setWindowClosed(false);
            setError(null);
          }}
        >
          Usar otro número
        </Button>
      </div>
    );
  }

  // =========================================================================
  // Render — Existing user detected
  // =========================================================================

  if (existingUser) {
    const setPasswordHref = `/set-password?phone=${encodeURIComponent(phone)}&from=signup`;
    const isWaFirst = existingChannel === "whatsapp";
    const needsPassword = existingAction === "set_password";

    return (
      <div className="space-y-4">
        <div className="rounded-md bg-success/10 border border-success/20 p-4 text-sm space-y-2 animate-[fade-in-up_0.3s_ease-out_both]">
          <p className="font-medium text-success">
            {needsPassword
              ? "Tu asistente de WhatsApp ya está activo"
              : "Este número ya tiene una cuenta"}
          </p>
          <p className="text-success/80">
            {needsPassword
              ? "Tu asistente de WhatsApp ya está activo con este número. Para acceder desde la web, necesitas crear una contraseña."
              : isWaFirst
                ? "Ya tienes una cuenta con este número. Inicia sesión o recupera tu contraseña."
                : "Ya existe una cuenta registrada con este número. Inicia sesión o recupera tu contraseña."}
          </p>
        </div>

        {needsPassword && (
          <Button asChild className="w-full">
            <Link href={setPasswordHref}>Crear contraseña para la web</Link>
          </Button>
        )}

        {!needsPassword && (
          <Button asChild className="w-full">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        )}

        <div className="flex gap-2">
          {needsPassword && (
            <Button asChild variant="outline" className="flex-1">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          )}
          <Button asChild variant="outline" className={needsPassword ? "flex-1" : "w-full"}>
            <Link href="/recovery">Recuperar contraseña</Link>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setExistingUser(false);
            setExistingAction(null);
            setExistingChannel(null);
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
        <StepIndicator steps={SIGNUP_STEPS} currentStep={0} />
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
          <PasswordStrength password={password} />
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

        <FormError message={error} />

        <Button type="submit" className="w-full" disabled={loading} loading={loading}>
          {loading ? "Verificando..." : "Crear cuenta"}
        </Button>
      </form>
    );
  }

  // =========================================================================
  // Render — Step 2: OTP Verification
  // =========================================================================

  const canResend = !timer.isActive && !resending;

  return (
    <div className="space-y-6 animate-[slide-in-right_0.3s_ease-out_both]">
      <StepIndicator steps={SIGNUP_STEPS} currentStep={1} />

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

      <FormError message={error} />

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
          loading={loading}
          onClick={() => handleVerifyOtp()}
        >
          {loading ? "Verificando..." : "Verificar código"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={!canResend || loading}
          loading={resending}
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
