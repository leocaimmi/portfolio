/**
 * HTTP security headers, applied to every response from `next.config.ts`.
 *
 * Kept here rather than inline in the config so the reasoning has room to live
 * next to the values, and so the policy can be asserted in tests.
 */

interface SecurityHeader {
  key: string;
  value: string;
}

/**
 * Content Security Policy.
 *
 * `script-src` includes `'unsafe-inline'`, which deserves an explanation
 * rather than a silent pass. Next.js emits a small inline bootstrap script
 * into every prerendered page. Allowing it needs either a nonce or a hash;
 * a nonce has to be minted per request, which means reading request headers
 * during render, which opts every page out of static generation. For a site
 * whose pages are pure content, giving up prerendering is a worse trade than
 * this directive.
 *
 * What that concession costs is bounded: the site renders no user-supplied
 * content anywhere. The only input it accepts is the contact form, whose
 * values travel to an inbox and are never echoed back into a page. Every other
 * directive stays locked down — no framing, no plugins, no base-tag hijacking,
 * forms may only post to this origin, and there is not a single external
 * script, style or font origin to allow, because everything is self-hosted.
 *
 * If the site ever renders something a stranger wrote, this is the first
 * decision to revisit.
 */
function buildContentSecurityPolicy(isDevelopment: boolean): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'base-uri': ["'none'"],
    'object-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'manifest-src': ["'self'"],
  };

  if (isDevelopment) {
    // React Fast Refresh compiles components at runtime and the dev server
    // pushes updates over a websocket. Neither exists in a production build.
    directives['script-src']?.push("'unsafe-eval'");
    directives['connect-src']?.push('ws:');
  }

  const policy = Object.entries(directives)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');

  return isDevelopment ? policy : `${policy}; upgrade-insecure-requests`;
}

export function securityHeaders(isDevelopment: boolean): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    {
      key: 'Content-Security-Policy',
      value: buildContentSecurityPolicy(isDevelopment),
    },
    {
      /** Belt and braces alongside `frame-ancestors`, for older browsers. */
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      /** Stops a browser guessing a MIME type and executing an asset as script. */
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      /** Send the full URL to ourselves, only the origin to anyone else. */
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      /** Nothing here needs a camera, a microphone or a location. */
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    },
    {
      /** Isolates the browsing context from windows it opens or is opened by. */
      key: 'Cross-Origin-Opener-Policy',
      value: 'same-origin',
    },
  ];

  if (!isDevelopment) {
    headers.push({
      /**
       * Two years, subdomains included, and eligible for the preload list.
       * Only sent in production: pinning HTTPS for `localhost` would make
       * every other local project on the machine unreachable over HTTP.
       */
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }

  return headers;
}
