import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { securityHeaders } from './src/lib/security-headers';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDevelopment = process.env.NODE_ENV === 'development';

/** Read here rather than through the env module: this file runs before it. */
const allowsHumanCheck = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Avoid advertising the framework and its version to potential attackers. */
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  headers() {
    return Promise.resolve([
      {
        // Applied to everything, assets included: a policy with holes in it is
        // not a policy.
        source: '/:path*',
        headers: securityHeaders(isDevelopment, allowsHumanCheck),
      },
      {
        /*
         * Files in `public/` are served with `max-age=0, must-revalidate`, so
         * every visit pays a round trip to be told the artwork has not changed
         * — and the black hole is the largest thing the hero paints.
         *
         * A day of freshness with a month of serving the stale copy while it
         * revalidates, rather than a year of immutability: these URLs carry no
         * content hash, so a year would be a year of no way to change them.
         */
        source: '/:asset(gargantua.svg|favicon.ico|icon.png|apple-icon.png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=2592000',
          },
        ],
      },
    ]);
  },
};

export default withNextIntl(nextConfig);
