'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

import { OUTERMOST_ORBIT, planetPosition, PLANETS, RESTING_PLANE } from './scene-geometry';

/**
 * How much of the box the outermost orbit takes, as a percentage of its width.
 * The rest is the rim the sweep runs around.
 */
const OUTER_RADIUS = 40;

/** Turns an orbit radius from the shared geometry into a percentage of the box. */
const SCALE = OUTER_RADIUS / OUTERMOST_ORBIT;

const CENTRE = { x: 50, y: 50 };

const TILT_DEGREES = (RESTING_PLANE.tilt * 180) / Math.PI;

/**
 * The system as the chart draws it, measured once at module load.
 *
 * Taken from the same definitions the hero animates: the same orbit radii, the
 * same golden-angle spacing, the same tilt, the same colours. The chart used to
 * carry its own copy of all four, and they had drifted apart to the point where
 * the map and the thing it maps no longer looked related.
 *
 * Frozen at the start of a revolution rather than turning: a target meant to be
 * hit precisely should not also be moving.
 */
const NODES = PLANETS.map((planet) => {
  const point = planetPosition(planet, 0, CENTRE, SCALE);

  return {
    id: planet.id,
    color: `var(--color-${planet.color})`,
    orbit: planet.orbit * SCALE,
    left: point.x,
    top: point.y,
  };
});

interface SolarSystemProps {
  /** Section currently under the reader; lights up its planet. */
  activeId?: string;
  className?: string;
}

/**
 * The site's navigation, drawn as the chart of a solar system.
 *
 * Every planet is a real anchor to its section, so the whole thing works with
 * no JavaScript, is reachable by keyboard in document order, and is announced
 * as a navigation landmark. Scrolling and clicking are two routes to the same
 * place rather than two different mechanisms.
 *
 * Labels are read out rather than drawn: at this size there is no room for
 * five of them, and the name each anchor carries is what a screen reader needs
 * anyway.
 */
export function SolarSystem({ activeId, className }: SolarSystemProps) {
  const t = useTranslations('nav');

  return (
    <nav
      aria-label={t('systemMap')}
      className={cn('relative aspect-square w-full select-none', className)}
    >
      {/* The plane, seen at the angle the hero sees it from. */}
      {NODES.map((node) => (
        <span
          key={`orbit-${node.id}`}
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 rounded-[50%] border border-horizon/45"
          style={{
            width: `${String(node.orbit * 2)}%`,
            height: `${String(node.orbit * 2 * RESTING_PLANE.flatten)}%`,
            transform: `translate(-50%, -50%) rotate(${String(TILT_DEGREES)}deg)`,
          }}
        />
      ))}

      {/* Bearing lines, for the instrument the thing is pretending to be. */}
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-horizon/35"
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-horizon/35"
      />

      <a
        href="#top"
        className="absolute top-1/2 left-1/2 size-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, var(--color-starlight), var(--color-solar) 45%, var(--color-nebula) 100%)',
          boxShadow: '0 0 3rem -0.25rem color-mix(in oklab, var(--color-solar) 55%, transparent)',
        }}
      >
        <span className="sr-only">{t('home')}</span>
      </a>

      {/*
        Transparent to the pointer except on the planets themselves: the list
        covers the whole chart, and a live layer over the star swallows the click
        meant for it.
      */}
      <ul className="pointer-events-none absolute inset-0">
        {NODES.map((node) => {
          const isActive = node.id === activeId;

          return (
            <li
              key={node.id}
              className="absolute"
              style={{ left: `${String(node.left)}%`, top: `${String(node.top)}%` }}
            >
              <a
                href={`#${node.id}`}
                aria-current={isActive ? 'true' : undefined}
                className="group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 p-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'block size-1.5 rounded-full transition-all duration-500 ease-orbital',
                    isActive
                      ? 'scale-150'
                      : 'opacity-70 group-hover:scale-125 group-hover:opacity-100',
                  )}
                  style={{
                    backgroundColor: node.color,
                    boxShadow: isActive
                      ? `0 0 1.25rem 0.125rem color-mix(in oklab, ${node.color} 60%, transparent)`
                      : undefined,
                  }}
                />

                {/* A lock ring on the contact the sweep has just found. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-500 ease-orbital',
                    isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
                  )}
                  style={{ borderColor: `color-mix(in oklab, ${node.color} 55%, transparent)` }}
                />

                <span className="sr-only">{t(node.id)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
