/**
 * Date Formatting Utilities — "Cuál es mi nombre" Web
 *
 * Converts UTC timestamps from Supabase into user-friendly local strings.
 * All DB dates are stored in UTC (TIMESTAMPTZ). The user's timezone
 * comes from profiles.timezone (IANA format, e.g., "America/Lima").
 *
 * @module lib/dates
 */

/**
 * Format a UTC ISO string into a localized date+time string.
 *
 * @param utcDate - ISO 8601 string from Supabase (UTC)
 * @param timezone - IANA timezone (e.g., "America/Lima"). Defaults to local browser tz.
 * @param locale - BCP 47 locale string (default: "es-PE")
 */
export function formatDateTime(
  utcDate: string,
  timezone?: string,
  locale = "es-PE",
): string {
  const date = new Date(utcDate);
  return date.toLocaleString(locale, {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a UTC ISO string into a localized date-only string.
 */
export function formatDate(
  utcDate: string,
  timezone?: string,
  locale = "es-PE",
): string {
  const date = new Date(utcDate);
  return date.toLocaleString(locale, {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a UTC ISO string into a relative time string (e.g., "hace 5 min").
 */
export function formatRelativeTime(utcDate: string): string {
  const now = Date.now();
  const then = new Date(utcDate).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "hace un momento";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHour < 24) return `hace ${diffHour}h`;
  if (diffDay < 7) return `hace ${diffDay}d`;
  return formatDate(utcDate);
}

/**
 * Check if a reminder's trigger_at is in the past.
 */
export function isPast(utcDate: string): boolean {
  return new Date(utcDate).getTime() < Date.now();
}

/**
 * Check if a date is today in the given timezone.
 */
export function isToday(utcDate: string, timezone?: string): boolean {
  const date = new Date(utcDate);
  const now = new Date();
  const dateStr = date.toLocaleDateString("en-US", { timeZone: timezone });
  const nowStr = now.toLocaleDateString("en-US", { timeZone: timezone });
  return dateStr === nowStr;
}

/**
 * Convert a UTC ISO string to a `datetime-local` input value in the user's timezone.
 *
 * @returns `YYYY-MM-DDTHH:mm` string suitable for `<input type="datetime-local">`.
 */
export function toLocalInputValue(utcISO: string, timezone?: string): string {
  const date = new Date(utcISO);
  // Use Intl to get parts in the target timezone
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/**
 * Convert a `datetime-local` input value to a UTC ISO string.
 *
 * @param localValue - `YYYY-MM-DDTHH:mm` from the input
 * @param timezone - IANA timezone string (e.g., "America/Lima")
 * @returns UTC ISO string for Supabase storage.
 */
export function toUTCISOString(localValue: string, timezone: string): string {
  // Build a date string that Intl can interpret in the target timezone
  // Strategy: create date parts, use Intl to find the UTC offset, then adjust
  const [datePart, timePart] = localValue.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Create a rough UTC date, then use Intl to find the offset
  const rough = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

  // Get the timezone offset by comparing formatted local time to UTC
  const localFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const utcFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Iterate to find the correct UTC time that produces the desired local time
  // Start with assuming the local value IS UTC, then adjust
  const getParts = (fmt: Intl.DateTimeFormat, d: Date) => {
    const p = fmt.formatToParts(d);
    const g = (t: string) => parseInt(p.find((x) => x.type === t)?.value ?? "0", 10);
    return { year: g("year"), month: g("month"), day: g("day"), hour: g("hour"), minute: g("minute") };
  };

  // Compare what `rough` looks like in target timezone vs what we want
  const localParts = getParts(localFmt, rough);
  const utcParts = getParts(utcFmt, rough);

  // Diff in minutes between what we got locally and what we wanted
  const gotMinutes = localParts.hour * 60 + localParts.minute;
  const wantMinutes = hour * 60 + minute;
  let diffMinutes = gotMinutes - wantMinutes;

  // Handle day boundary
  if (localParts.day !== day) {
    diffMinutes += localParts.day > day ? 24 * 60 : -24 * 60;
  }

  // Adjust: subtract the diff to get the correct UTC
  const corrected = new Date(rough.getTime() - diffMinutes * 60 * 1000);
  return corrected.toISOString();
}
