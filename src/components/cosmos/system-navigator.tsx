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
        'glass fixed bottom-6 left-6 z-40 hidden w-40 rounded-3xl glass-raised p-3 transition-all duration-700 ease-orbital xl:block',
        isDocked
          ? 'translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none translate-y-6 scale-90 opacity-0',
      )}
    >
      <div className="relative overflow-hidden rounded-full border border-star/20 bg-void/50">
        <SolarSystem activeId={activeSection} />

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

      <DescentGauge label={readout('horizon')} />
    </div>
  );
}

/** Base classes for the two parts the gauge recolours as the hole closes. */
const READING =
  'font-mono text-[0.625rem] tabular-nums transition-colors duration-700 ease-orbital';
const BAR = 'block h-full origin-left transition-colors duration-700 ease-orbital';

/**
 * Nominal, caution, critical: the three states an instrument has.
 *
 * Bands rather than a continuous ramp, because the palette has three tones that
 * mean those three things and a gradient between them passes through colours
 * that mean nothing. Crossing a band is also the only moment anything has to be
 * written to the DOM.
 */
const BANDS = [
  { until: 0.55, reading: 'text-star', bar: 'bg-star' },
  { until: 0.85, reading: 'text-solar', bar: 'bg-solar' },
  { until: Infinity, reading: 'text-comet', bar: 'bg-comet' },
] as const;

function bandAt(progress: number): number {
  return BANDS.findIndex((band) => progress < band.until);
}

/**
 * How far the reader has left before the hole has them, written straight to the
 * DOM.
 *
 * Distance and depth change on almost every frame of a scroll, and rendering
 * them through React meant re-rendering the whole navigator — chart included —
 * a few hundred times to move a counter. Memoised with no props but the label,
 * so React mounts it once and never touches its numbers again; the subscription
 * owns them from then on, and each of the three writes is guarded by the value
 * that would change it.
 *
 * Hidden from assistive technology on purpose. It is an instrument reading of
 * the scroll position, which a screen reader already knows better than this
 * does, and announcing it on every step would be noise over the navigation it
 * sits inside.
 */
const DescentGauge = memo(function DescentGauge({ label }: { label: string }) {
  const readingRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const depthRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let lastBand = -1;
    let lastRemaining = -1;
    let lastDepth = -1;

    return subscribeToFrames(({ scrollY, progress }) => {
      const bar = barRef.current;
      const reading = readingRef.current;
      const depthNode = depthRef.current;

      if (!bar || !reading || !depthNode) {
        return;
      }

      // A transform, so the bar is the compositor's problem and not layout's.
      bar.style.transform = `scaleX(${String(1 - progress)})`;

      const band = bandAt(progress);

      if (band !== lastBand) {
        lastBand = band;
        reading.className = `${READING} ${BANDS[band]?.reading ?? ''}`;
        bar.className = `${BAR} ${BANDS[band]?.bar ?? ''}`;
      }

      const remaining = Math.round((1 - progress) * 100);

      if (remaining !== lastRemaining) {
        lastRemaining = remaining;
        reading.textContent = `${String(remaining).padStart(2, '0')}%`;
      }

      const depth = Math.round(scrollY / DEPTH_STEP) * DEPTH_STEP;

      if (depth !== lastDepth) {
        lastDepth = depth;
        depthNode.textContent = `Y ${String(depth).padStart(5, '0')}`;
      }
    });
  }, []);

  return (
    <div aria-hidden="true" className="mt-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[0.5625rem] tracking-[0.14em] text-dust uppercase">
          {label}
        </span>
        <span ref={readingRef} className={`${READING} text-star`}>
          100%
        </span>
      </div>

      <span className="mt-1.5 block h-px w-full bg-horizon/70">
        <span ref={barRef} className={`${BAR} bg-star`} />
      </span>

      <p
        ref={depthRef}
        className="mt-1.5 font-mono text-[0.5rem] tracking-[0.14em] text-dust uppercase tabular-nums"
      >
        Y 00000
      </p>
    </div>
  );
});
