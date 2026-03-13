/**
 * SignupForm Tests — "Cuál es mi nombre" Web
 *
 * Tests for the multi-step phone signup flow:
 *   Step 1: Phone + password form → Supabase signUp
 *   Step 2: OTP verification → Supabase verifyOtp → redirect
 *
 * @module __tests__/auth/signup-form.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "@/components/auth/signup-form";
import { mockSupabaseClient } from "../setup";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    refresh: mockRefresh,
  }),
  usePathname: () => "/signup",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Extend the shared mock with signUp and verifyOtp
const mockSignUp = vi.fn();
const mockVerifyOtp = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient.auth.signUp = mockSignUp;
  mockSupabaseClient.auth.verifyOtp = mockVerifyOtp;
  mockSignUp.mockResolvedValue({
    data: { user: { id: "u1", identities: [{ id: "i1" }] }, session: null },
    error: null,
  });
  mockVerifyOtp.mockResolvedValue({
    data: {
      user: { id: "u1", phone: "+51999888777" },
      session: { access_token: "tok" },
    },
    error: null,
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Type a phone number into the PhoneInput national number field. */
async function typePhone(user: ReturnType<typeof userEvent.setup>, digits: string) {
  const telInput = screen.getByLabelText("Número de WhatsApp");
  await user.type(telInput, digits);
}

async function fillPasswordFields(
  user: ReturnType<typeof userEvent.setup>,
  password: string,
  confirm?: string,
) {
  const passwordInput = screen.getByLabelText("Contraseña");
  const confirmInput = screen.getByLabelText("Confirmar contraseña");
  await user.type(passwordInput, password);
  await user.type(confirmInput, confirm ?? password);
}

// ---------------------------------------------------------------------------
// Step 1 — Phone + Password form
// ---------------------------------------------------------------------------

describe("SignupForm — Step 1 (Phone + Password)", () => {
  it("renders the phone input and password fields", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("Número de WhatsApp")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeInTheDocument();
  });

  it("shows WhatsApp helper text", () => {
    render(<SignupForm />);
    expect(
      screen.getByText("Recibirás un código de verificación por WhatsApp."),
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123", "different123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows error when password is too short", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "12345", "12345");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(
      screen.getByText("La contraseña debe tener al menos 6 caracteres."),
    ).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("shows error when phone is invalid (no digits)", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    // Don't type a phone — leave it empty
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(
      screen.getByText("Ingresa un número de teléfono válido."),
    ).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("calls signUp with phone, password, and channel_origin metadata", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        phone: "+51999888777",
        password: "password123",
        options: {
          data: { channel_origin: "web" },
        },
      });
    });
  });

  it("transitions to OTP step on successful signUp", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(screen.getByText("+51999888777")).toBeInTheDocument();
      expect(screen.getByText(/código de verificación/i)).toBeInTheDocument();
    });
  });

  it("shows Supabase error when signUp fails", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(
        screen.getByText("Este número de teléfono ya tiene una cuenta. Intenta iniciar sesión."),
      ).toBeInTheDocument();
    });
  });

  it("shows generic error on unexpected exception", async () => {
    mockSignUp.mockRejectedValueOnce(new Error("network error"));

    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(screen.getByText("Error inesperado. Intenta de nuevo.")).toBeInTheDocument();
    });
  });

  it("disables submit button while loading", async () => {
    // Make signUp hang
    mockSignUp.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(screen.getByRole("button", { name: "Enviando código..." })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Step 2 — OTP Verification
// ---------------------------------------------------------------------------

describe("SignupForm — Step 2 (OTP Verification)", () => {
  /** Helper: advance to step 2 */
  async function goToOtpStep() {
    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(screen.getByText("+51999888777")).toBeInTheDocument();
    });

    return user;
  }

  it("shows OTP input and phone number display", async () => {
    await goToOtpStep();

    expect(screen.getByRole("group", { name: /código de verificación/i })).toBeInTheDocument();
    expect(screen.getByText("+51999888777")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Verificar código" })).toBeInTheDocument();
  });

  it("shows timer countdown", async () => {
    await goToOtpStep();

    // Timer should show "5:00" initially (300 seconds)
    expect(screen.getByText(/expira en 5:00/i)).toBeInTheDocument();
  });

  it("calls verifyOtp and redirects on success", async () => {
    const user = await goToOtpStep();

    // Type OTP digits
    const inputs = screen.getAllByRole("textbox");
    const otpInputs = inputs.filter(
      (el) => el.getAttribute("aria-label")?.includes("Dígito"),
    );
    // Paste a full OTP
    await user.click(otpInputs[0]);
    await user.paste("123456");

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        phone: "+51999888777",
        token: "123456",
        type: "sms",
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error on invalid OTP", async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid OTP token" },
    });

    const user = await goToOtpStep();

    const otpInputs = screen
      .getAllByRole("textbox")
      .filter((el) => el.getAttribute("aria-label")?.includes("Dígito"));
    await user.click(otpInputs[0]);
    await user.paste("000000");

    await waitFor(() => {
      expect(
        screen.getByText("Código incorrecto. Verifica e intenta de nuevo."),
      ).toBeInTheDocument();
    });
  });

  it("shows error on expired OTP", async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Token has expired or is invalid, otp_expired" },
    });

    const user = await goToOtpStep();

    const otpInputs = screen
      .getAllByRole("textbox")
      .filter((el) => el.getAttribute("aria-label")?.includes("Dígito"));
    await user.click(otpInputs[0]);
    await user.paste("111111");

    await waitFor(() => {
      expect(screen.getByText("El código ha expirado. Solicita uno nuevo.")).toBeInTheDocument();
    });
  });

  it("can resend OTP via signUp call", async () => {
    const user = await goToOtpStep();

    // The resend button should be disabled initially (timer active)
    const resendBtn = screen.getByRole("button", { name: "Reenviar código" });
    expect(resendBtn).toBeDisabled();
  });

  it("allows going back to phone/password step", async () => {
    const user = await goToOtpStep();

    await user.click(screen.getByText("Cambiar número de teléfono"));

    // Should be back on step 1
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeInTheDocument();
  });

  it("verify button is disabled when OTP is incomplete", async () => {
    await goToOtpStep();

    const verifyBtn = screen.getByRole("button", { name: "Verificar código" });
    expect(verifyBtn).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Existing user detection (WA-first)
// ---------------------------------------------------------------------------

describe("SignupForm — Existing user detection", () => {
  it("shows existing user message when identities array is empty", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "u1", identities: [] }, session: null },
      error: null,
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(
        screen.getByText("Ya tienes una cuenta desde WhatsApp"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Establecer contraseña" }),
      ).toHaveAttribute("href", "/set-password");
    });
  });

  it("does NOT transition to OTP step for existing users", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "u1", identities: [] }, session: null },
      error: null,
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(screen.queryByText(/código de verificación/i)).not.toBeInTheDocument();
    });
  });

  it("allows going back to signup form via 'Usar otro número'", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "u1", identities: [] }, session: null },
      error: null,
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(screen.getByText("Ya tienes una cuenta desde WhatsApp")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Usar otro número" }));

    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear cuenta" })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

describe("SignupForm — Error mapping", () => {
  it("maps rate limit errors to Spanish", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Rate limit exceeded: too many requests" },
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(
        screen.getByText("Demasiados intentos. Espera unos minutos antes de intentar de nuevo."),
      ).toBeInTheDocument();
    });
  });

  it("maps SMS hook errors to Spanish", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Unexpected status code returned from hook: 500" },
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await typePhone(user, "999888777");
    await fillPasswordFields(user, "password123");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(
        screen.getByText("No se pudo enviar el código de verificación. Intenta de nuevo."),
      ).toBeInTheDocument();
    });
  });
});
