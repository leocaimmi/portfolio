import type { Metadata } from 'next';

import { profile } from '@/content';
import { getPathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

import { clientEnv } from './env/client';

/** Absolute origin of this deployment, without a trailing slash. */
export const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Builds the `<link rel="alternate" hreflang>` set for a route.
 *
 * Both locales are listed alongside an `x-default`, so a search engine knows
 * the two pages are translations of one another rather than duplicates
 * competing for the same query.
 */
export function localeAlternates(pathname: string): Record<string, string> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(getPathname({ href: pathname, locale }))]),
  );

  return {
    ...languages,
    'x-default': absoluteUrl(getPathname({ href: pathname, locale: routing.defaultLocale })),
  };
}

interface PageMetadataOptions {
  locale: Locale;
  title: string;
  description: string;
  /** Locale-agnostic route, e.g. `/`. */
  pathname?: string;
}

/**
 * Assembles the metadata for a page: canonical URL, language alternates, and
 * the Open Graph and Twitter cards.
 *
 * Centralised so a new page cannot ship with a canonical pointing at the
 * wrong origin or with half a social card.
 */
export function buildPageMetadata({
  locale,
  title,
  description,
  pathname = '/',
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(getPathname({ href: pathname, locale }));

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    applicationName: profile.name,
    authors: [{ name: profile.name, url: siteUrl }],
    creator: profile.name,
    alternates: {
      canonical,
      languages: localeAlternates(pathname),
    },
    /*
     * The card image itself is supplied by the `opengraph-image` file
     * convention, which injects its own tags. The middleware is configured to
     * leave those routes alone, so the generated URL resolves directly rather
     * than through a redirect a social scraper would not follow.
     */
    openGraph: {
      type: 'profile',
      siteName: profile.name,
      title,
      description,
      url: canonical,
      locale,
      alternateLocale: routing.locales.filter((candidate) => candidate !== locale),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

/**
 * Structured data describing the site and the person behind it.
 *
 * Two things in one graph, because a search engine is being told two different
 * facts. The `WebSite` node is what a result can call this site: without it,
 * Google falls back to the bare domain, and the result above the title read
 * "leonardocaimmi.com.ar" rather than a name. The `Person` node connects the
 * name, the role and the profiles into one entity instead of leaving it to be
 * inferred from prose, and the site names it as its publisher so the two are
 * read as related rather than as two strangers on the same page.
 *
 * Both are built from the content the page itself renders, so they cannot
 * disagree with it, and both carry an `@id` so the reference between them is a
 * reference and not a repeated copy.
 *
 * Returned as a string destined for a `<script>` element. `JSON.stringify`
 * leaves `<` alone, so a value containing `</script>` would close the element
 * early and everything after it would be parsed as markup. Nothing in this
 * content layer contains one today; escaping it is what keeps that from being a
 * property of the current copy rather than of the code.
 */
export function buildSiteJsonLd(locale: Locale): string {
  const person = `${siteUrl}/#person`;

  const payload = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: profile.name,
        inLanguage: locale,
        publisher: { '@id': person },
      },
      {
        '@type': 'Person',
        '@id': person,
        name: profile.name,
        jobTitle: profile.role[locale],
        description: profile.headline[locale],
        email: `mailto:${profile.email}`,
        url: siteUrl,
        sameAs: profile.socials
          .filter((social) => social.platform !== 'email')
          .map((social) => social.url),
        knowsLanguage: ['es', 'en'],
      },
    ],
  });

  return payload.replace(/</g, '\\u003c');
}
