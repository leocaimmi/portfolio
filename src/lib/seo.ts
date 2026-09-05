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
 * Structured data describing the author.
 *
 * Lets a search engine connect the name, the role and the profiles into one
 * entity instead of inferring it from prose. Built from the same content the
 * page renders, so the two cannot disagree.
 */
export function buildPersonJsonLd(locale: Locale): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role[locale],
    description: profile.headline[locale],
    email: `mailto:${profile.email}`,
    url: siteUrl,
    sameAs: profile.socials
      .filter((social) => social.platform !== 'email')
      .map((social) => social.url),
    knowsLanguage: ['es', 'en'],
  });
}
