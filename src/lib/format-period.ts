import type { Period } from '@/content/schemas';
import type { Locale } from '@/i18n/routing';

/**
 * Formats a `YYYY-MM` string as a localised month and year.
 *
 * The date is constructed from its parts rather than parsed from the string:
 * `new Date('2025-03')` is interpreted as UTC midnight and can render as the
 * previous month for anyone west of Greenwich.
 */
export function formatMonth(month: string, locale: Locale): string {
  const [year, monthIndex] = month.split('-');

  if (year === undefined || monthIndex === undefined) {
    return month;
  }

  const date = new Date(Number(year), Number(monthIndex) - 1, 1);

  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
}

/**
 * Renders a date range, using the caller's localised label for an open end so
 * the word "present" never has to live in the content files.
 */
export function formatPeriod(period: Period, locale: Locale, presentLabel: string): string {
  const start = formatMonth(period.start, locale);
  const end = period.end === null ? presentLabel : formatMonth(period.end, locale);

  return `${start} — ${end}`;
}
