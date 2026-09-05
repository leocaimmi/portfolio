'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import type { SectionId } from '@/config/navigation';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

import { drawBlackHole, drawPlanet, drawStar, drawTrail } from './draw-scene';
import type { Palette } from './palette';
import { readPalette } from './palette';
import type { ScenePoint } from './scene-geometry';
import { isInFront, planetPosition, PLANETS } from './scene-geometry';

/** Seconds of history kept behind each planet. */
const TRAIL_SECONDS = 11;
const TRAIL_SECONDS_COMPACT = 6;

/** How often a trail point is recorded. Below the frame rate, and plenty smooth. */
const SAMPLE_INTERVAL = 1 / 24;

/**
 * Leftward drift applied to trail history, as a fraction of the scene size per
 * second. The star is painted at a fixed point and its past slides away behind
 * it, which is what opens closed orbits into helices: circular motion plus
 * steady translation.
 */
const DRIFT_RATE = 0.055;

const MAX_PIXEL_RATIO = 2;
const NARROW_BREAKPOINT = 768;

interface TrailPoint extends ScenePoint {
  /** Seconds since the scene started, used to age the point as it drifts. */
  bornAt: number;
}

interface Layout {
  width: number;
  height: number;
  scale: number;
  origin: ScenePoint;
  blackHole: ScenePoint;
  blackHoleRadius: number;
  starRadius: number;
  trailSeconds: number;
}

function computeLayout(width: number, height: number): Layout {
  const isNarrow = width < NARROW_BREAKPOINT;
  const scale = Math.min(width, height);

  return {
    width,
    height,
    scale,
    origin: {
      x: width * (isNarrow ? 0.44 : 0.62),
      y: height * 0.5,
    },
    blackHole: {
      x: width * (isNarrow ? 1.05 : 0.98),
      y: height * (isNarrow ? 0.45 : 0.4),
    },
    blackHoleRadius: scale * (isNarrow ? 0.11 : 0.07),
    starRadius: scale * (isNarrow ? 0.055 : 0.038),
    trailSeconds: isNarrow ? TRAIL_SECONDS_COMPACT : TRAIL_SECONDS,
  };
}

interface CosmicSceneProps {
  /** Section under the reader; its planet is lit and its label emphasised. */
  activeId?: SectionId;
}

/**
 * The hero: a star with planets in orbit, trailing behind them as the whole
 * system falls towards a black hole at the right-hand edge.
 *
 * The planets are the site's navigation. Their bodies and trails are painted on
 * a canvas while the click targets and labels are ordinary anchors repositioned
 * each frame, so what a visitor aims at is a real link with a real accessible
 * name and only the decoration lives in a bitmap. Orbits are slow on purpose: a
 * moving link still has to be easy to hit.
 *
 * Whether the scene animates is derived in one place from three inputs — in the
 * viewport, tab in front, motion allowed — rather than started and stopped from
 * three separate callbacks. Splitting that decision is how a canvas ends up
 * either frozen or quietly running two loops at once.
 */
export function CosmicScene({ activeId }: CosmicSceneProps) {
  const t = useTranslations('nav');
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markersRef = useRef(new Map<SectionId, HTMLElement | null>());
  const prefersReducedMotion = usePrefersReducedMotion();

  // Mirrored into a ref so the loop can read it without listing it as a
  // dependency: restarting on every section change would discard the trails.
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!container || !canvas || !context) {
      return;
    }

    let layout = computeLayout(container.clientWidth, container.clientHeight);
    let palette: Palette = readPalette(document.documentElement);
    let trails: TrailPoint[][] = PLANETS.map(() => []);
    let lastSampleAt = -Infinity;

    let frameId = 0;
    let isRunning = false;
    let isInViewport = true;

    const startedAt = performance.now();

    const resetTrails = () => {
      trails = PLANETS.map(() => []);
      lastSampleAt = -Infinity;
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      layout = computeLayout(container.clientWidth, container.clientHeight);
      palette = readPalette(document.documentElement);

      canvas.width = Math.max(1, Math.floor(layout.width * ratio));
      canvas.height = Math.max(1, Math.floor(layout.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Trail geometry is stored in pixels, so a resize invalidates all of it.
      resetTrails();
    };

    const drawFrame = () => {
      const seconds = prefersReducedMotion ? 0 : (performance.now() - startedAt) / 1000;
      const activeSection = activeIdRef.current;

      context.clearRect(0, 0, layout.width, layout.height);
      drawBlackHole(context, layout.blackHole, layout.blackHoleRadius, palette, seconds);

      const shouldSample = !prefersReducedMotion && seconds - lastSampleAt >= SAMPLE_INTERVAL;

      if (shouldSample) {
        lastSampleAt = seconds;
      }

      const positions = PLANETS.map((planet, index) => {
        const position = planetPosition(planet, seconds, layout.origin, layout.scale);
        const history = trails[index];

        if (history && shouldSample) {
          history.push({ ...position, bornAt: seconds });

          while (seconds - (history[0]?.bornAt ?? seconds) > layout.trailSeconds) {
            history.shift();
          }
        }

        return position;
      });

      if (!prefersReducedMotion) {
        const drift = DRIFT_RATE * layout.scale;

        PLANETS.forEach((planet, index) => {
          const history = trails[index];

          if (!history) {
            return;
          }

          // Slide each point away from the star in proportion to its age.
          const drifted = history.map((point) => ({
            x: point.x - drift * (seconds - point.bornAt),
            y: point.y,
          }));

          drawTrail(context, drifted, palette[planet.color], Math.max(1.3, layout.scale * 0.0042));
        });
      }

      // Far side, then the star, then the near side, so the system reads as a
      // plane rather than a flat scatter of dots.
      PLANETS.forEach((planet, index) => {
        const position = positions[index];

        if (position && !isInFront(planet, seconds)) {
          drawPlanet(
            context,
            position,
            planet.size * layout.scale,
            palette[planet.color],
            planet.id === activeSection,
          );
        }
      });

      drawStar(context, layout.origin, layout.starRadius, palette);

      PLANETS.forEach((planet, index) => {
        const position = positions[index];

        if (!position) {
          return;
        }

        if (isInFront(planet, seconds)) {
          drawPlanet(
            context,
            position,
            planet.size * layout.scale,
            palette[planet.color],
            planet.id === activeSection,
          );
        }

        const marker = markersRef.current.get(planet.id);

        if (marker) {
          marker.style.transform = `translate3d(${String(Math.round(position.x))}px, ${String(Math.round(position.y))}px, 0)`;
        }
      });
    };

    const loop = () => {
      drawFrame();

      if (isRunning) {
        frameId = window.requestAnimationFrame(loop);
      }
    };

    /**
     * The single place that decides whether the scene animates. Every observer
     * updates its own input and calls this, so the loop can never be started
     * twice, nor left stopped by a callback that did not know about the others.
     */
    const sync = () => {
      const shouldRun = isInViewport && !document.hidden && !prefersReducedMotion;

      if (shouldRun && !isRunning) {
        isRunning = true;
        frameId = window.requestAnimationFrame(loop);
        return;
      }

      if (!shouldRun && isRunning) {
        isRunning = false;
        window.cancelAnimationFrame(frameId);
        frameId = 0;
        // Otherwise the history reappears as a frozen streak on return.
        resetTrails();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      drawFrame();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isInViewport = entries[0]?.isIntersecting ?? true;
        sync();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      sync();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    resize();
    drawFrame();
    sync();

    return () => {
      isRunning = false;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-x-0 top-[54%] bottom-0 overflow-hidden md:inset-0"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      <nav aria-label={t('systemMap')} className="absolute inset-0">
        <ul>
          {PLANETS.map((planet) => (
            <li key={planet.id}>
              <a
                ref={(element) => {
                  markersRef.current.set(planet.id, element);
                }}
                href={`#${planet.id}`}
                aria-current={planet.id === activeId ? 'true' : undefined}
                className="group absolute top-0 left-0 -m-7 flex size-14 flex-col items-center justify-end p-1"
              >
                <span
                  className={`translate-y-6 font-mono text-[0.625rem] tracking-[0.18em] whitespace-nowrap uppercase transition-colors duration-300 ${
                    planet.id === activeId
                      ? 'text-starlight'
                      : 'text-dust group-hover:text-starlight group-focus-visible:text-starlight'
                  }`}
                >
                  {t(planet.id)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
