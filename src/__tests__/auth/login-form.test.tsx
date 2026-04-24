/**
 * LoginForm Tests — "Cuál es mi nombre" Web
 *
 * Tests for the phone + password login flow:
 *   PhoneInput + password → signInWithPassword → redirect /dashboard
 *
 * @module __tests__/auth/login-form.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { mockSupabaseClient } from "../setup";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
const mockRefresh = vi.fn();

// Mutable search params override per test — reset in beforeEach
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    refresh: mockRefresh,
  }),
  usePathname: () => "/login",
  useSearchParams: () => mockSearchParams,
  redirect: vi.fn(),
}));

// Mock phoneAuthApi.checkStatus — pre-login phone check
const mockCheckStatus = vi.fn();

vi.mock("@/lib/api", () => ({
  phoneAuthApi: {
    checkStatus: (...args: unknown[]) => mockCheckStatus(...args),
  },
}));

const mockSignInWithPassword = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockSearchParams = new URLSearchParams();
  mockSupabaseClient.auth.signInWithPassword = mockSignInWithPassword;
  mockSignInWithPassword.mockResolvedValue({
    data: {
      user: { id: "u1", phone: "+51999888777" },
      session: { access_token: "tok" },
    },
    error: null,
  });
  // Default: phone already has password → proceed to signInWithPassword
  mockCheckStatus.mockResolvedValue({
    action: "login",
    channel_origin: "web",
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function typePhone(user: ReturnType<typeof userEvent.setup>, digits: string) {
  const telInput = screen.getByLabelText("Número de WhatsApp");
  await user.type(telInput, digits);
}

async function typePassword(user: ReturnType<typeof userEvent.setup>, password: string) {
  const passwordInput = screen.getByLabelText("Contraseña");
  await user.type(passwordInput, password);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe("LoginForm — Rendering", () => {
  it("renders phone input and password field", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Número de WhatsApp")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    render(<LoginForm />);
    const link = screen.getByText("¿Olvidaste tu contraseña?");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/recovery");
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

describe("LoginForm — Validation", () => {
  it("shows error when phone is empty/invalid", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByText("Ingresa un número de teléfono válido.")).toBeInTheDocument();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("shows error when password is too short", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "12345");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(
      screen.getByText("La contraseña debe tener al menos 6 caracteres."),
    ).toBeInTheDocument();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Successful login
// ---------------------------------------------------------------------------

describe("LoginForm — Successful login", () => {
  it("calls signInWithPassword with phone and password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        phone: "+51999888777",
        password: "password123",
      });
    });
  });

  it("redirects to /dashboard on success", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows loading state while authenticating", async () => {
    mockSignInWithPassword.mockReturnValue(new Promise(() => {}));

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(screen.getByRole("button", { name: /Ingresando/ })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("LoginForm — Error handling", () => {
  it("shows error for invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Teléfono o contraseña incorrectos."),
      ).toBeInTheDocument();
    });
  });

  it("shows error for unconfirmed phone", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Phone not confirmed" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Tu número de teléfono no ha sido verificado. Completa el registro primero."),
      ).toBeInTheDocument();
    });
  });

  it("shows error for rate limiting", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Rate limit exceeded: too many requests" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Demasiados intentos. Espera unos minutos antes de intentar de nuevo."),
      ).toBeInTheDocument();
    });
  });

  it("shows error for disabled email login", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Email logins are disabled" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(
        screen.getByText("El inicio de sesión por correo electrónico está deshabilitado. Usa tu número de teléfono."),
      ).toBeInTheDocument();
    });
  });

  it("shows generic error on unexpected exception", async () => {
    mockSignInWithPassword.mockRejectedValueOnce(new Error("network error"));

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(screen.getByText("Error inesperado. Intenta de nuevo.")).toBeInTheDocument();
    });
  });

  it("passes through unmapped error messages as-is", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Some unknown error from Supabase" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(screen.getByText("Some unknown error from Supabase")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// ?next post-login redirect
// ---------------------------------------------------------------------------

describe("LoginForm — ?next post-login redirect", () => {
  async function completeLoginFlow() {
    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));
  }

  it("redirects to next URL after successful login when ?next is valid", async () => {
    mockSearchParams = new URLSearchParams("next=/dashboard/plans?status=approved");

    await completeLoginFlow();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/plans?status=approved");
    });
  });

  it("falls back to /dashboard when ?next is external/malicious", async () => {
    mockSearchParams = new URLSearchParams("next=https://evil.com/steal");

    await completeLoginFlow();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("falls back to /dashboard when ?next is missing", async () => {
    mockSearchParams = new URLSearchParams();

    await completeLoginFlow();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("falls back to /dashboard when ?next is protocol-relative", async () => {
    mockSearchParams = new URLSearchParams("next=//evil.com/steal");

    await completeLoginFlow();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});

// ---------------------------------------------------------------------------
// Pre-check banners (needsPassword / noAccount) preserve ?next
// ---------------------------------------------------------------------------

describe("LoginForm — noAccount banner preserves ?next in lateral links", () => {
  async function triggerNoAccount() {
    mockCheckStatus.mockResolvedValueOnce({
      action: "signup",
      channel_origin: null,
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(
        screen.getByText("No existe una cuenta con este número"),
      ).toBeInTheDocument();
    });
  }

  it("signup link preserves ?next", async () => {
    mockSearchParams = new URLSearchParams("next=/dashboard/plans?status=approved");

    await triggerNoAccount();

    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute(
      "href",
      "/signup?next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved",
    );
  });

  it("signup link drops invalid (external) ?next", async () => {
    mockSearchParams = new URLSearchParams("next=https://evil.com/steal");

    await triggerNoAccount();

    expect(screen.getByRole("link", { name: "Registrarse" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });
});

describe("LoginForm — needsPassword banner preserves ?next in set-password link", () => {
  async function triggerNeedsPassword() {
    mockCheckStatus.mockResolvedValueOnce({
      action: "set_password",
      channel_origin: "whatsapp",
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await typePhone(user, "999888777");
    await typePassword(user, "password123");
    await user.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() => {
      expect(
        screen.getByText("Tu cuenta fue creada desde WhatsApp"),
      ).toBeInTheDocument();
    });
  }

  it("set-password href preserves ?next alongside phone and from params", async () => {
    mockSearchParams = new URLSearchParams("next=/dashboard/plans?status=approved");

    await triggerNeedsPassword();

    expect(
      screen.getByRole("link", { name: "Crear contraseña para la web" }),
    ).toHaveAttribute(
      "href",
      "/set-password?phone=%2B51999888777&from=login&next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved",
    );
  });

  it("set-password href drops javascript: scheme ?next", async () => {
    mockSearchParams = new URLSearchParams("next=javascript:alert(1)");

    await triggerNeedsPassword();

    expect(
      screen.getByRole("link", { name: "Crear contraseña para la web" }),
    ).toHaveAttribute(
      "href",
      "/set-password?phone=%2B51999888777&from=login",
    );
  });
});

describe("LoginForm — recovery link preserves ?next", () => {
  it("preserves ?next on the recovery link", () => {
    mockSearchParams = new URLSearchParams("next=/dashboard/plans?status=approved");
    render(<LoginForm />);
    const recoveryLink = screen.getByRole("link", { name: /olvidaste tu contraseña/i });
    expect(recoveryLink).toHaveAttribute(
      "href",
      "/recovery?next=%2Fdashboard%2Fplans%3Fstatus%3Dapproved",
    );
  });
});
