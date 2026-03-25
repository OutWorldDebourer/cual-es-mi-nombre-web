/**
 * RecoveryForm — Multi-step phone-based password recovery / set-password
 *
 * State machine (3 steps):
 *   PHONE → request-otp → OTP → verify + set/reset password → SUCCESS → redirect /login
 *
 * Two modes via `purpose` prop:
 *   - "recovery": user forgot password → reset-password endpoint
 *   - "set_password": WA-first user → set-password endpoint
 *
 * Calls the **backend Python API** (not Supabase JS client) because
 * Supabase does not natively support phone-based password recovery.
 *
 * @module components/auth/recovery-form
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PhoneInput } from "@/components/auth/phone-input";
import { OTPInput, useOTPTimer } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { PasswordStrength } from "@/components/auth/password-strength";
import { StepIndicator } from "@/components/auth/step-indicator";
import { isValidE164 } from "@/lib/phone-utils";
import { phoneAuthApi, ApiError } from "@/lib/api";
import type { PhoneAuthPurpose } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RecoveryStep = "phone" | "otp" | "new_password";

export interface RecoveryFormProps {
  /** Flow purpose — determines backend endpoint and UI copy */
  purpose: PhoneAuthPurpose;
  /** Pre-fill the phone field (e.g. when redirected from signup) */
  initialPhone?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** OTP expiry in seconds — matches backend OTP_TTL_SECONDS (300s = 5 min) */
const OTP_TIMER_SECONDS = 300;

/** Minimum password length — matches backend PASSWORD_MIN_LENGTH */
const PASSWORD_MIN_LENGTH = 6;

// ---------------------------------------------------------------------------
// UI copy per purpose
// ---------------------------------------------------------------------------

const COPY: Record<PhoneAuthPurpose, {
  phoneTitle: string;
  phoneDescription: string;
  phoneButton: string;
  otpTitle: string;
  otpDescription: string;
  passwordTitle: string;
  passwordDescription: string;
  passwordButton: string;
  successMessage: string;
}> = {
  recovery: {
    phoneTitle: "Recuperar Contraseña",
    phoneDescription: "Ingresa tu número de WhatsApp para recibir un código de verificación.",
    phoneButton: "Enviar código",
    otpTitle: "Código de verificación",
    otpDescription: "Ingresa el código de 6 dígitos enviado a tu WhatsApp.",
    passwordTitle: "Nueva contraseña",
    passwordDescription: "Ingresa tu nueva contraseña.",
    passwordButton: "Cambiar contraseña",
    successMessage: "Contraseña actualizada. Ahora puedes iniciar sesión.",
  },
  set_password: {
    phoneTitle: "Crear Contraseña",
    phoneDescription: "Ingresa tu número de WhatsApp para recibir un código de verificación.",
    phoneButton: "Enviar código",
    otpTitle: "Código de verificación",
    otpDescription: "Ingresa el código de 6 dígitos enviado a tu WhatsApp.",
    passwordTitle: "Crear contraseña",
    passwordDescription: "Crea una contraseña para acceder desde la web.",
    passwordButton: "Crear contraseña",
    successMessage: "Contraseña creada. Ahora puedes iniciar sesión.",
  },
};

// ---------------------------------------------------------------------------
// Error mapping — backend English → Spanish UX
// ---------------------------------------------------------------------------

function mapRequestOtpError(status: number, detail: string): string {
  if (status === 404) {
    return "No existe una cuenta con este número de teléfono.";
  }
  if (status === 400 && detail.toLowerCase().includes("does not have a password")) {
    return "Esta cuenta no tiene contraseña. Usa el flujo de crear contraseña.";
  }
  if (status === 409) {
    return "Esta cuenta ya tiene contraseña. Usa el inicio de sesión o recuperación.";
  }
  if (status === 429) {
    return "Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo.";
  }
  if (status === 502) {
    return "No se pudo enviar el código por WhatsApp. Intenta de nuevo.";
  }
  if (status === 503) {
    return detail || "Para recibir el código, primero envía un mensaje al asistente por WhatsApp y luego vuelve a intentarlo.";
  }
  return "Error inesperado. Intenta de nuevo.";
}

function mapPasswordError(status: number, detail: string): string {
  if (status === 400 && detail.toLowerCase().includes("incorrect")) {
    return "Código de verificación incorrecto.";
  }
  if (status === 404) {
    return "No existe una cuenta con este número de teléfono.";
  }
  if (status === 409) {
    return "Esta cuenta ya tiene contraseña. Usa el inicio de sesión o recuperación.";
  }
  if (status === 410) {
    return "El código ha expirado. Solicita uno nuevo.";
  }
  if (status === 429) {
    return "Demasiados intentos. Tu cuenta está bloqueada temporalmente.";
  }
  if (status === 500) {
    return "Error al guardar la contraseña. Intenta de nuevo.";
  }
  return "Error inesperado. Intenta de nuevo.";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const RECOVERY_STEPS = [
  { label: "Teléfono" },
  { label: "Código" },
  { label: "Contraseña" },
];

export function RecoveryForm({ purpose, initialPhone }: RecoveryFormProps) {
  const router = useRouter();
  const copy = COPY[purpose];

  // --- Form fields ---
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- UI state ---
  const [step, setStep] = useState<RecoveryStep>("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- OTP timer ---
  const timer = useOTPTimer({
    initialSeconds: OTP_TIMER_SECONDS,
    autoStart: false,
  });

  // --- Phone change handler ---
  const handlePhoneChange = useCallback((e164: string) => {
    setPhone(e164);
  }, []);

  // --- Step 1: Request OTP ---
  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidE164(phone)) {
      setError("Ingresa un número de teléfono válido.");
      return;
    }

    setLoading(true);

    try {
      await phoneAuthApi.requestOtp(phone, purpose);
      setStep("otp");
      timer.restart();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapRequestOtpError(err.status, err.detail));
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  // --- Step 2: OTP entered → move to password step ---
  function handleOtpComplete(code: string) {
    setOtp(code);
    setError(null);
    setStep("new_password");
  }

  // --- Step 3: Set/Reset password ---
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

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
      if (purpose === "recovery") {
        await phoneAuthApi.resetPassword(phone, otp, password);
      } else {
        await phoneAuthApi.setPassword(phone, otp, password);
      }
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapPasswordError(err.status, err.detail));
        // If OTP expired or invalid, go back to OTP step
        if (err.status === 410 || (err.status === 400 && err.detail.toLowerCase().includes("incorrect"))) {
          setStep("otp");
          setOtp("");
        }
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  // --- Resend OTP ---
  async function handleResend() {
    setError(null);
    setLoading(true);

    try {
      await phoneAuthApi.requestOtp(phone, purpose);
      setOtp("");
      timer.restart();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapRequestOtpError(err.status, err.detail));
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  // --- Back to phone step ---
  function handleBackToPhone() {
    setStep("phone");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }

  // --- Success view ---
  if (success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{copy.successMessage}</p>
        <Button className="w-full" onClick={() => router.push("/login")}>
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  // --- Step index for progress indicator ---
  const stepIndex = step === "phone" ? 0 : step === "otp" ? 1 : 2;

  // --- Step: PHONE ---
  if (step === "phone") {
    return (
      <form onSubmit={handleRequestOtp} className="space-y-4">
        <StepIndicator steps={RECOVERY_STEPS} currentStep={stepIndex} />
        <p className="text-sm text-muted-foreground">{copy.phoneDescription}</p>

        <div className="space-y-2">
          <Label htmlFor="recovery-phone">Número de WhatsApp</Label>
          <PhoneInput
            id="recovery-phone"
            value={phone}
            onChange={handlePhoneChange}
            disabled={loading}
            aria-invalid={!!error}
          />
        </div>

        <FormError message={error} />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : copy.phoneButton}
        </Button>
      </form>
    );
  }

  // --- Step: OTP ---
  if (step === "otp") {
    return (
      <div className="space-y-4 animate-[slide-in-right_0.3s_ease-out_both]">
        <StepIndicator steps={RECOVERY_STEPS} currentStep={stepIndex} />
        <p className="text-sm text-muted-foreground">{copy.otpDescription}</p>

        <div className="flex justify-center">
          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={handleOtpComplete}
            disabled={loading}
            autoFocus
            aria-invalid={!!error}
          />
        </div>

        {timer.isActive && (
          <p className="text-center text-xs text-muted-foreground">
            Código válido por {timer.formatTime()}
          </p>
        )}

        <FormError message={error} />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleBackToPhone}
            disabled={loading}
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleResend}
            disabled={loading || timer.isActive}
          >
            Reenviar código
          </Button>
        </div>
      </div>
    );
  }

  // --- Step: NEW_PASSWORD ---
  return (
    <form onSubmit={handleSetPassword} className="space-y-4 animate-[slide-in-right_0.3s_ease-out_both]">
      <StepIndicator steps={RECOVERY_STEPS} currentStep={stepIndex} />
      <p className="text-sm text-muted-foreground">{copy.passwordDescription}</p>

      <div className="space-y-2">
        <Label htmlFor="recovery-password">Nueva contraseña</Label>
        <Input
          id="recovery-password"
          type="password"
          placeholder="••••••••"
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
        <Label htmlFor="recovery-confirm-password">Confirmar contraseña</Label>
        <Input
          id="recovery-confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          disabled={loading}
        />
      </div>

      <FormError message={error} />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : copy.passwordButton}
      </Button>
    </form>
  );
}
