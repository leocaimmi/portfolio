'use client';

import { useEffect, useState } from 'react';

import { SECTION_IDS } from '@/config/navigation';
import { useActiveSection } from '@/hooks/use-active-section';
import { cn } from '@/lib/cn';

import { SolarSystem } from './solar-system';

/** Fraction of the viewport the reader must pass before the navigator docks. */
const DOCK_THRESHOLD = 0.65;

/**
 * The hero's solar system, shrunk into a persistent corner navigator.
 *
 * Rather than animating one element from the centre of the screen into the
 * corner — which means measuring the viewport and transforming on every frame —
 * this is a second, smaller instance that fades in as the hero scrolls away.
 * The reader reads it as the same object shrinking, and the implementation
 * stays a single opacity transition.
 *
 * While hidden it is `inert`, so it is out of the tab order and out of the
 * accessibility tree; otherwise the page would expose two navigation
 * landmarks listing the same links.
 *
 * Shown from `xl` upwards only. Below that the viewport has no gutter beside
 * the content column, so the navigator would sit on top of running text; the
 * header menu already covers the same ground there. From `xl` it overlaps at
 * most a card's own padding, and clears the content entirely past 1416px.
 */
export function OrbitalNavigator() {
  const activeSection = useActiveSection(SECTION_IDS);
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsDocked(window.scrollY > window.innerHeight * DOCK_THRESHOLD);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      inert={!isDocked}
      className={cn(
        'glass fixed bottom-6 left-6 z-40 hidden rounded-full glass-raised p-2.5 transition-all duration-700 ease-orbital xl:block',
        isDocked
          ? 'translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none translate-y-6 scale-75 opacity-0',
      )}
    >
      <SolarSystem variant="compact" activeId={activeSection} className="w-24 2xl:w-28" />
    </div>
  );
}
