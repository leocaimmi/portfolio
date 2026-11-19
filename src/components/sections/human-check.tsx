'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

/**
 * The public half of the Turnstile pair, read straight from the build.
 *
 * Not through `@/lib/env/client`, which validates it with a schema library the
 * browser would otherwise have to download whole, for one optional string. The
 * server reads the same variable through that module while rendering this page,
 * so a malformed value still fails the build there; here it only has to be
 * present. A literal `process.env` access, so Next.js can inline it.
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** The name Turnstile gives the hidden input it writes the token into. */
export const HUMAN_CHECK_FIELD = 'cf-turnstile-response';

/** The standard widget's fixed width, which it will not shrink below. */
const WIDGET_WIDTH = 300;

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
  if (SITE_KEY === undefined) {
    return null;
  }

  return <TurnstileWidget siteKey={SITE_KEY} />;
}

/**
 * How far below the screen the form may still be when the widget starts
 * loading: about a screen and a half of scroll, which is longer than the
 * script and the challenge take to arrive.
 */
const LOAD_AHEAD = '0px 0px 150% 0px';

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
 *
 * The size is chosen from the room the form actually has. The standard widget
 * is three hundred pixels wide whatever its container, and on a phone narrower
 * than about 380 the form is not: the widget held it open and pushed the whole
 * page past the edge of the screen. The compact one is half as wide and fits
 * any phone.
 */
function TurnstileWidget({ siteKey }: { siteKey: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);
  const [isScriptReady, setIsScriptReady] = useState(false);

  /*
   * The script is not requested until the form is on its way into view.
   *
   * Requested with the page, it arrived with everything a challenge needs —
   * two megabytes from Cloudflare, more than the whole site weighs — and ran it
   * while the hero was still being put together, for a form at the very bottom
   * that most visitors never reach. Its frame also logged a Content Security
   * Policy complaint of its own on every load, which is not ours to fix but
   * was ours to report.
   *
   * Every browser the site supports has IntersectionObserver — the floor in
   * `browserslist` is well above it — so there is no fallback to write.
   */
  useEffect(() => {
    const element = container.current;

    if (element === null || isNear) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: LOAD_AHEAD },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isNear]);

  useEffect(() => {
    const element = container.current;

    if (!isScriptReady || element === null) {
      return;
    }

    const widgetId = window.turnstile?.render(element, {
      sitekey: siteKey,
      theme: 'dark',
      size: element.clientWidth < WIDGET_WIDTH ? 'compact' : 'normal',
    });

    return () => {
      if (widgetId !== undefined) {
        window.turnstile?.remove(widgetId);
      }
    };
  }, [isScriptReady, siteKey]);

  return (
    <>
      {isNear ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => {
            setIsScriptReady(true);
          }}
        />
      ) : null}

      <div ref={container} className="mt-5" />
    </>
  );
}

/** Whether the form should refuse to submit without a solved check. */
export const isHumanCheckEnabled = SITE_KEY !== undefined;
