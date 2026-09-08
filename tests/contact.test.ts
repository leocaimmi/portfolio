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

  it('holds every field to the same ceiling', () => {
    expect(CONTACT_LIMITS.nameMax).toBe(500);
    expect(CONTACT_LIMITS.messageMax).toBe(500);
    // Below the shared ceiling: the standard's own hard bound on an address.
    expect(CONTACT_LIMITS.emailMax).toBe(254);

    for (const field of ['name', 'message'] as const) {
      const atLimit = { ...valid, [field]: 'a'.repeat(500) };
      const past = { ...valid, [field]: 'a'.repeat(501) };

      expect(contactMessageSchema.safeParse(atLimit).success).toBe(true);
      expect(contactMessageSchema.safeParse(past).success).toBe(false);
    }
  });

  /*
   * Names are not ASCII. A pattern allowing only A-Z turns away most of the
   * people this form exists for, so the rule is Unicode-aware and excludes
   * control characters rather than alphabets.
   */
  it.each([
    'Ada Lovelace',
    'Ángela Ruiz Robles',
    "O'Neill",
    'Иван Петров',
    '山田 太郎',
    'Jean-Luc Picard',
    'Ada M. Byron',
  ])('accepts %s as a name', (name) => {
    expect(contactMessageSchema.safeParse({ ...valid, name }).success).toBe(true);
  });

  /*
   * The newline is the one that matters: the name is interpolated into the
   * subject line, and a second line there is somewhere to put a header.
   */
  it.each([
    ['a newline', 'Ada\nBcc: someone@example.com'],
    ['a carriage return', 'Ada\rSubject: other'],
    ['a tab', 'Ada\tLovelace'],
    ['markup', '<script>alert(1)</script>'],
    ['a leading digit', '1337'],
  ])('rejects %s in a name', (_label, name) => {
    expect(contactMessageSchema.safeParse({ ...valid, name }).success).toBe(false);
  });

  it('lets a message have paragraphs but not control characters', () => {
    const paragraphs = { ...valid, message: 'First line.\n\nSecond line, after a blank one.' };
    // Built rather than typed: a literal control character in a source file is
    // invisible to whoever reads it next.
    const control = {
      ...valid,
      message: `A message with a null ${String.fromCodePoint(0)} in the middle of it.`,
    };

    expect(contactMessageSchema.safeParse(paragraphs).success).toBe(true);
    expect(contactMessageSchema.safeParse(control).success).toBe(false);
  });

  it('rejects a message with no letters in it at all', () => {
    const punctuation = { ...valid, message: '!!! ??? ... --- ... ??? !!! ... --- !!!' };

    expect(contactMessageSchema.safeParse(punctuation).success).toBe(false);
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
