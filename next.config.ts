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
    ]);
  },
};

export default withNextIntl(nextConfig);
