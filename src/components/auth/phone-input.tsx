/**
 * Phone Input Component — Country Selector + E.164 Validation
 *
 * Compound input for phone-based auth (FA8). Combines a country
 * dial-code selector with a national number input field.
 *
 * Features:
 * - Country dropdown with flag, name, and dial code
 * - Searchable country list (by name or code)
 * - Keyboard accessible (Escape to close, arrow keys implicit via focus)
 * - Outputs full E.164 string via onChange
 * - Default country: Peru (+51)
 *
 * @module components/auth/phone-input
 */

"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  getDefaultCountry,
  getCountryByCode,
  cleanDigits,
  formatE164,
  type Country,
} from "@/lib/phone-utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PhoneInputProps {
  /** Full E.164 value (e.g. "+51942961598"). Controlled. */
  value?: string;
  /**
   * Called with the full E.164 string whenever country or number changes.
   * Also passes the raw national number as second arg for convenience.
   */
  onChange?: (e164: string, nationalNumber: string) => void;
  /** HTML id for the number input (label association) */
  id?: string;
  /** Disable the entire component */
  disabled?: boolean;
  /** Initial country code (ISO), defaults to "PE" */
  defaultCountryCode?: string;
  /** Placeholder for the number input */
  placeholder?: string;
  /** Additional class names for the outer wrapper */
  className?: string;
  /** aria-invalid for error states */
  "aria-invalid"?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhoneInput({
  value,
  onChange,
  id,
  disabled = false,
  defaultCountryCode,
  placeholder = "942 961 598",
  className,
  "aria-invalid": ariaInvalid,
}: PhoneInputProps) {
  // --- State ---------------------------------------------------------------

  const initialCountry =
    getCountryByCode(defaultCountryCode ?? "PE") ?? getDefaultCountry();

  const [selectedCountry, setSelectedCountry] =
    useState<Country>(initialCountry);
  const [nationalNumber, setNationalNumber] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // --- Sync from external value prop (controlled mode) --------------------

  useEffect(() => {
    if (!value) return;
    // Try to match the value to a known country dial code
    // Sort countries by dial code length desc so longer codes match first
    const sorted = [...COUNTRIES].sort(
      (a, b) => b.dialCode.length - a.dialCode.length,
    );
    for (const country of sorted) {
      if (value.startsWith(country.dialCode)) {
        setSelectedCountry(country);
        setNationalNumber(value.slice(country.dialCode.length));
        return;
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Only sync on mount — after that the component is the source of truth.

  // --- Emit E.164 on changes ---------------------------------------------

  const emitChange = useCallback(
    (country: Country, national: string) => {
      const digits = cleanDigits(national);
      const e164 = formatE164(country.dialCode, digits);
      onChange?.(e164, digits);
    },
    [onChange],
  );

  // --- Handlers -----------------------------------------------------------

  function handleCountrySelect(country: Country) {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearch("");
    emitChange(country, nationalNumber);
    // Return focus to trigger
    triggerRef.current?.focus();
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow only digits and spaces (for user-friendly formatting)
    const cleaned = raw.replace(/[^\d\s]/g, "");
    setNationalNumber(cleaned);
    emitChange(selectedCountry, cleaned);
  }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setDropdownOpen(true);
    }
  }

  function handleDropdownKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      setDropdownOpen(false);
      triggerRef.current?.focus();
    }
  }

  // --- Close on outside click ---------------------------------------------

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // --- Focus search input when dropdown opens -----------------------------

  useEffect(() => {
    if (dropdownOpen) {
      // Small delay to allow DOM render
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [dropdownOpen]);

  // --- Filtered countries -------------------------------------------------

  const filteredCountries = search
    ? COUNTRIES.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.dialCode.includes(q)
        );
      })
    : COUNTRIES;

  // --- Render -------------------------------------------------------------

  return (
    <div className={cn("flex gap-0", className)} ref={dropdownRef}>
      {/* Country selector trigger */}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label={`País seleccionado: ${selectedCountry.name} (${selectedCountry.dialCode})`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex h-9 items-center gap-1 rounded-l-md border border-r-0 border-input bg-transparent px-2 text-sm transition-[color,box-shadow] outline-none",
            "hover:bg-accent/50",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            "dark:bg-input/30",
            ariaInvalid && "border-destructive",
          )}
        >
          <span className="text-base leading-none">
            {selectedCountry.flag}
          </span>
          <span className="text-muted-foreground">
            {selectedCountry.dialCode}
          </span>
          <svg
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform",
              dropdownOpen && "rotate-180",
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Dropdown panel */}
        {dropdownOpen && (
          <div
            role="listbox"
            aria-label="Seleccionar país"
            onKeyDown={handleDropdownKeyDown}
            className={cn(
              "absolute left-0 top-full z-50 mt-1 w-64 rounded-md border border-input bg-background shadow-lg",
              "animate-in fade-in-0 zoom-in-95",
            )}
          >
            {/* Search input */}
            <div className="border-b border-input p-2">
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 w-full rounded-sm border-0 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Buscar país"
              />
            </div>

            {/* Country list */}
            <div className="max-h-56 overflow-y-auto py-1">
              {filteredCountries.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Sin resultados
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    role="option"
                    aria-selected={country.code === selectedCountry.code}
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-sm outline-none",
                      "hover:bg-accent focus-visible:bg-accent",
                      country.code === selectedCountry.code &&
                        "bg-accent/50 font-medium",
                    )}
                  >
                    <span className="text-base leading-none">
                      {country.flag}
                    </span>
                    <span className="flex-1 text-left">{country.name}</span>
                    <span className="text-muted-foreground">
                      {country.dialCode}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* National number input */}
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        disabled={disabled}
        placeholder={placeholder}
        value={nationalNumber}
        onChange={handleNumberChange}
        autoComplete="tel-national"
        aria-invalid={ariaInvalid}
        className={cn(
          "h-9 w-full min-w-0 rounded-r-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30",
          ariaInvalid &&
            "border-destructive ring-destructive/20 dark:ring-destructive/40",
        )}
      />
    </div>
  );
}
