'use client';

import Script from 'next/script';

import { clientEnv } from '@/lib/env/client';

/** The name Turnstile gives the hidden input it writes the token into. */
export const HUMAN_CHECK_FIELD = 'cf-turnstile-response';

/**
 * Cloudflare Turnstile, rendered inside the contact form.
 *
 * This is a deliberate reversal of an earlier decision. The form used to defend
 * itself with a honeypot, a fill timer and a rate limit precisely so that no
 * third-party script had to run on the page and no visitor data had to reach
 * anyone else. Those three are still here and still do most of the work; what
 * they cannot do is tell a patient script from a person, and a public inbox is
 * eventually found by patient scripts.
 *
 * Turnstile is the version of that trade worth making: it sets no tracking
 * cookie and asks the visitor to do nothing unless it is unsure, in which case
 * the widget appears. Absent a site key it renders nothing at all, and the form
 * behaves exactly as it did before.
 *
 * Left to the script rather than driven through its JavaScript API: given an
 * element of this class it renders the widget and writes the token into a
 * hidden input of its own, which is already how the rest of the form is read.
 */
export function HumanCheck() {
  const siteKey = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (siteKey === undefined) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />

      <div
        className="cf-turnstile mt-5"
        data-sitekey={siteKey}
        data-theme="dark"
        // Shown only when Cloudflare wants the visitor to do something. Most
        // people never see it; the token is issued either way.
        data-appearance="interaction-only"
      />
    </>
  );
}

/** Whether the form should refuse to submit without a solved check. */
export const isHumanCheckEnabled = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== undefined;
