'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

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
 * cookie and asks the visitor to do nothing unless it is unsure. Absent a site
 * key it renders nothing at all, and the form behaves exactly as it did before.
 *
 * The widget is left visible rather than hidden until needed. It costs a band
 * of Cloudflare's chrome under the message field, and it buys the one thing an
 * invisible check cannot: the visitor can see that the form is protected, and
 * that the protection passed. A form that silently decides whether to trust you
 * is worse to use than one that shows its work.
 */
export function HumanCheck() {
  const siteKey = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (siteKey === undefined) {
    return null;
  }

  return <TurnstileWidget siteKey={siteKey} />;
}

/**
 * Split out so the hooks below only run where there is a key to render with:
 * they cannot sit behind the early return above, and the alternative — running
 * them anyway and asserting the key is there — trades a structural guarantee
 * for a `!`.
 *
 * Rendered through Turnstile's JavaScript API rather than left to the script's
 * own sweep. That sweep happens once, when the script loads: it finds every
 * `.cf-turnstile` in the document, draws into each, and never looks again.
 * Switching language re-mounts this component with a fresh, empty container
 * long after the sweep is over, so the widget disappeared and only a reload
 * brought it back — the form then refusing to submit for want of a token that
 * nothing was left to issue.
 *
 * The widget's whole life is one effect: it draws on the way in and is
 * discarded on the way out, which is also what stops Cloudflare's token-refresh
 * timer ticking against a container that has left the page. Anything less
 * balanced breaks under React's development remount, where an effect is run,
 * undone and run again on purpose to find exactly this.
 *
 * `onReady` is what makes that effect fire at the right moment: `next/script`
 * calls it once the script has run, and again on every later mount, cached
 * script and all.
 */
function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  useEffect(() => {
    const element = container.current;

    if (!isScriptReady || element === null) {
      return;
    }

    const widgetId = window.turnstile?.render(element, { sitekey: siteKey, theme: 'dark' });

    return () => {
      if (widgetId !== undefined) {
        window.turnstile?.remove(widgetId);
      }
    };
  }, [isScriptReady, siteKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />

      <div ref={container} className="mt-5" />
    </>
  );
}

/** Whether the form should refuse to submit without a solved check. */
export const isHumanCheckEnabled = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== undefined;
