/**
 * RecoveryForm Tests — "Cuál es mi nombre" Web
 *
 * Tests for the phone-based password recovery and set-password flows:
 *   Phone → request-otp → OTP → set/reset password → success
 *
 * Mocks the phoneAuthApi (backend Python API) since these are
 * pre-authentication endpoints (no Supabase JS client).
 *
 * @module __tests__/auth/recovery-form.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { phoneAuthApi, ApiError } from "@/lib/api";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/recovery",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...original,
    phoneAuthApi: {
      requestOtp: vi.fn(),
      setPassword: vi.fn(),
      resetPassword: vi.fn(),
    },
  };
});

const mockRequestOtp = phoneAuthApi.requestOtp as ReturnType<typeof vi.fn>;
const mockSetPassword = phoneAuthApi.setPassword as ReturnType<typeof vi.fn>;
const mockResetPassword = phoneAuthApi.resetPassword as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockRequestOtp.mockResolvedValue({ status: "ok", message: "OTP sent" });
  mockSetPassword.mockResolvedValue({ status: "ok", message: "Password set" });
  mockResetPassword.mockResolvedValue({ status: "ok", message: "Password reset" });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function typePhone(user: ReturnType<typeof userEvent.setup>, digits: string) {
  const telInput = screen.getByLabelText("Número de WhatsApp");
  await user.type(telInput, digits);
}

async function submitPhone(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Enviar código" }));
}

async function goToOtpStep(user: ReturnType<typeof userEvent.setup>) {
  await typePhone(user, "999888777");
  await submitPhone(user);
  await waitFor(() => {
    expect(
      screen.getByText("Ingresa el código de 6 dígitos enviado a tu WhatsApp."),
    ).toBeInTheDocument();
  });
}

async function typeOtp(user: ReturnType<typeof userEvent.setup>, code: string) {
  const inputs = screen.getAllByRole("textbox");
  for (let i = 0; i < code.length; i++) {
    await user.type(inputs[i], code[i]);
  }
}

async function goToPasswordStep(user: ReturnType<typeof userEvent.setup>) {
  await goToOtpStep(user);
  await typeOtp(user, "123456");
  await waitFor(() => {
    expect(screen.getByLabelText("Nueva contraseña")).toBeInTheDocument();
  });
}

// ---------------------------------------------------------------------------
// Rendering — Recovery mode
// ---------------------------------------------------------------------------

describe("RecoveryForm — Rendering (recovery)", () => {
  it("renders phone input and submit button", () => {
    render(<RecoveryForm purpose="recovery" />);
    expect(screen.getByLabelText("Número de WhatsApp")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar código" })).toBeInTheDocument();
  });

  it("shows recovery description text", () => {
    render(<RecoveryForm purpose="recovery" />);
    expect(
      screen.getByText("Ingresa tu número de WhatsApp para recibir un código de verificación."),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Rendering — Set password mode
// ---------------------------------------------------------------------------

describe("RecoveryForm — Rendering (set_password)", () => {
  it("shows set-password description text", () => {
    render(<RecoveryForm purpose="set_password" />);
    expect(
      screen.getByText("Ingresa tu número de WhatsApp para recibir un código de verificación."),
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Validation — Phone step
// ---------------------------------------------------------------------------

describe("RecoveryForm — Phone validation", () => {
  it("shows error when phone is empty/invalid", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await submitPhone(user);

    expect(screen.getByText("Ingresa un número de teléfono válido.")).toBeInTheDocument();
    expect(mockRequestOtp).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Step 1: Request OTP
// ---------------------------------------------------------------------------

describe("RecoveryForm — Request OTP", () => {
  it("calls requestOtp with phone and purpose", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await typePhone(user, "999888777");
    await submitPhone(user);

    await waitFor(() => {
      expect(mockRequestOtp).toHaveBeenCalledWith("+51999888777", "recovery");
    });
  });

  it("transitions to OTP step on success", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToOtpStep(user);

    expect(screen.getByText("Ingresa el código de 6 dígitos enviado a tu WhatsApp.")).toBeInTheDocument();
  });

  it("shows loading state while requesting", async () => {
    mockRequestOtp.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await typePhone(user, "999888777");
    await submitPhone(user);

    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
  });

  it("shows error for 404 (user not found)", async () => {
    mockRequestOtp.mockRejectedValueOnce(new ApiError(404, "No account found"));

    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await typePhone(user, "999888777");
    await submitPhone(user);

    await waitFor(() => {
      expect(
        screen.getByText("No existe una cuenta con este número de teléfono."),
      ).toBeInTheDocument();
    });
  });

  it("shows error for 409 (already has password) in set_password mode", async () => {
    mockRequestOtp.mockRejectedValueOnce(
      new ApiError(409, "This account already has a password."),
    );

    const user = userEvent.setup();
    render(<RecoveryForm purpose="set_password" />);

    await typePhone(user, "999888777");
    await submitPhone(user);

    await waitFor(() => {
      expect(
        screen.getByText("Esta cuenta ya tiene contraseña. Usa el inicio de sesión o recuperación."),
      ).toBeInTheDocument();
    });
  });

  it("shows error for 429 (rate limited)", async () => {
    mockRequestOtp.mockRejectedValueOnce(
      new ApiError(429, "Too many OTP requests"),
    );

    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await typePhone(user, "999888777");
    await submitPhone(user);

    await waitFor(() => {
      expect(
        screen.getByText("Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo."),
      ).toBeInTheDocument();
    });
  });

  it("shows error for 502 (delivery failed)", async () => {
    mockRequestOtp.mockRejectedValueOnce(
      new ApiError(502, "Failed to send OTP"),
    );

    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await typePhone(user, "999888777");
    await submitPhone(user);

    await waitFor(() => {
      expect(
        screen.getByText("No se pudo enviar el código por WhatsApp. Intenta de nuevo."),
      ).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Step 2: OTP verification
// ---------------------------------------------------------------------------

describe("RecoveryForm — OTP step", () => {
  it("shows timer after requesting OTP", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToOtpStep(user);

    expect(screen.getByText(/Código válido por/)).toBeInTheDocument();
  });

  it("allows going back to phone step", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToOtpStep(user);
    await user.click(screen.getByRole("button", { name: "Volver" }));

    expect(screen.getByLabelText("Número de WhatsApp")).toBeInTheDocument();
  });

  it("transitions to password step when OTP is complete", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);

    expect(screen.getByLabelText("Nueva contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Step 3: Set/Reset password
// ---------------------------------------------------------------------------

describe("RecoveryForm — Password step (recovery)", () => {
  it("shows error when password is too short", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "12345");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "12345");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    expect(
      screen.getByText("La contraseña debe tener al menos 6 caracteres."),
    ).toBeInTheDocument();
  });

  it("shows error when passwords don't match", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "password123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "different456");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
  });

  it("calls resetPassword for recovery purpose", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "newpassword123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith("+51999888777", "123456", "newpassword123");
    });
  });

  it("calls setPassword for set_password purpose", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="set_password" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "newpassword123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Crear contraseña" }));

    await waitFor(() => {
      expect(mockSetPassword).toHaveBeenCalledWith("+51999888777", "123456", "newpassword123");
    });
  });

  it("shows success message and login button on completion", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "newpassword123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    await waitFor(() => {
      expect(
        screen.getByText("Contraseña actualizada. Ahora puedes iniciar sesión."),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Ir a iniciar sesión" })).toBeInTheDocument();
  });

  it("redirects to /login when clicking success button", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "newpassword123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Ir a iniciar sesión" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Ir a iniciar sesión" }));
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("shows error for 410 (OTP expired) and goes back to OTP step", async () => {
    mockResetPassword.mockRejectedValueOnce(
      new ApiError(410, "Verification code has expired"),
    );

    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "newpassword123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    await waitFor(() => {
      expect(
        screen.getByText("El código ha expirado. Solicita uno nuevo."),
      ).toBeInTheDocument();
    });

    // Should go back to OTP step
    expect(screen.getByText("Ingresa el código de 6 dígitos enviado a tu WhatsApp.")).toBeInTheDocument();
  });

  it("shows error for 429 (locked out)", async () => {
    mockResetPassword.mockRejectedValueOnce(
      new ApiError(429, "Too many failed attempts"),
    );

    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "newpassword123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    await waitFor(() => {
      expect(
        screen.getByText("Demasiados intentos. Tu cuenta está bloqueada temporalmente."),
      ).toBeInTheDocument();
    });
  });

  it("shows loading state while saving password", async () => {
    mockResetPassword.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToPasswordStep(user);
    await user.type(screen.getByLabelText("Nueva contraseña"), "newpassword123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// initialPhone pre-fill
// ---------------------------------------------------------------------------

describe("RecoveryForm — initialPhone pre-fill", () => {
  it("pre-fills phone when initialPhone is provided", () => {
    render(<RecoveryForm purpose="set_password" initialPhone="+51999888777" />);
    const telInput = screen.getByLabelText("Número de WhatsApp") as HTMLInputElement;
    expect(telInput.value).toBe("999888777");
  });

  it("leaves phone empty when initialPhone is not provided", () => {
    render(<RecoveryForm purpose="set_password" />);
    const telInput = screen.getByLabelText("Número de WhatsApp") as HTMLInputElement;
    expect(telInput.value).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Resend OTP
// ---------------------------------------------------------------------------

describe("RecoveryForm — Resend OTP", () => {
  it("resend button is disabled while timer is active", async () => {
    const user = userEvent.setup();
    render(<RecoveryForm purpose="recovery" />);

    await goToOtpStep(user);

    expect(screen.getByRole("button", { name: "Reenviar código" })).toBeDisabled();
  });
});
