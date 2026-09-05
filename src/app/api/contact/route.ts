import { NextResponse } from 'next/server';

import type { ContactMessage } from '@/lib/contact-schema';
import { contactMessageSchema, MIN_FILL_DURATION_MS } from '@/lib/contact-schema';
import { isContactDeliveryConfigured, serverEnv } from '@/lib/env/server';
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
    to: [serverEnv.CONTACT_INBOX],
    reply_to: message.email,
    subject: `Portfolio · ${message.name}`,
    // Plain text only. Nothing the sender writes is ever interpreted as markup.
    text: [`From: ${message.name} <${message.email}>`, '', message.message].join('\n'),
  };
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
      // Log the status only. The body can quote the submission back at us,
      // and a contact message is personal data that does not belong in logs.
      console.error(`Contact delivery failed with status ${String(response.status)}.`);

      return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
    }
  } catch {
    console.error('Contact delivery threw before reaching the mail provider.');

    return NextResponse.json({ error: 'delivery_failed' }, { status: 502 });
  }

  return new Response(null, { status: 204 });
}
