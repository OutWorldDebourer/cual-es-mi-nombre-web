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
