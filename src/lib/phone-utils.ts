/**
 * Phone Utilities — E.164 Validation, Country Data, Formatting
 *
 * Provides country dial code data, E.164 format helpers, and
 * phone masking for the phone-based auth system (FA8).
 *
 * Design decisions:
 * - No external library (libphonenumber-js) — regex-based validation
 *   keeps the bundle small and is sufficient for our use case.
 * - Country list focused on Latin America with key international entries.
 * - Default country: Peru (PE, +51) — primary market.
 * - Zod schema provided for form-level validation integration.
 *
 * @module lib/phone-utils
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Country {
  /** ISO 3166-1 alpha-2 (e.g. "PE", "AR") */
  code: string;
  /** Display name in Spanish */
  name: string;
  /** International dial code with '+' prefix (e.g. "+51") */
  dialCode: string;
  /** Emoji flag */
  flag: string;
}

// ---------------------------------------------------------------------------
// Country data
// ---------------------------------------------------------------------------

/**
 * Countries sorted alphabetically by Spanish name.
 * Latin America complete + key international entries.
 */
export const COUNTRIES: readonly Country[] = [
  // Latin America
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "\u{1F1E6}\u{1F1F7}" },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "\u{1F1E7}\u{1F1F4}" },
  { code: "BR", name: "Brasil", dialCode: "+55", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "\u{1F1E8}\u{1F1F1}" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "\u{1F1E8}\u{1F1F4}" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "\u{1F1E8}\u{1F1F7}" },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "\u{1F1E8}\u{1F1FA}" },
  { code: "DO", name: "Rep. Dominicana", dialCode: "+1809", flag: "\u{1F1E9}\u{1F1F4}" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "\u{1F1EA}\u{1F1E8}" },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: "\u{1F1F8}\u{1F1FB}" },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: "\u{1F1EC}\u{1F1F9}" },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: "\u{1F1ED}\u{1F1F3}" },
  { code: "MX", name: "México", dialCode: "+52", flag: "\u{1F1F2}\u{1F1FD}" },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "\u{1F1F3}\u{1F1EE}" },
  { code: "PA", name: "Panamá", dialCode: "+507", flag: "\u{1F1F5}\u{1F1E6}" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "\u{1F1F5}\u{1F1FE}" },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "\u{1F1F5}\u{1F1EA}" },
  { code: "PR", name: "Puerto Rico", dialCode: "+1787", flag: "\u{1F1F5}\u{1F1F7}" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "\u{1F1FA}\u{1F1FE}" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "\u{1F1FB}\u{1F1EA}" },

  // International (key markets)
  { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "ES", name: "España", dialCode: "+34", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "CA", name: "Canadá", dialCode: "+1", flag: "\u{1F1E8}\u{1F1E6}" },
] as const;

/** Default country for the phone selector */
export const DEFAULT_COUNTRY_CODE = "PE";

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

const countryByCode = new Map<string, Country>(
  COUNTRIES.map((c) => [c.code, c]),
);

/** Find a country by its ISO code. */
export function getCountryByCode(code: string): Country | undefined {
  return countryByCode.get(code.toUpperCase());
}

/** Get the default country object. */
export function getDefaultCountry(): Country {
  return countryByCode.get(DEFAULT_COUNTRY_CODE)!;
}

// ---------------------------------------------------------------------------
// Formatting & cleaning
// ---------------------------------------------------------------------------

/**
 * Strip everything except digits from a string.
 *
 * @example cleanDigits("942 961-598") → "999888777"
 */
export function cleanDigits(input: string): string {
  return input.replace(/\D/g, "");
}

/**
 * Combine a dial code and national number into E.164 format.
 *
 * @example formatE164("+51", "999888777") → "+51999888777"
 */
export function formatE164(dialCode: string, nationalNumber: string): string {
  const digits = cleanDigits(nationalNumber);
  return `${dialCode}${digits}`;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * E.164 regex: '+' followed by 7-15 digits (ITU-T E.164 standard).
 * The first digit after '+' must be 1-9 (no leading zero in country code).
 */
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

/**
 * Validate a full E.164 phone number.
 *
 * @example isValidE164("+51999888777") → true
 * @example isValidE164("51999888777")  → false  (missing '+')
 * @example isValidE164("+0123456789")  → false  (leading zero)
 */
export function isValidE164(phone: string): boolean {
  return E164_REGEX.test(phone);
}

/**
 * Validate a national number (digits only, 6-14 digits).
 * Intentionally permissive — final validation happens via E.164 on the full number.
 *
 * @example isValidNationalNumber("999888777") → true
 * @example isValidNationalNumber("12345")     → false  (too short)
 */
export function isValidNationalNumber(nationalNumber: string): boolean {
  const digits = cleanDigits(nationalNumber);
  return digits.length >= 6 && digits.length <= 14;
}

// ---------------------------------------------------------------------------
// Masking (for logging & display)
// ---------------------------------------------------------------------------

/**
 * Mask a phone number for safe logging/display.
 * Shows first 3 chars and last 2 digits, masks the rest.
 *
 * @example maskPhone("+51999888777") → "+51***...98"
 * @example maskPhone("+1234567890")  → "+12***...90"
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 5) return "***";
  const prefix = phone.slice(0, 3);
  const suffix = phone.slice(-2);
  return `${prefix}***...${suffix}`;
}

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

/**
 * Zod schema for E.164 phone number validation.
 * Use in forms with React Hook Form or standalone.
 *
 * @example
 * const result = phoneE164Schema.safeParse("+51999888777");
 * // result.success === true
 */
export const phoneE164Schema = z
  .string()
  .trim()
  .regex(E164_REGEX, "Número de teléfono inválido. Formato esperado: +51999888777");

/**
 * Zod schema for the national number part (digits only, 6-14 length).
 */
export const nationalNumberSchema = z
  .string()
  .trim()
  .transform(cleanDigits)
  .pipe(
    z.string().min(6, "Mínimo 6 dígitos").max(14, "Máximo 14 dígitos"),
  );
