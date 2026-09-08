'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import { subscribeToFrames } from '@/lib/reading-position';

/** Fraction of the viewport the reader passes before the way back appears. */
const SHOW_AFTER = 0.65;

/**
 * The way back to the top, for screens with no docked chart.
 *
 * Above the breakpoint the chart in the corner already has a star at its centre
 * that leads home, so this only exists below it. It is a real anchor to the top
 * of the document rather than a button that scrolls: it works with no
 * JavaScript, and it is announced as a link to somewhere.
 *
 * It appears at the same point the chart would have, off the same measurement
 * of the scroll everything else on the page reads — one listener for the site,
 * and setting the same boolean twice costs nothing in React.
 */
export function BackToTop() {
  const t = useTranslations('footer');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(
    () =>
      subscribeToFrames(({ scrollY, viewportHeight }) => {
        setIsVisible(scrollY > viewportHeight * SHOW_AFTER);
      }),
    [],
  );

  return (
    <a
      href="#top"
      inert={!isVisible}
      className={cn(
        'glass fixed right-5 bottom-5 z-40 grid size-12 place-items-center rounded-full glass-raised transition-all duration-500 ease-orbital xl:hidden',
        isVisible
          ? 'translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none translate-y-4 scale-90 opacity-0',
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 text-starlight"
      >
        <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />
      </svg>

      <span className="sr-only">{t('backToTop')}</span>
    </a>
  );
}
