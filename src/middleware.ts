import createMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  /**
   * Run on page requests only.
   *
   * The negative lookahead skips API routes, Next.js internals, and any path
   * containing a dot, so static assets are served untouched. `[.]` is used
   * instead of an escaped dot to keep the pattern readable inside a string.
   *
   * Metadata images are excluded too. They have no extension, so the dot rule
   * misses them, and under `localePrefix: 'as-needed'` the middleware would
   * redirect `/es/opengraph-image` to the unprefixed path — which breaks the
   * social preview, because a scraper fetching a card image does not follow
   * redirects.
   */
  matcher: '/((?!api|_next|_vercel|.*opengraph-image|.*twitter-image|.*[.].*).*)',
};
