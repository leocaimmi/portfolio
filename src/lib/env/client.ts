import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url('NEXT_PUBLIC_SITE_URL must be an absolute URL.'),
  /**
   * Public half of the Turnstile pair. Absent turns the human check off, and
   * the form falls back to the honeypot, the fill timer and the rate limit.
   * Set it with its secret or not at all: one without the other is a widget
   * nobody checks, or a check nobody can pass.
   */
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
});

/**
 * The origin to assume while developing, and only while developing.
 *
 * Left as a fallback everywhere, a deployment that forgot to set the real one
 * would build happily and publish a sitemap, a set of canonical URLs and a
 * social card all pointing at localhost — wrong in the one way nobody notices
 * until a search engine has already believed it. In production the value is
 * required, and its absence fails the build like any other malformed setting.
 */
const developmentOrigin =
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined;

/**
 * Public configuration that is inlined into the browser bundle.
 *
 * Every variable is read as a literal `process.env.X` member expression: Next.js
 * only substitutes static accesses at build time, so destructuring `process.env`
 * would silently yield `undefined` in the browser.
 */
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? developmentOrigin,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

if (!parsed.success) {
  // This throws during a deploy, where whoever reads it is looking at a build
  // log and cannot ask a follow-up question. So it says what to set, where,
  // and the part that is not obvious: the value is inlined at build time, and
  // saving it in a dashboard does nothing until something rebuilds.
  throw new Error(
    [
      `Invalid public environment.`,
      z.prettifyError(parsed.error),
      '',
      'NEXT_PUBLIC_SITE_URL is the absolute origin this deployment is served from,',
      'with no trailing slash - https://example.com. Set it on the hosting platform',
      'and redeploy. See .env.example for the rest.',
    ].join('\n'),
  );
}

export const clientEnv = parsed.data;

export type ClientEnv = z.infer<typeof clientEnvSchema>;
