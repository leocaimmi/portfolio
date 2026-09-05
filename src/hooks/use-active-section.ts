'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently closest to the top of the viewport.
 *
 * Used to mark the active navigation link. Sections are observed through a
 * narrow horizontal band near the top of the screen, which keeps the highlight
 * from flickering between two sections that are both partially visible.
 */
export function useActiveSection(sectionIds: readonly string[]): string | undefined {
  // Undefined until a section actually enters the band: at the top of the page
  // the reader is in the hero, and highlighting the first link there would be a
  // lie about where they are.
  const [activeId, setActiveId] = useState<string>();

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

        if (closest) {
          setActiveId(closest[0]);
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
