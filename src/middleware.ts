import createMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  /**
   * Run on page requests only. The negative lookahead skips API routes, Next.js
   * internals and any path containing a dot, so static assets are served
   * untouched. `[.]` is used instead of an escaped dot to keep the pattern
   * readable inside a string literal.
   */
  matcher: '/((?!api|_next|_vercel|.*[.].*).*)',
};
