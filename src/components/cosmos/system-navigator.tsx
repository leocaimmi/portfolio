'use client';

import { useTranslations } from 'next-intl';
import { memo, useEffect, useRef, useState } from 'react';

import { useActiveSection } from '@/hooks/use-active-section';
import { cn } from '@/lib/cn';
import { subscribeToFrames } from '@/lib/reading-position';

import { SolarSystem } from './solar-system';

/** Fraction of the viewport the reader passes before the navigator comes up. */
const DOCK_THRESHOLD = 0.65;

/** Depth is reported in whole decametres, so the readout is not a slot machine. */
const DEPTH_STEP = 10;

/**
 * Docked chart of the system, doubling as a depth gauge.
 *
 * It is the same schematic as the hero, shrunk: the planets keep their fixed
 * positions here, because a target you are meant to hit precisely should not
 * also be moving. What changes is that arriving in a new section fires a single
 * sonar sweep, which lights the planet you have just reached.
 *
 * The sweep runs once per arrival rather than looping. A scope that sweeps
 * forever is ambient noise; one that sweeps on arrival is reporting something.
 * It is replayed by remounting on a key, which is the only reliable way to
 * restart a CSS animation.
 *
 * Shown from `xl` upwards: below that there is no gutter beside the content
 * column to put it in, and the header menu already covers the same ground.
 */
export function SystemNavigator() {
  const t = useTranslations('nav');
  const readout = useTranslations('radar');
  const activeSection = useActiveSection();

  const [isDocked, setIsDocked] = useState(false);

  // Incremented on every arrival, and used as the sweep's key so the animation
  // restarts from the beginning instead of being ignored as already-running.
  const [sweepId, setSweepId] = useState(0);
  const previousSection = useRef(activeSection);

  useEffect(() => {
    if (previousSection.current === activeSection) {
      return;
    }

    previousSection.current = activeSection;
    setSweepId((id) => id + 1);
  }, [activeSection]);

  // Setting the same boolean again is a no-op in React, so this costs a render
  // on the two frames the navigator actually docks or undocks, not on every
  // frame of the scroll that carries it there.
  useEffect(
    () =>
      subscribeToFrames(({ scrollY, viewportHeight }) => {
        setIsDocked(scrollY > viewportHeight * DOCK_THRESHOLD);
      }),
    [],
  );

  return (
    <div
      inert={!isDocked}
      className={cn(
        'glass fixed bottom-6 left-6 z-40 hidden w-36 rounded-3xl glass-raised p-3 transition-all duration-700 ease-orbital xl:block',
        isDocked
          ? 'translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none translate-y-6 scale-90 opacity-0',
      )}
    >
      <div className="relative overflow-hidden rounded-full border border-star/20 bg-void/50">
        <SolarSystem compact activeId={activeSection} />

        {sweepId > 0 ? (
          <div key={sweepId} aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span
              className="absolute inset-0 animate-sonar-sweep rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, rgb(34 211 238 / 0.45) 0deg, rgb(34 211 238 / 0) 62deg)',
                maskImage: 'radial-gradient(circle at center, #000 10%, transparent 84%)',
              }}
            />
            <span className="absolute inset-0 animate-sonar-pulse rounded-full border border-star/60" />
          </div>
        ) : null}
      </div>

      <p className="mt-3 font-mono text-[0.625rem] tracking-[0.16em] text-solar uppercase">
        {activeSection ? t(activeSection) : readout('scanning')}
      </p>

      <DepthReadout />
    </div>
  );
}

/**
 * The depth and progress gauge, written straight to the DOM.
 *
 * These two numbers change on almost every frame of a scroll, and rendering
 * them through React meant re-rendering the whole navigator — schematic
 * included — a few hundred times to move a counter. Memoised with no props, so
 * React mounts it once and never touches its text again; the subscription owns
 * the content from then on.
 */
const DepthReadout = memo(function DepthReadout() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(
    () =>
      subscribeToFrames(({ scrollY, progress }) => {
        const node = ref.current;

        if (!node) {
          return;
        }

        const depth = Math.round(scrollY / DEPTH_STEP) * DEPTH_STEP;
        const percent = Math.round(progress * 100);

        node.textContent = `Y ${String(depth).padStart(5, '0')} · ${String(percent).padStart(2, '0')}%`;
      }),
    [],
  );

  return (
    <p ref={ref} className="mt-1 font-mono text-[0.5625rem] tracking-[0.1em] text-dust uppercase" />
  );
});
