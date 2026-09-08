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
 * Public configuration that is inlined into the browser bundle.
 *
 * Every variable is read as a literal `process.env.X` member expression: Next.js
 * only substitutes static accesses at build time, so destructuring `process.env`
 * would silently yield `undefined` in the browser.
 */
export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
