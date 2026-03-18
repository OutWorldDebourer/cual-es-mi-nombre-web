/**
 * RRULE Builder / Parser / Describer — "Cuál es mi nombre" Web
 *
 * TypeScript port of `src/utils/rrule_builder.py`. Pure functions, no I/O.
 * Builds RFC 5545 RRULE strings, parses them back, and generates
 * human-readable Spanish descriptions.
 *
 * @module lib/rrule
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type RRuleFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type RRuleDay = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export interface RecurrenceParams {
  frequency: RRuleFrequency;
  interval: number;
  byDay: RRuleDay[];
  count: number | null;
  untilDate: string | null; // "YYYY-MM-DD"
}

// ── Constants ───────────────────────────────────────────────────────────────

const VALID_FREQUENCIES = new Set<string>(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
const VALID_DAYS = new Set<string>(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]);

const DAYS_SPANISH: Record<string, string> = {
  MO: "lunes",
  TU: "martes",
  WE: "miércoles",
  TH: "jueves",
  FR: "viernes",
  SA: "sábado",
  SU: "domingo",
};

const FREQUENCY_SPANISH: Record<string, string> = {
  DAILY: "día",
  WEEKLY: "semana",
  MONTHLY: "mes",
  YEARLY: "año",
};

const MONTHS_SPANISH = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Day labels for UI toggle buttons (short Spanish). */
export const DAY_OPTIONS: { value: RRuleDay; label: string }[] = [
  { value: "MO", label: "L" },
  { value: "TU", label: "M" },
  { value: "WE", label: "X" },
  { value: "TH", label: "J" },
  { value: "FR", label: "V" },
  { value: "SA", label: "S" },
  { value: "SU", label: "D" },
];

// ── Public API ──────────────────────────────────────────────────────────────

/** Build an RRULE string from structured params. */
export function buildRRule(params: RecurrenceParams): string {
  _validate(params);

  const parts: string[] = [`FREQ=${params.frequency}`];

  if (params.interval !== 1) {
    parts.push(`INTERVAL=${params.interval}`);
  }

  if (params.byDay.length > 0) {
    parts.push(`BYDAY=${params.byDay.join(",")}`);
  }

  if (params.untilDate !== null) {
    parts.push(`UNTIL=${_normalizeUntil(params.untilDate)}`);
  }

  if (params.count !== null) {
    parts.push(`COUNT=${params.count}`);
  }

  return `RRULE:${parts.join(";")}`;
}

/** Parse an RRULE string back to RecurrenceParams. */
export function parseRRule(rruleStr: string): RecurrenceParams {
  let raw = rruleStr.trim();
  if (raw.toUpperCase().startsWith("RRULE:")) {
    raw = raw.slice(6);
  }

  if (!raw) {
    throw new Error("Empty RRULE string");
  }

  const kv: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) throw new Error(`Malformed RRULE part: ${part}`);
    kv[part.slice(0, eqIdx).toUpperCase()] = part.slice(eqIdx + 1);
  }

  const frequency = kv["FREQ"]?.toUpperCase();
  if (!frequency || !VALID_FREQUENCIES.has(frequency)) {
    throw new Error(`Invalid or missing FREQ: ${frequency}`);
  }

  const interval = kv["INTERVAL"] ? parseInt(kv["INTERVAL"], 10) : 1;

  const byDay: RRuleDay[] = kv["BYDAY"]
    ? (kv["BYDAY"].split(",").map((d) => d.trim().toUpperCase()) as RRuleDay[])
    : [];

  let untilDate: string | null = kv["UNTIL"] ?? null;
  if (untilDate) {
    // Normalize RFC 5545 UNTIL back to YYYY-MM-DD for display
    untilDate = _untilToISO(untilDate);
  }

  const count = kv["COUNT"] ? parseInt(kv["COUNT"], 10) : null;

  return {
    frequency: frequency as RRuleFrequency,
    interval,
    byDay,
    count,
    untilDate,
  };
}

/** Human-readable Spanish description of recurrence params. */
export function describeRRule(params: RecurrenceParams): string {
  const freqWord = FREQUENCY_SPANISH[params.frequency] ?? params.frequency;

  // Base: "Cada día" / "Cada 2 semanas"
  let base: string;
  if (params.interval === 1) {
    base = `Cada ${freqWord}`;
  } else {
    base = `Cada ${params.interval} ${_pluralizeSpanish(freqWord)}`;
  }

  // Days: "los lunes, miércoles y viernes"
  if (params.byDay.length > 0) {
    const dayNames = params.byDay.map((d) => DAYS_SPANISH[d] ?? d);
    base = `${base} los ${_joinSpanish(dayNames)}`;
  }

  // Until
  if (params.untilDate !== null) {
    const dateStr = _formatUntilSpanish(params.untilDate);
    if (dateStr) {
      base = `${base} hasta el ${dateStr}`;
    }
  }

  // Count
  if (params.count !== null) {
    base = `${base} (${params.count} veces)`;
  }

  return base;
}

/** Returns default RecurrenceParams (no recurrence). */
export function defaultRecurrenceParams(): RecurrenceParams {
  return {
    frequency: "WEEKLY",
    interval: 1,
    byDay: [],
    count: null,
    untilDate: null,
  };
}

// ── Private helpers ─────────────────────────────────────────────────────────

function _validate(params: RecurrenceParams): void {
  if (!VALID_FREQUENCIES.has(params.frequency)) {
    throw new Error(`Invalid frequency: ${params.frequency}`);
  }
  if (params.interval < 1) {
    throw new Error(`interval must be >= 1, got ${params.interval}`);
  }
  for (const d of params.byDay) {
    if (!VALID_DAYS.has(d)) {
      throw new Error(`Invalid day: ${d}`);
    }
  }
  if (params.count !== null && params.untilDate !== null) {
    throw new Error("count and untilDate are mutually exclusive");
  }
  if (params.count !== null && params.count < 1) {
    throw new Error(`count must be >= 1, got ${params.count}`);
  }
}

function _normalizeUntil(untilStr: string): string {
  // Already RFC 5545: YYYYMMDDTHHMMSSZ
  if (/^\d{8}T\d{6}Z$/.test(untilStr)) return untilStr;
  // ISO date: YYYY-MM-DD → YYYYMMDDTHHMMSSZ
  if (/^\d{4}-\d{2}-\d{2}$/.test(untilStr)) {
    return `${untilStr.replace(/-/g, "")}T235959Z`;
  }
  throw new Error(`Invalid until date format: ${untilStr}`);
}

function _untilToISO(untilStr: string): string {
  // YYYYMMDDTHHMMSSZ → YYYY-MM-DD
  if (/^\d{8}T\d{6}Z$/.test(untilStr)) {
    return `${untilStr.slice(0, 4)}-${untilStr.slice(4, 6)}-${untilStr.slice(6, 8)}`;
  }
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(untilStr)) return untilStr;
  return untilStr;
}

function _pluralizeSpanish(word: string): string {
  if (word === "mes") return "meses";
  if (word.endsWith("a") || word.endsWith("o") || word.endsWith("á")) return word + "s";
  return word + "es";
}

function _joinSpanish(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " y " + items[items.length - 1];
}

function _formatUntilSpanish(dateStr: string): string {
  try {
    const datePart = dateStr.split("T")[0].replace(/-/g, "");
    if (datePart.length < 8) return "";
    const year = parseInt(datePart.slice(0, 4), 10);
    const month = parseInt(datePart.slice(4, 6), 10);
    const day = parseInt(datePart.slice(6, 8), 10);
    return `${day} de ${MONTHS_SPANISH[month - 1]} de ${year}`;
  } catch {
    return "";
  }
}
