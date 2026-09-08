import { NextResponse } from 'next/server';

import type { ContactMessage } from '@/lib/contact-schema';
import { contactMessageSchema, MIN_FILL_DURATION_MS } from '@/lib/contact-schema';
import { contactInbox, isContactDeliveryConfigured, serverEnv } from '@/lib/env/server';
import { createRateLimiter } from '@/lib/rate-limit';

/** Five submissions per address per hour is generous for a personal inbox. */
const checkRateLimit = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

const MAX_BODY_BYTES = 8 * 1024;

/**
 * Best-effort client address for rate limiting.
 *
 * Forwarded headers are set by the hosting proxy and are only trustworthy
 * because nothing reaches this handler except through it. They are used solely
 * to bucket rate-limit counters — never for authorisation — so a spoofed value
 * costs the sender their own quota and nothing else.
 */
function clientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  return request.headers.get('x-real-ip') ?? 'unknown';
}

function buildEmail(message: ContactMessage) {
  return {
    from: serverEnv.CONTACT_SENDER,
    to: [contactInbox],
    reply_to: message.email,
    subject: `Portfolio · ${message.name}`,
    // Plain text only. Nothing the sender writes is ever interpreted as markup.
    text: [`From: ${message.name} <${message.email}>`, '', message.message].join('\n'),
  };
}

/**
 * Asks Cloudflare whether the token in front of it is one they issued.
 *
 * The token is worthless on its own: it is Cloudflare that knows whether a
 * challenge was solved, so it is Cloudflare that is asked. A failure here is
 * answered with a status the form can act on rather than the silence given to
 * the honeypot — a person whose challenge expired deserves to be told, where a
 * bot that filled a hidden field does not.
 */
async function passesHumanCheck(token: string | undefined, address: string): Promise<boolean> {
  const secret = serverEnv.TURNSTILE_SECRET_KEY;

  if (secret === undefined) {
    return true;
  }

  if (token === undefined || token.length === 0) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });

  if (address !== 'unknown') {
    body.set('remoteip', address);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });

    const result: unknown = await response.json();

    return (
      typeof result === 'object' &&
      result !== null &&
      (result as { success?: unknown }).success === true
    );
  } catch {
    console.error('The human check could not be reached.');

    return false;
  }
}

/**
 * Pulls the provider's error name and message out of a failed response.
 *
 * Deliberately narrow: two known fields, each bounded, and nothing if the body
 * is not the shape expected. Whatever else the response carries stays out.
 */
async function readProviderError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (typeof body !== 'object' || body === null) {
      return '';
    }

    const { name, message } = body as { name?: unknown; message?: unknown };
    const parts = [name, message]
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.slice(0, 200));

    return parts.length > 0 ? `Provider said: ${parts.join(' - ')}` : '';
  } catch {
    return '';
  }
}

/**
 * Contact endpoint.
 *
 * Layered on purpose, cheapest check first: configuration, then size, then
 * rate limit, then schema, then the bot heuristics. Every failure answers with
 * a bare status code — the response never explains which check rejected the
 * request, and never echoes the submitted values back.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isContactDeliveryConfigured) {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');

  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
  }

  const rateLimit = checkRateLimit(clientKey(request));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const parsed = contactMessageSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const message = parsed.data;

  /*
   * Bot heuristics. Both answer 204 rather than an error: a rejection tells an
   * automated sender exactly what to change, while silence does not.
   */
  if (message.website !== undefined && message.website.length > 0) {
    return new Response(null, { status: 204 });
  }

  if (message.elapsedMs < MIN_FILL_DURATION_MS) {
    return new Response(null, { status: 204 });
  }

  if (!(await passesHumanCheck(message.turnstileToken, clientKey(request)))) {
    return NextResponse.json({ error: 'human_check_failed' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serverEnv.RESEND_API_KEY ?? ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildEmail(message)),
    });

    if (!response.ok) {
      /*
       * The provider's own complaint, and nothing else.
       *
       * Logging the status alone made a misconfiguration undiagnosable: a 403
       * says the send was refused but not that the sender's domain is
       * unverified, which is the only thing the operator can act on. Only the
       * error's name and message are taken, never the body wholesale — a
       * contact message is personal data and does not belong in a log.
       */
      const reason = await readProviderError(response);

      console.error(
        `Contact delivery failed with status ${String(response.status)}. ${reason}`.trim(),
      );

      return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
    }
  } catch {
    console.error('Contact delivery threw before reaching the mail provider.');

    return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
  }

  return new Response(null, { status: 204 });
}
