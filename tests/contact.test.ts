import { describe, expect, it } from 'vitest';

import {
  CONTACT_LIMITS,
  contactMessageSchema,
  MIN_FILL_DURATION_MS,
  toFieldErrors,
} from '@/lib/contact-schema';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'A message comfortably over the minimum length required by the schema.',
  elapsedMs: MIN_FILL_DURATION_MS * 2,
};

describe('contact payload', () => {
  it('accepts a well-formed message', () => {
    expect(contactMessageSchema.safeParse(valid).success).toBe(true);
  });

  it('trims before measuring length, so whitespace cannot pad a message', () => {
    const padded = { ...valid, message: `   ${'x'.repeat(CONTACT_LIMITS.messageMin - 5)}   ` };

    expect(contactMessageSchema.safeParse(padded).success).toBe(false);
  });

  it('rejects a message beyond the maximum', () => {
    const tooLong = { ...valid, message: 'x'.repeat(CONTACT_LIMITS.messageMax + 1) };

    expect(contactMessageSchema.safeParse(tooLong).success).toBe(false);
  });

  it('rejects a malformed address', () => {
    expect(contactMessageSchema.safeParse({ ...valid, email: 'not-an-address' }).success).toBe(
      false,
    );
  });

  /*
   * The honeypot must parse rather than fail. Rejecting it would answer an
   * automated sender with a 400 that says "this payload was wrong"; letting it
   * through lets the endpoint reply 204, which looks exactly like success.
   */
  it('accepts a filled honeypot so the endpoint can answer it silently', () => {
    const result = contactMessageSchema.safeParse({ ...valid, website: 'https://spam.example' });

    expect(result.success).toBe(true);
  });
});

describe('field error mapping', () => {
  const errorsFor = (payload: Record<string, unknown>) => {
    const result = contactMessageSchema.safeParse(payload);

    if (result.success) {
      throw new Error('Expected the payload to fail validation.');
    }

    return toFieldErrors(result.error);
  };

  it('reports an empty form field by field', () => {
    const errors = errorsFor({ name: '', email: '', message: '', elapsedMs: 0 });

    expect(errors.name).toBe('required');
    expect(errors.email).toBe('invalidEmail');
    expect(errors.message).toBe('tooShort');
  });

  it('distinguishes too long from too short', () => {
    expect(
      errorsFor({ ...valid, message: 'x'.repeat(CONTACT_LIMITS.messageMax + 1) }).message,
    ).toBe('tooLong');
    expect(errorsFor({ ...valid, message: 'short' }).message).toBe('tooShort');
  });

  it('keeps the first error per field rather than the last', () => {
    const errors = errorsFor({ ...valid, name: 'x'.repeat(CONTACT_LIMITS.nameMax + 1) });

    expect(errors.name).toBe('tooLong');
  });
});
