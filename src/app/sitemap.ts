import type { MetadataRoute } from 'next';

import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { absoluteUrl, localeAlternates } from '@/lib/seo';

/**
 * One entry per locale, each declaring the other as an alternate.
 *
 * The site is a single page, so the sitemap's job here is not discovery but
 * telling a crawler that the Spanish and English versions are translations
 * rather than duplicate content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: absoluteUrl(getPathname({ href: '/', locale })),
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: { languages: localeAlternates('/') },
  }));
}
