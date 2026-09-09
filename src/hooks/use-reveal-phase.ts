'use client';

import { useEffect, useRef, useState } from 'react';

import type { RevealPhase } from '@/lib/reveal-phase';
import { nextRevealPhase } from '@/lib/reveal-phase';

interface UseRevealPhaseOptions {
  /** A negative bottom margin holds the reveal back until the element is properly on screen. */
  rootMargin?: string;
  threshold?: number;
  /** Stop observing once it has arrived. A reveal only needs to happen once. */
  once?: boolean;
}

/**
 * Watches an element and reports how it reached the screen.
 *
 * Reveals are driven by a class toggle rather than by scroll listeners, so the
 * browser does the measuring off the main thread. What to make of each sighting
 * is decided in `nextRevealPhase`, which is where the reasoning lives.
 *
 * Nothing here is load-bearing. Without IntersectionObserver the phase stays
 * `unobserved` for good, and the page reads exactly the same without the motion.
 */
export function useRevealPhase<T extends Element>({
  rootMargin = '0px 0px -12% 0px',
  threshold = 0,
  once = true,
}: UseRevealPhaseOptions = {}) {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<RevealPhase>('unobserved');

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        const box = entry.boundingClientRect;

        setPhase((previous) =>
          nextRevealPhase(previous, {
            intersecting: entry.isIntersecting,
            top: box.top,
            bottom: box.bottom,
            fold: document.documentElement.clientHeight,
          }),
        );

        if (entry.isIntersecting && once) {
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once, rootMargin, threshold]);

  return { ref, phase };
}
