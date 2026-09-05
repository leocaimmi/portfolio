import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url('NEXT_PUBLIC_SITE_URL must be an absolute URL.'),
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
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
