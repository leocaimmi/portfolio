'use client';

import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** A negative bottom margin delays the reveal until the element is properly on screen. */
  rootMargin?: string;
  threshold?: number;
  /** Stop observing after the first intersection. A reveal only needs to happen once. */
  once?: boolean;
}

/**
 * Reports whether an element has entered the viewport.
 *
 * Reveals are driven by a class toggle rather than by scroll listeners, so the
 * browser does the measuring off the main thread.
 *
 * Nothing here is load-bearing: callers must render their content visible and
 * use `inView` only to replay an entrance animation. If IntersectionObserver is
 * missing the flag simply stays false, and the page reads exactly the same
 * without the motion.
 */
export function useInView<T extends Element>({
  rootMargin = '0px 0px -12% 0px',
  threshold = 0,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

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

        setInView(entry.isIntersecting);

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

  return { ref, inView };
}
