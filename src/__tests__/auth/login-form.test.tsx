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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    refresh: mockRefresh,
  }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

const mockSignInWithPassword = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseClient.auth.signInWithPassword = mockSignInWithPassword;
  mockSignInWithPassword.mockResolvedValue({
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

    expect(screen.getByRole("button", { name: "Ingresando..." })).toBeDisabled();
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
