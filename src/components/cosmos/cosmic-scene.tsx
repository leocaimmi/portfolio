'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import type { SectionId } from '@/config/navigation';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

import { BlackHole } from './black-hole';
import type { SceneStar } from './draw-scene';
import { drawPlanet, drawSceneStars, drawStar, drawTrail } from './draw-scene';
import type { Palette } from './palette';
import { readPalette } from './palette';
import type { ScenePoint } from './scene-geometry';
import { isInFront, planetPosition, PLANETS } from './scene-geometry';
import { computeLayout, STILL_SECONDS, systemState, VISIBILITY_THRESHOLD } from './scene-layout';

/** How often a trail point is recorded. Below the frame rate, and plenty smooth. */
const SAMPLE_INTERVAL = 1 / 24;

/** Star field speed, as a fraction of the scene size per second. */
const DRIFT_RATE = 0.055;

const MAX_PIXEL_RATIO = 2;

/** One star per this many square pixels, capped so a wide screen stays cheap. */
const STAR_AREA_PER_STAR = 5_600;
const MAX_SCENE_STARS = 110;

interface TrailPoint extends ScenePoint {
  /** Seconds since the scene started, kept so old points can be aged out. */
  bornAt: number;
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
  const navRef = useRef<HTMLElement>(null);
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
    let starTrail: TrailPoint[] = [];
    let sceneStars: SceneStar[] = [];
    let lastSampleAt = -Infinity;

    let frameId = 0;
    let isRunning = false;
    let isInViewport = true;
    let lastCycle = 0;

    const startedAt = performance.now();

    const resetTrails = () => {
      trails = PLANETS.map(() => []);
      starTrail = [];
      lastSampleAt = -Infinity;
    };

    const createSceneStars = (): SceneStar[] => {
      const count = Math.min(
        Math.round((layout.width * layout.height) / STAR_AREA_PER_STAR),
        MAX_SCENE_STARS,
      );

      return Array.from({ length: count }, () => {
        const depth = Math.random() ** 2.6;

        return {
          x: Math.random() * layout.width,
          y: Math.random() * layout.height,
          depth,
          size: 0.7 + depth * 1.5,
          alpha: 0.16 + depth * 0.5,
        };
      });
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
      sceneStars = createSceneStars();
    };

    const drawFrame = () => {
      // Not zero: at phase zero the system has not left the edge yet, so a
      // frozen scene would be an empty sky with an unreachable navigation in it.
      const seconds = prefersReducedMotion ? STILL_SECONDS : (performance.now() - startedAt) / 1000;
      const activeSection = activeIdRef.current;

      const drift = DRIFT_RATE * layout.scale;
      const system = systemState(seconds, layout);
      const origin = system.origin;
      const orbitScale = layout.scale * system.scale;
      const trailWidth = Math.max(1, layout.scale * 0.003);

      // The journey has restarted on the far left. Without dropping the history
      // the next trail would be a straight line drawn back across the whole sky.
      if (system.cycle !== lastCycle) {
        lastCycle = system.cycle;
        resetTrails();
      }

      context.clearRect(0, 0, layout.width, layout.height);

      if (!prefersReducedMotion) {
        drawSceneStars(
          context,
          sceneStars,
          layout.width,
          seconds,
          drift,
          layout.blackHole.y,
          palette,
        );
      }

      const shouldSample = !prefersReducedMotion && seconds - lastSampleAt >= SAMPLE_INTERVAL;

      if (shouldSample) {
        lastSampleAt = seconds;
        starTrail.push({ ...origin, bornAt: seconds });

        while (seconds - (starTrail[0]?.bornAt ?? seconds) > layout.trailSeconds) {
          starTrail.shift();
        }
      }

      // Everything the system is made of dims together as it is swallowed.
      context.globalAlpha = system.opacity;

      const positions = PLANETS.map((planet, index) => {
        const position = planetPosition(planet, seconds, origin, orbitScale);
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
        // No artificial drift any more: the system genuinely travels, so the
        // stored history is the path it actually took.
        drawTrail(context, starTrail, palette.solar, trailWidth * 2);

        PLANETS.forEach((planet, index) => {
          const history = trails[index];

          if (history) {
            drawTrail(context, history, palette[planet.color], trailWidth);
          }
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
            planet.size * orbitScale,
            palette[planet.color],
            planet.id === activeSection,
          );
        }
      });

      drawStar(context, origin, layout.starRadius * system.scale, palette, seconds);

      PLANETS.forEach((planet, index) => {
        const position = positions[index];

        if (!position) {
          return;
        }

        if (isInFront(planet, seconds)) {
          drawPlanet(
            context,
            position,
            planet.size * orbitScale,
            palette[planet.color],
            planet.id === activeSection,
          );
        }

        const marker = markersRef.current.get(planet.id);

        if (marker) {
          marker.style.transform = `translate3d(${String(Math.round(position.x))}px, ${String(Math.round(position.y))}px, 0)`;
          marker.style.opacity = String(system.opacity);
        }
      });

      // While the system is being swallowed its links are neither visible nor
      // reachable. A focus ring landing on something nobody can see is worse
      // than a navigation that pauses.
      const nav = navRef.current;

      if (nav) {
        nav.inert = system.opacity < VISIBILITY_THRESHOLD;
      }

      context.globalAlpha = 1;
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
      className="absolute inset-x-0 top-[46%] bottom-0 overflow-hidden md:inset-0"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      <BlackHole />

      {/*
        Above the copy in the stack, so a planet passing behind the text is
        still clickable. The markers are small; the little text they cover is
        not interactive anyway.
      */}
      <nav ref={navRef} aria-label={t('systemMap')} className="absolute inset-0 z-20">
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
