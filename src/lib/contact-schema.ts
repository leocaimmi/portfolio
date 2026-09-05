import { z } from 'zod';

/**
 * Field limits, shared by the form and the endpoint.
 *
 * Exported so the inputs can advertise the same `maxLength` the server
 * enforces, instead of letting someone write 3,000 characters and discover the
 * limit only after pressing send.
 */
export const CONTACT_LIMITS = {
  nameMax: 80,
  emailMax: 160,
  messageMin: 20,
  messageMax: 2_000,
} as const;

/**
 * Minimum time a genuine visitor needs to fill the form. Anything faster is
 * almost certainly automated.
 */
export const MIN_FILL_DURATION_MS = 2_500;

/**
 * The contact payload, validated identically on both sides of the wire.
 *
 * Client-side validation is a convenience; the endpoint re-parses everything
 * because a request can always be crafted by hand.
 */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(CONTACT_LIMITS.nameMax),
  email: z.email().max(CONTACT_LIMITS.emailMax),
  message: z.string().trim().min(CONTACT_LIMITS.messageMin).max(CONTACT_LIMITS.messageMax),

  /**
   * Honeypot. The field is hidden from people and stays empty; automated
   * submissions tend to fill in every input they can find.
   *
   * The schema deliberately accepts a filled value instead of rejecting it.
   * A rejection would answer a bot with a 400 that says "this payload was
   * wrong"; letting it through means the endpoint can drop the message and
   * reply 204, which looks exactly like success and teaches nothing. The bound
   * only stops an oversized string from reaching the handler.
   */
  website: z.string().max(200).optional(),

  /**
   * Milliseconds between the form appearing and being submitted. Trivially
   * forged on its own, which is why it only ever supplements the honeypot and
   * the rate limit rather than standing in for them.
   */
  elapsedMs: z.number().int().nonnegative(),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export type ContactField = 'name' | 'email' | 'message';

/** Translation keys under `contact.form` used to report a field error. */
export type ContactErrorKey = 'required' | 'invalidEmail' | 'tooShort' | 'tooLong';

/**
 * Maps validation issues onto localised message keys.
 *
 * Zod's own messages are English and developer-facing; the form needs the
 * visitor's language, so only the key travels and the copy is resolved from
 * the message catalogue.
 */
export function toFieldErrors(error: z.ZodError): Partial<Record<ContactField, ContactErrorKey>> {
  const errors: Partial<Record<ContactField, ContactErrorKey>> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (field !== 'name' && field !== 'email' && field !== 'message') {
      continue;
    }

    if (errors[field] !== undefined) {
      continue;
    }

    if (issue.code === 'too_big') {
      errors[field] = 'tooLong';
    } else if (field === 'email') {
      errors.email = 'invalidEmail';
    } else if (field === 'message' && issue.code === 'too_small') {
      errors.message = 'tooShort';
    } else {
      errors[field] = 'required';
    }
  }

  return errors;
}
