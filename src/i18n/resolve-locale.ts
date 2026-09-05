import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import type { Locale } from './routing';
import { routing } from './routing';

/** The shape Next.js passes to every page and layout under `app/[locale]`. */
export interface LocaleRouteParams {
  locale: string;
}

/**
 * Validates the `[locale]` route segment and opts the subtree into static
 * rendering.
 *
 * Unknown locales render the 404 page rather than silently falling back to the
 * default, which keeps junk URLs out of the search index. The returned value is
 * narrowed to `Locale`, so downstream translation calls stay type checked.
 */
export async function resolveLocale(params: Promise<LocaleRouteParams>): Promise<Locale> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return locale;
}
