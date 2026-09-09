import { defineRouting } from 'next-intl/routing';

/**
 * Locale contract for the whole site.
 *
 * `localePrefix: 'as-needed'` keeps the Spanish site at the bare origin — the
 * link that gets shared most — while English lives under `/en`. Locale
 * detection still routes an English-speaking visitor to `/en` on first visit.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
