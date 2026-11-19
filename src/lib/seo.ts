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
 * The picture a search result should show beside this site.
 *
 * Not the social card. That one is mostly words at 1200×630, and Google crops
 * its thumbnail to a small square: what survived was half a headline and a
 * paragraph nobody could read. Its own guidance asks for the opposite — an image
 * representative of the page, without text, and not at an extreme aspect ratio.
 * So this is the black hole from the hero, rendered square on the page's own
 * void and nebulae, and served from `public/` at an address that stays put.
 */
export const searchPreview = {
  path: '/search-preview.jpg',
  width: 1200,
  height: 1200,
} as const;

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
    /*
     * Declared here, from files in `public/`, rather than left to the `app/`
     * file convention. That convention appends a build hash to every icon URL,
     * and Google asks for a favicon at an address that stays put: a new one on
     * every deploy is one way a site ends up with a globe beside its name in
     * the results instead of its own mark. It also emits its own link tags,
     * which alongside these would be two links to one icon at two URLs.
     */
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: { url: '/apple-icon.png', sizes: '180x180' },
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
 * "leonardocaimmi.com.ar" rather than a name. Declaring the name was not enough
 * on its own: months later the result still showed the domain, which is what
 * Google's guide says happens when it is not confident in the preferred name.
 * The first remedy it lists is an `alternateName`, which it weighs heavily in
 * exactly that case, so the node carries the shorter name too.
 *
 * The `Person` node connects the name, the role and the profiles into one
 * entity instead of leaving it to be inferred from prose, and the site names it
 * as its publisher so the two are read as related rather than as two strangers
 * on the same page.
 *
 * The `WebPage` node is the page in the reader's language, and it exists to say
 * one thing: which picture stands for it. `primaryImageOfPage` is the first of
 * the sources Google lists for choosing a result's thumbnail, and it points at
 * `searchPreview` rather than leaving the choice to the text-heavy social card.
 * It lives in this graph, rendered by the layout, because the site is a single
 * page; the layout and the home page are the same document.
 *
 * All of it is built from the content the page itself renders, so it cannot
 * disagree with it, and every node carries an `@id` so the references between
 * them are references and not repeated copies.
 *
 * The site and the person point at the home page as `https://host/`, with the
 * slash. That is the form Google's site-name guide asks for — the canonical
 * home page, written the way its own examples write it — and the form every
 * crawler normalises the bare origin to anyway, so the name is declared for the
 * URL it is read from.
 *
 * Returned as a string destined for a `<script>` element. `JSON.stringify`
 * leaves `<` alone, so a value containing `</script>` would close the element
 * early and everything after it would be parsed as markup. Nothing in this
 * content layer contains one today; escaping it is what keeps that from being a
 * property of the current copy rather than of the code.
 */
export function buildSiteJsonLd(locale: Locale): string {
  const home = absoluteUrl('/');
  const page = absoluteUrl(getPathname({ href: '/', locale }));
  const website = `${home}#website`;
  const person = `${home}#person`;
  const image = `${home}#search-preview`;

  const payload = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': website,
        url: home,
        name: profile.name,
        alternateName: [profile.shortName],
        inLanguage: locale,
        publisher: { '@id': person },
      },
      {
        '@type': 'WebPage',
        '@id': `${page}#webpage`,
        url: page,
        inLanguage: locale,
        isPartOf: { '@id': website },
        about: { '@id': person },
        primaryImageOfPage: { '@id': image },
      },
      {
        '@type': 'ImageObject',
        '@id': image,
        url: absoluteUrl(searchPreview.path),
        contentUrl: absoluteUrl(searchPreview.path),
        width: searchPreview.width,
        height: searchPreview.height,
      },
      {
        '@type': 'Person',
        '@id': person,
        name: profile.name,
        jobTitle: profile.role[locale],
        description: profile.headline[locale],
        email: `mailto:${profile.email}`,
        url: home,
        sameAs: profile.socials
          .filter((social) => social.platform !== 'email')
          .map((social) => social.url),
        knowsLanguage: ['es', 'en'],
      },
    ],
  });

  return payload.replace(/</g, '\\u003c');
}
