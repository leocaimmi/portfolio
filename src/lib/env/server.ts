import 'server-only';

import { z } from 'zod';

import { profile } from '@/content';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  /** Transactional email credentials. Absent in local development by design. */
  RESEND_API_KEY: z.string().min(1).optional(),
  /** Overrides where messages land. Defaults to the published address. */
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
 * Where a submitted message is delivered.
 *
 * The published address by default: it is already in the content layer and on
 * the page, so requiring it to be configured a second time in the host's
 * dashboard is a way to have the form silently deliver somewhere else. The
 * environment variable is still honoured for anyone who needs it elsewhere.
 */
export const contactInbox = serverEnv.CONTACT_INBOX ?? profile.email;

/**
 * Whether the contact form can actually deliver a message. When false the UI
 * falls back to direct contact links instead of rendering a form that would
 * fail on submit.
 *
 * Only the two values that cannot be inferred are required: the provider's key
 * and the verified address messages are sent from.
 */
export const isContactDeliveryConfigured =
  serverEnv.RESEND_API_KEY !== undefined && serverEnv.CONTACT_SENDER !== undefined;

export type ServerEnv = z.infer<typeof serverEnvSchema>;
