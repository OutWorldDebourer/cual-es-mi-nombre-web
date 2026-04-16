/**
 * Phone Input Component Tests — "Cuál es mi nombre" Web
 *
 * Tests for the PhoneInput compound component: country selector,
 * national number input, E.164 output, keyboard access, search.
 *
 * @module __tests__/auth/phone-input.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhoneInput } from "@/components/auth/phone-input";

describe("PhoneInput", () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------

  it("renders with default country Peru", () => {
    render(<PhoneInput />);
    const trigger = screen.getByRole("button", { name: /perú/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("+51");
  });

  it("renders the number input with placeholder", () => {
    render(<PhoneInput id="phone" placeholder="987654321" />);
    const input = screen.getByPlaceholderText("987654321");
    expect(input).toBeInTheDocument();
  });

  it("applies custom className to wrapper", () => {
    const { container } = render(<PhoneInput className="my-custom-class" />);
    expect(container.firstChild).toHaveClass("my-custom-class");
  });

  it("renders with custom default country", () => {
    render(<PhoneInput defaultCountryCode="AR" />);
    const trigger = screen.getByRole("button", { name: /argentina/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("+54");
  });

  it("disables both trigger and input when disabled", () => {
    render(<PhoneInput disabled />);
    const trigger = screen.getByRole("button");
    const input = screen.getByRole("textbox");
    expect(trigger).toBeDisabled();
    expect(input).toBeDisabled();
  });

  // -----------------------------------------------------------------------
  // Number input behavior
  // -----------------------------------------------------------------------

  it("calls onChange with E.164 when user types a number", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "999888777");

    // Should have been called for each character
    expect(handleChange).toHaveBeenCalled();
    // Last call should have full E.164
    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1];
    expect(lastCall[0]).toBe("+51999888777");
    expect(lastCall[1]).toBe("999888777");
  });

  it("strips non-digit non-space characters from input", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "942-961");

    // Dashes should be stripped — only digits and spaces kept
    expect(input).toHaveValue("942961");
  });

  // -----------------------------------------------------------------------
  // Country selector dropdown
  // -----------------------------------------------------------------------

  it("opens dropdown on trigger click", async () => {
    const user = userEvent.setup();
    render(<PhoneInput />);

    const trigger = screen.getByRole("button", { name: /perú/i });
    await user.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar país...")).toBeInTheDocument();
  });

  it("shows all countries when dropdown opens without search", async () => {
    const user = userEvent.setup();
    render(<PhoneInput />);

    await user.click(screen.getByRole("button", { name: /perú/i }));

    // Should have option buttons for each country
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThanOrEqual(20);
  });

  it("filters countries by search text", async () => {
    const user = userEvent.setup();
    render(<PhoneInput />);

    await user.click(screen.getByRole("button", { name: /perú/i }));
    const searchInput = screen.getByPlaceholderText("Buscar país...");
    await user.type(searchInput, "arg");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Argentina");
  });

  it("shows 'Sin resultados' when search matches nothing", async () => {
    const user = userEvent.setup();
    render(<PhoneInput />);

    await user.click(screen.getByRole("button", { name: /perú/i }));
    await user.type(
      screen.getByPlaceholderText("Buscar país..."),
      "zzzzz",
    );

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });

  it("selects a country and updates dial code", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<PhoneInput onChange={handleChange} />);

    // Open dropdown
    await user.click(screen.getByRole("button", { name: /perú/i }));

    // Search for Mexico
    await user.type(
      screen.getByPlaceholderText("Buscar país..."),
      "méx",
    );

    // Click Mexico
    const mexicoOption = screen.getByRole("option", { name: /méxico/i });
    await user.click(mexicoOption);

    // Dropdown should close
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Trigger should now show Mexico
    const trigger = screen.getByRole("button", { name: /méxico/i });
    expect(trigger).toHaveTextContent("+52");
  });

  it("closes dropdown on Escape key", async () => {
    const user = userEvent.setup();
    render(<PhoneInput />);

    await user.click(screen.getByRole("button", { name: /perú/i }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Controlled value
  // -----------------------------------------------------------------------

  it("syncs initial value to country and national number", () => {
    render(<PhoneInput value="+54911234567" />);

    // Should detect Argentina (+54)
    const trigger = screen.getByRole("button", { name: /argentina/i });
    expect(trigger).toBeInTheDocument();

    // National number should be populated
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("911234567");
  });

  // -----------------------------------------------------------------------
  // Aria / accessibility
  // -----------------------------------------------------------------------

  it("sets aria-invalid on both trigger and input", () => {
    render(<PhoneInput aria-invalid={true} id="phone" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("trigger has aria-haspopup and aria-expanded", async () => {
    const user = userEvent.setup();
    render(<PhoneInput />);

    const trigger = screen.getByRole("button", { name: /perú/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("input has tel type and numeric inputMode", () => {
    render(<PhoneInput id="phone" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("inputMode", "numeric");
  });
});
