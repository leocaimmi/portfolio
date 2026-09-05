import type { Messages } from 'next-intl';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

/**
 * Resolves the active locale for every server render and loads its message
 * bundle. Locales are imported dynamically so a visitor only downloads the
 * translations for the language they are actually browsing.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const { default: messages } = (await import(`../../messages/${locale}.json`)) as {
    default: Messages;
  };

  return { locale, messages };
});
