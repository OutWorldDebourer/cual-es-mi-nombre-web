/**
 * OTP Input Component + useOTPTimer Hook Tests
 *
 * Tests for the OTPInput compound component (6-digit verification code)
 * and the useOTPTimer countdown hook. Covers rendering, keyboard
 * navigation, paste, completion callback, timer countdown, and a11y.
 *
 * @module __tests__/auth/otp-input.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OTPInput, useOTPTimer } from "@/components/auth/otp-input";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all digit inputs in the OTP group */
function getDigitInputs() {
  return screen.getAllByRole("textbox");
}

// ===========================================================================
// OTPInput Component
// ===========================================================================

describe("OTPInput", () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe("rendering", () => {
    it("renders 6 inputs by default", () => {
      render(<OTPInput />);
      expect(getDigitInputs()).toHaveLength(6);
    });

    it("renders custom number of inputs", () => {
      render(<OTPInput length={4} />);
      expect(getDigitInputs()).toHaveLength(4);
    });

    it("renders with a group role and label", () => {
      render(<OTPInput />);
      const group = screen.getByRole("group", {
        name: /código de verificación/i,
      });
      expect(group).toBeInTheDocument();
    });

    it("displays provided value across inputs", () => {
      render(<OTPInput value="123456" />);
      const inputs = getDigitInputs();
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[1]).toHaveValue("2");
      expect(inputs[2]).toHaveValue("3");
      expect(inputs[3]).toHaveValue("4");
      expect(inputs[4]).toHaveValue("5");
      expect(inputs[5]).toHaveValue("6");
    });

    it("displays partial value filling first N inputs", () => {
      render(<OTPInput value="12" />);
      const inputs = getDigitInputs();
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[1]).toHaveValue("2");
      expect(inputs[2]).toHaveValue("");
      expect(inputs[3]).toHaveValue("");
    });

    it("applies custom className to wrapper", () => {
      const { container } = render(<OTPInput className="my-class" />);
      expect(container.firstChild).toHaveClass("my-class");
    });
  });

  // -------------------------------------------------------------------------
  // Disabled state
  // -------------------------------------------------------------------------

  describe("disabled state", () => {
    it("disables all inputs when disabled", () => {
      render(<OTPInput disabled />);
      for (const input of getDigitInputs()) {
        expect(input).toBeDisabled();
      }
    });
  });

  // -------------------------------------------------------------------------
  // Auto-focus
  // -------------------------------------------------------------------------

  describe("auto-focus", () => {
    it("focuses first input when autoFocus is true", () => {
      render(<OTPInput autoFocus />);
      expect(getDigitInputs()[0]).toHaveFocus();
    });

    it("does not focus when autoFocus is false", () => {
      render(<OTPInput />);
      expect(getDigitInputs()[0]).not.toHaveFocus();
    });
  });

  // -------------------------------------------------------------------------
  // Digit input behavior
  // -------------------------------------------------------------------------

  describe("digit input", () => {
    it("calls onChange when a digit is typed", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.keyboard("5");

      expect(handleChange).toHaveBeenCalledWith("5");
    });

    it("advances focus to next input after typing a digit", async () => {
      const user = userEvent.setup();
      render(<OTPInput onChange={vi.fn()} />);

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.keyboard("1");

      expect(inputs[1]).toHaveFocus();
    });

    it("calls onComplete when all digits are filled", async () => {
      const user = userEvent.setup();
      const handleComplete = vi.fn();
      render(
        <OTPInput onChange={vi.fn()} onComplete={handleComplete} />,
      );

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.keyboard("1");
      await user.keyboard("2");
      await user.keyboard("3");
      await user.keyboard("4");
      await user.keyboard("5");
      await user.keyboard("6");

      expect(handleComplete).toHaveBeenCalledWith("123456");
    });

    it("ignores non-digit characters", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.keyboard("a");

      // Should not have advanced or changed
      expect(inputs[0]).toHaveFocus();
      // onChange may be called with empty or not at all
      const calls = handleChange.mock.calls;
      const hasDigit = calls.some(
        (c: string[]) => c[0] && /\d/.test(c[0]),
      );
      expect(hasDigit).toBe(false);
    });

    it("replaces existing digit when typing in a filled slot", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput value="100000" onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.keyboard("9");

      expect(handleChange).toHaveBeenCalledWith("900000");
    });
  });

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------

  describe("keyboard navigation", () => {
    it("Backspace clears current digit", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput value="123456" onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[2]);
      await user.keyboard("{Backspace}");

      // Digit at index 2 cleared: ["1","2","","4","5","6"].join("") = "12456"
      expect(handleChange).toHaveBeenCalledWith("12456");
    });

    it("Backspace on empty slot moves to previous and clears it", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput value="12" onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[2]); // empty slot
      await user.keyboard("{Backspace}");

      // Should have moved to index 1 and cleared it
      expect(inputs[1]).toHaveFocus();
      expect(handleChange).toHaveBeenCalledWith("1");
    });

    it("ArrowLeft moves focus to previous input", async () => {
      const user = userEvent.setup();
      render(<OTPInput />);

      const inputs = getDigitInputs();
      await user.click(inputs[3]);
      await user.keyboard("{ArrowLeft}");

      expect(inputs[2]).toHaveFocus();
    });

    it("ArrowRight moves focus to next input", async () => {
      const user = userEvent.setup();
      render(<OTPInput />);

      const inputs = getDigitInputs();
      await user.click(inputs[2]);
      await user.keyboard("{ArrowRight}");

      expect(inputs[3]).toHaveFocus();
    });

    it("ArrowLeft on first input stays on first", async () => {
      const user = userEvent.setup();
      render(<OTPInput />);

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.keyboard("{ArrowLeft}");

      expect(inputs[0]).toHaveFocus();
    });

    it("ArrowRight on last input stays on last", async () => {
      const user = userEvent.setup();
      render(<OTPInput />);

      const inputs = getDigitInputs();
      await user.click(inputs[5]);
      await user.keyboard("{ArrowRight}");

      expect(inputs[5]).toHaveFocus();
    });

    it("Delete clears current digit without moving", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput value="123456" onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[2]);
      await user.keyboard("{Delete}");

      // Digit at index 2 cleared: ["1","2","","4","5","6"].join("") = "12456"
      expect(handleChange).toHaveBeenCalledWith("12456");
      expect(inputs[2]).toHaveFocus();
    });
  });

  // -------------------------------------------------------------------------
  // Paste
  // -------------------------------------------------------------------------

  describe("paste", () => {
    it("fills digits from pasted text", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleComplete = vi.fn();
      render(
        <OTPInput onChange={handleChange} onComplete={handleComplete} />,
      );

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.paste("561166");

      expect(handleChange).toHaveBeenCalledWith("561166");
      expect(handleComplete).toHaveBeenCalledWith("561166");
    });

    it("strips non-digit characters from pasted text", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.paste("56-11-66");

      expect(handleChange).toHaveBeenCalledWith("561166");
    });

    it("truncates pasted text longer than length", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput length={4} onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.paste("123456789");

      expect(handleChange).toHaveBeenCalledWith("1234");
    });

    it("handles paste with only non-digit chars gracefully", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<OTPInput onChange={handleChange} />);

      const inputs = getDigitInputs();
      await user.click(inputs[0]);
      await user.paste("abcdef");

      // Should not call onChange with digits
      const digitCalls = handleChange.mock.calls.filter(
        (c: string[]) => c[0] && /\d/.test(c[0]),
      );
      expect(digitCalls).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------

  describe("accessibility", () => {
    it("each input has appropriate aria-label", () => {
      render(<OTPInput />);
      const inputs = getDigitInputs();
      expect(inputs[0]).toHaveAttribute("aria-label", "Dígito 1 de 6");
      expect(inputs[5]).toHaveAttribute("aria-label", "Dígito 6 de 6");
    });

    it("custom length reflects in aria-label", () => {
      render(<OTPInput length={4} />);
      const inputs = getDigitInputs();
      expect(inputs[0]).toHaveAttribute("aria-label", "Dígito 1 de 4");
      expect(inputs[3]).toHaveAttribute("aria-label", "Dígito 4 de 4");
    });

    it("aria-invalid propagates to all inputs", () => {
      render(<OTPInput aria-invalid={true} />);
      for (const input of getDigitInputs()) {
        expect(input).toHaveAttribute("aria-invalid", "true");
      }
    });

    it("inputs have numeric inputMode", () => {
      render(<OTPInput />);
      for (const input of getDigitInputs()) {
        expect(input).toHaveAttribute("inputMode", "numeric");
      }
    });

    it("first input has one-time-code autocomplete", () => {
      render(<OTPInput />);
      const inputs = getDigitInputs();
      expect(inputs[0]).toHaveAttribute("autoComplete", "one-time-code");
      expect(inputs[1]).toHaveAttribute("autoComplete", "off");
    });
  });
});

// ===========================================================================
// useOTPTimer Hook
// ===========================================================================

describe("useOTPTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with initial seconds and is active", () => {
    const { result } = renderHook(() => useOTPTimer({ initialSeconds: 60 }));
    expect(result.current.seconds).toBe(60);
    expect(result.current.isActive).toBe(true);
  });

  it("counts down every second", () => {
    const { result } = renderHook(() => useOTPTimer({ initialSeconds: 5 }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.seconds).toBe(4);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.seconds).toBe(2);
  });

  it("stops at 0 and becomes inactive", () => {
    const { result } = renderHook(() => useOTPTimer({ initialSeconds: 2 }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.seconds).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it("restart resets to initial seconds", () => {
    const { result } = renderHook(() => useOTPTimer({ initialSeconds: 10 }));

    // Run timer down
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.seconds).toBe(0);
    expect(result.current.isActive).toBe(false);

    // Restart
    act(() => {
      result.current.restart();
    });
    expect(result.current.seconds).toBe(10);
    expect(result.current.isActive).toBe(true);

    // Verify it counts down again
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.seconds).toBe(7);
  });

  it("formatTime returns M:SS format", () => {
    const { result } = renderHook(() => useOTPTimer({ initialSeconds: 90 }));
    expect(result.current.formatTime()).toBe("1:30");

    act(() => {
      vi.advanceTimersByTime(85000);
    });
    expect(result.current.formatTime()).toBe("0:05");
  });

  it("formatTime handles exact minute", () => {
    const { result } = renderHook(() => useOTPTimer({ initialSeconds: 120 }));
    expect(result.current.formatTime()).toBe("2:00");
  });

  it("formatTime at zero", () => {
    const { result } = renderHook(() => useOTPTimer({ initialSeconds: 1 }));

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.formatTime()).toBe("0:00");
  });

  it("autoStart=false starts inactive at 0", () => {
    const { result } = renderHook(() =>
      useOTPTimer({ initialSeconds: 60, autoStart: false }),
    );
    expect(result.current.seconds).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it("autoStart=false can be started via restart", () => {
    const { result } = renderHook(() =>
      useOTPTimer({ initialSeconds: 30, autoStart: false }),
    );

    act(() => {
      result.current.restart();
    });
    expect(result.current.seconds).toBe(30);
    expect(result.current.isActive).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.seconds).toBe(25);
  });

  it("uses default 60 seconds when no options provided", () => {
    const { result } = renderHook(() => useOTPTimer());
    expect(result.current.seconds).toBe(60);
    expect(result.current.formatTime()).toBe("1:00");
  });
});
