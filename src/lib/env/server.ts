import 'server-only';

import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  /** Transactional email credentials. Absent in local development by design. */
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_INBOX: z.email().optional(),
  CONTACT_SENDER: z.email().optional(),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid server environment.\n${z.prettifyError(parsed.error)}`);
}

/**
 * Server-side configuration, parsed once at module load so a malformed value
 * fails the build instead of surfacing as a 500 in production.
 *
 * The `server-only` import above turns any accidental client import into a
 * build error, which keeps secrets out of the browser bundle.
 */
export const serverEnv = parsed.data;

/**
 * Whether the contact form can actually deliver a message. When false the UI
 * falls back to direct contact links instead of rendering a form that would
 * fail on submit.
 */
export const isContactDeliveryConfigured =
  serverEnv.RESEND_API_KEY !== undefined &&
  serverEnv.CONTACT_INBOX !== undefined &&
  serverEnv.CONTACT_SENDER !== undefined;

export type ServerEnv = z.infer<typeof serverEnvSchema>;
