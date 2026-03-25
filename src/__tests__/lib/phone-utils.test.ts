/**
 * Phone Utilities Tests — "Cuál es mi nombre" Web
 *
 * Tests for E.164 validation, country lookups, formatting, and masking.
 *
 * @module __tests__/lib/phone-utils.test
 */

import { describe, it, expect } from "vitest";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_CODE,
  getCountryByCode,
  getDefaultCountry,
  cleanDigits,
  formatE164,
  isValidE164,
  isValidNationalNumber,
  maskPhone,
  phoneE164Schema,
  nationalNumberSchema,
} from "@/lib/phone-utils";

// ---------------------------------------------------------------------------
// Country data
// ---------------------------------------------------------------------------

describe("COUNTRIES", () => {
  it("contains Peru as default country", () => {
    const peru = COUNTRIES.find((c) => c.code === "PE");
    expect(peru).toBeDefined();
    expect(peru!.dialCode).toBe("+51");
    expect(peru!.name).toBe("Perú");
  });

  it("contains all major Latin American countries", () => {
    const latamCodes = [
      "AR", "BO", "BR", "CL", "CO", "CR", "CU", "DO", "EC",
      "SV", "GT", "HN", "MX", "NI", "PA", "PY", "PE", "UY", "VE",
    ];
    const countryCodes = COUNTRIES.map((c) => c.code);
    for (const code of latamCodes) {
      expect(countryCodes).toContain(code);
    }
  });

  it("includes key international entries", () => {
    const intlCodes = ["US", "ES", "CA"];
    const countryCodes = COUNTRIES.map((c) => c.code);
    for (const code of intlCodes) {
      expect(countryCodes).toContain(code);
    }
  });

  it("all entries have required fields", () => {
    for (const country of COUNTRIES) {
      expect(country.code).toMatch(/^[A-Z]{2}$/);
      expect(country.name.length).toBeGreaterThan(0);
      expect(country.dialCode).toMatch(/^\+\d+$/);
      expect(country.flag.length).toBeGreaterThan(0);
    }
  });
});

describe("DEFAULT_COUNTRY_CODE", () => {
  it("is PE (Peru)", () => {
    expect(DEFAULT_COUNTRY_CODE).toBe("PE");
  });
});

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

describe("getCountryByCode", () => {
  it("returns country for valid code", () => {
    const peru = getCountryByCode("PE");
    expect(peru).toBeDefined();
    expect(peru!.dialCode).toBe("+51");
  });

  it("is case-insensitive", () => {
    expect(getCountryByCode("pe")).toEqual(getCountryByCode("PE"));
  });

  it("returns undefined for unknown code", () => {
    expect(getCountryByCode("ZZ")).toBeUndefined();
  });
});

describe("getDefaultCountry", () => {
  it("returns Peru", () => {
    const country = getDefaultCountry();
    expect(country.code).toBe("PE");
    expect(country.dialCode).toBe("+51");
  });
});

// ---------------------------------------------------------------------------
// Formatting & cleaning
// ---------------------------------------------------------------------------

describe("cleanDigits", () => {
  it("strips non-digit characters", () => {
    expect(cleanDigits("942 961-598")).toBe("942961598");
  });

  it("handles already-clean input", () => {
    expect(cleanDigits("942961598")).toBe("942961598");
  });

  it("handles empty string", () => {
    expect(cleanDigits("")).toBe("");
  });

  it("strips parentheses and dots", () => {
    expect(cleanDigits("(942) 961.598")).toBe("942961598");
  });
});

describe("formatE164", () => {
  it("combines dial code and national number", () => {
    expect(formatE164("+51", "942961598")).toBe("+51942961598");
  });

  it("strips non-digits from national number", () => {
    expect(formatE164("+51", "942 961-598")).toBe("+51942961598");
  });

  it("works with US dial code", () => {
    expect(formatE164("+1", "2025551234")).toBe("+12025551234");
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

describe("isValidE164", () => {
  it("accepts valid Peru number", () => {
    expect(isValidE164("+51942961598")).toBe(true);
  });

  it("accepts valid US number", () => {
    expect(isValidE164("+12025551234")).toBe(true);
  });

  it("accepts minimum length (7 digits after +)", () => {
    expect(isValidE164("+1234567")).toBe(true);
  });

  it("accepts maximum length (15 digits after +)", () => {
    expect(isValidE164("+123456789012345")).toBe(true);
  });

  it("rejects missing + prefix", () => {
    expect(isValidE164("51942961598")).toBe(false);
  });

  it("rejects leading zero after +", () => {
    expect(isValidE164("+0123456789")).toBe(false);
  });

  it("rejects too short", () => {
    expect(isValidE164("+123456")).toBe(false);
  });

  it("rejects too long (>15 digits)", () => {
    expect(isValidE164("+1234567890123456")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidE164("")).toBe(false);
  });

  it("rejects letters mixed in", () => {
    expect(isValidE164("+51abc961598")).toBe(false);
  });

  it("rejects spaces", () => {
    expect(isValidE164("+51 942 961 598")).toBe(false);
  });
});

describe("isValidNationalNumber", () => {
  it("accepts valid 9-digit Peru number", () => {
    expect(isValidNationalNumber("942961598")).toBe(true);
  });

  it("accepts minimum 6 digits", () => {
    expect(isValidNationalNumber("123456")).toBe(true);
  });

  it("strips non-digits before validating", () => {
    expect(isValidNationalNumber("942 961-598")).toBe(true);
  });

  it("rejects too short (< 6 digits)", () => {
    expect(isValidNationalNumber("12345")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidNationalNumber("")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Masking
// ---------------------------------------------------------------------------

describe("maskPhone", () => {
  it("masks a Peru number correctly", () => {
    expect(maskPhone("+51942961598")).toBe("+51***...98");
  });

  it("masks a US number correctly", () => {
    expect(maskPhone("+12025551234")).toBe("+12***...34");
  });

  it("handles very short input gracefully", () => {
    expect(maskPhone("+123")).toBe("***");
  });

  it("handles 5-char edge case", () => {
    expect(maskPhone("+1234")).toBe("***");
  });
});

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

describe("phoneE164Schema", () => {
  it("accepts valid E.164 number", () => {
    const result = phoneE164Schema.safeParse("+51942961598");
    expect(result.success).toBe(true);
  });

  it("trims whitespace before validating", () => {
    const result = phoneE164Schema.safeParse("  +51942961598  ");
    expect(result.success).toBe(true);
  });

  it("rejects invalid number", () => {
    const result = phoneE164Schema.safeParse("not-a-phone");
    expect(result.success).toBe(false);
  });

  it("rejects number without +", () => {
    const result = phoneE164Schema.safeParse("51942961598");
    expect(result.success).toBe(false);
  });
});

describe("nationalNumberSchema", () => {
  it("accepts valid digits", () => {
    const result = nationalNumberSchema.safeParse("942961598");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("942961598");
    }
  });

  it("transforms input by stripping non-digits", () => {
    const result = nationalNumberSchema.safeParse("942 961-598");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("942961598");
    }
  });

  it("rejects too short", () => {
    const result = nationalNumberSchema.safeParse("12345");
    expect(result.success).toBe(false);
  });
});
