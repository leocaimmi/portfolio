'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently closest to the top of the viewport.
 *
 * Generic over the id union, so a caller passing a literal tuple gets a
 * narrowed result back and can hand it straight to a translation lookup
 * without a cast.
 *
 * Sections are observed through a narrow horizontal band near the top of the
 * screen, which stops the highlight flickering between two sections that are
 * both partly visible.
 */
export function useActiveSection<T extends string>(sectionIds: readonly T[]): T | undefined {
  // Undefined until a section actually enters the band: at the top of the page
  // the reader is in the hero, and highlighting the first link there would be a
  // lie about where they are.
  const [activeId, setActiveId] = useState<T>();

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }

        const closest = [...visible.entries()].sort(
          ([, aTop], [, bTop]) => Math.abs(aTop) - Math.abs(bTop),
        )[0];

        if (!closest) {
          return;
        }

        // Resolved back through the caller's list so the state stays typed as
        // one of their ids rather than an arbitrary DOM id.
        const matched = sectionIds.find((id) => id === closest[0]);

        if (matched !== undefined) {
          setActiveId(matched);
        }
      },
      // Only the band between 20% and 40% from the top counts as "active".
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return activeId;
}
