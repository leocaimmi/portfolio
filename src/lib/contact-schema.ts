import { z } from 'zod';

/** The ceiling every field shares. Nothing sent here needs more room. */
const FIELD_MAX = 500;

/**
 * Field limits, shared by the form and the endpoint.
 *
 * Exported so the inputs can advertise the same `maxLength` the server
 * enforces, instead of letting someone write past the limit and discover it
 * only after pressing send.
 *
 * An address is capped below the shared ceiling because the standard puts a
 * hard bound at 254 characters: anything longer is not a long address, it is
 * not an address.
 */
export const CONTACT_LIMITS = {
  nameMax: FIELD_MAX,
  emailMax: 254,
  messageMin: 20,
  messageMax: FIELD_MAX,
} as const;

/**
 * A name: a letter, then letters, marks, spaces and the punctuation names
 * actually contain.
 *
 * Unicode-aware on purpose — a pattern of `A-Za-z` rejects half the names in
 * the country this is written in. What it does exclude is every control
 * character, and with them the newlines that turn a name interpolated into a
 * subject line into somewhere to put a second header.
 */
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}\p{Zs}'’.-]*$/u;

/**
 * A message: anything printable, plus the whitespace a paragraph is made of.
 *
 * `\p{Cc}` is the C0 and C1 control range. Tab, newline and carriage return
 * are let back in because a message is allowed to have lines in it; the rest
 * of that range has no business in prose and is a reliable sign of something
 * that is not prose.
 */
const MESSAGE_PATTERN = /^(?:[^\p{Cc}]|[\t\n\r])*$/u;

/** At least one letter, so a message cannot be punctuation and nothing else. */
const HAS_LETTER = /\p{L}/u;

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
  name: z.string().trim().min(1).max(CONTACT_LIMITS.nameMax).regex(NAME_PATTERN),
  /*
   * Zod's own address check is a pattern already, and a stricter one written by
   * hand is how valid addresses get turned away — plus signs, subdomains and
   * long suffixes are all legal and all commonly rejected. The length bound is
   * the addition worth making.
   */
  email: z.email().max(CONTACT_LIMITS.emailMax),
  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.messageMin)
    .max(CONTACT_LIMITS.messageMax)
    .regex(MESSAGE_PATTERN)
    .regex(HAS_LETTER),

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
export type ContactErrorKey =
  'required' | 'invalidEmail' | 'invalidCharacters' | 'tooShort' | 'tooLong';

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
    } else if (issue.code === 'invalid_format') {
      errors[field] = 'invalidCharacters';
    } else {
      errors[field] = 'required';
    }
  }

  return errors;
}
