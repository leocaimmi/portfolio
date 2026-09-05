'use client';

import { useTranslations } from 'next-intl';

import type { SectionId } from '@/config/navigation';
import { SECTION_IDS } from '@/config/navigation';
import { cn } from '@/lib/cn';

/**
 * The golden angle. Spacing successive planets by 137.5° is what keeps them
 * from lining up into spokes — the same reason it turns up in seed heads.
 */
const GOLDEN_ANGLE = 137.5;

/** Orbit radii as a percentage of the container's half-width. */
const ORBIT_RADII = [11, 18.5, 26, 33.5, 41] as const;

const PLANET_COLOR: Record<SectionId, string> = {
  about: 'var(--color-star)',
  trajectory: 'var(--color-solar)',
  missions: 'var(--color-nebula-glow)',
  constellations: 'var(--color-comet)',
  contact: 'var(--color-starlight)',
};

const DEGREES_TO_RADIANS = Math.PI / 180;

/** Keeps a rotation within half a turn, so the system never spins the long way. */
function shortestRotation(degrees: number): number {
  return ((((degrees + 180) % 360) + 360) % 360) - 180;
}

const PLANETS = SECTION_IDS.map((id, index) => {
  const radius = ORBIT_RADII[index] ?? 41;
  const angle = (index * GOLDEN_ANGLE - 90) * DEGREES_TO_RADIANS;

  return {
    id,
    radius,
    left: 50 + radius * Math.cos(angle),
    top: 50 + radius * Math.sin(angle),
    color: PLANET_COLOR[id],
  };
});

interface SolarSystemProps {
  /** Section currently under the reader; lights up its planet. */
  activeId?: string;
  /** Drops the labels and shrinks the bodies, for the docked navigator. */
  compact?: boolean;
  className?: string;
}

/**
 * The site's navigation, drawn as a solar system.
 *
 * Every planet is a real anchor to its section, so the whole thing works with
 * no JavaScript, is reachable by keyboard in document order, and is announced
 * as a navigation landmark. Scrolling and clicking are two routes to the same
 * place rather than two different mechanisms.
 *
 * As the reader moves through the page, the system rotates to bring the active
 * planet to the top. The rotation is discrete — one transition per section
 * change, not a per-frame calculation — and each planet counter-rotates so its
 * label stays upright.
 */
export function SolarSystem({ activeId, compact = false, className }: SolarSystemProps) {
  const t = useTranslations('nav');

  const activeIndex = PLANETS.findIndex((planet) => planet.id === activeId);
  const rotation = activeIndex >= 0 ? shortestRotation(-activeIndex * GOLDEN_ANGLE) : 0;

  return (
    <nav
      aria-label={t('systemMap')}
      className={cn('relative aspect-square w-full select-none', className)}
    >
      {ORBIT_RADII.map((radius) => (
        <span
          key={radius}
          aria-hidden="true"
          className="absolute rounded-full border border-horizon/45"
          style={{ inset: `${String(50 - radius)}%` }}
        />
      ))}

      <a
        href="#top"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: compact ? '15%' : '9%',
          aspectRatio: '1',
          background:
            'radial-gradient(circle at 35% 30%, var(--color-starlight), var(--color-solar) 45%, var(--color-nebula) 100%)',
          boxShadow: '0 0 3rem -0.25rem color-mix(in oklab, var(--color-solar) 55%, transparent)',
        }}
      >
        <span className="sr-only">{t('home')}</span>
      </a>

      <ul
        className="absolute inset-0 transition-transform duration-[900ms] ease-orbital"
        style={{ transform: `rotate(${String(rotation)}deg)` }}
      >
        {PLANETS.map((planet) => {
          const isActive = planet.id === activeId;

          return (
            <li
              key={planet.id}
              className="absolute"
              style={{ left: `${String(planet.left)}%`, top: `${String(planet.top)}%` }}
            >
              <div
                className="transition-transform duration-[900ms] ease-orbital"
                style={{ transform: `translate(-50%, -50%) rotate(${String(-rotation)}deg)` }}
              >
                <a
                  href={`#${planet.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className="group flex flex-col items-center gap-2"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block rounded-full transition-all duration-500 ease-orbital',
                      compact ? 'size-1.5' : 'size-3.5',
                      isActive
                        ? 'scale-150'
                        : 'opacity-70 group-hover:scale-125 group-hover:opacity-100',
                    )}
                    style={{
                      backgroundColor: planet.color,
                      boxShadow: isActive
                        ? `0 0 1.25rem 0.125rem color-mix(in oklab, ${planet.color} 60%, transparent)`
                        : undefined,
                    }}
                  />

                  <span
                    className={cn(
                      'font-mono text-[0.625rem] tracking-[0.18em] whitespace-nowrap uppercase transition-colors duration-300',
                      compact && 'sr-only',
                      isActive ? 'text-starlight' : 'text-dust group-hover:text-starlight',
                    )}
                  >
                    {t(planet.id)}
                  </span>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
