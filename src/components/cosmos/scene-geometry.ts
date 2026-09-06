import type { SectionId } from '@/config/navigation';
import { SECTION_IDS } from '@/config/navigation';

import type { PaletteToken } from './palette';

/**
 * Geometry shared by the animated hero scene and the docked navigator, so the
 * two always agree on where a section sits in the system.
 */

const TAU = Math.PI * 2;

/** 137.5°, in radians. Spacing the starting phases by it stops the planets lining up. */
const GOLDEN_ANGLE = 2.399963;

/**
 * Vertical squash applied to every orbit. A perfect circle reads as a
 * top-down diagram; flattening it puts the plane in perspective.
 */
export const ORBIT_FLATTEN = 0.42;

/** Tilt of the orbital plane, in radians. */
export const ORBIT_TILT = -0.3;

export interface PlanetDefinition {
  id: SectionId;
  /** Orbit radius as a fraction of the scene's reference size. */
  orbit: number;
  /** Seconds for one revolution. Slow on purpose: these are click targets. */
  period: number;
  /** Starting angle, in radians. */
  phase: number;
  /** Body radius as a fraction of the scene's reference size. */
  size: number;
  /** Palette token the body and its trail are painted with. */
  color: PaletteToken;
}

/** Orbit radius of the innermost planet, as a fraction of the scene size. */
const INNER_ORBIT = 0.13;
const ORBIT_SPACING = 0.061;

/**
 * Radius of the outermost orbit, as a fraction of the scene size.
 *
 * Exported because the layout has to keep the system clear of the black hole,
 * and this is the number that decides how much room it needs.
 */
export const OUTERMOST_ORBIT = INNER_ORBIT + (SECTION_IDS.length - 1) * ORBIT_SPACING;

/** Seconds for the innermost planet to complete one revolution. */
const INNER_PERIOD = 18;

/**
 * Kepler's third law: the square of the orbital period is proportional to the
 * cube of the semi-major axis, so `T = T₀ · (a / a₀)^1.5`.
 *
 * A linear ramp was the obvious shortcut and it looked wrong for a reason —
 * every planet appeared to be keeping pace with its neighbours. Under the real
 * law the inner bodies race and the outer ones barely move, which is what
 * makes a solar system read as a system rather than as a set of rotating
 * rings.
 *
 * It also happens to be good interaction design: the planets furthest out are
 * the largest click targets and the slowest, and the innermost is the one a
 * reader is least likely to be aiming at.
 */
function orbitalPeriod(radius: number): number {
  return INNER_PERIOD * (radius / INNER_ORBIT) ** 1.5;
}

export const PLANETS: PlanetDefinition[] = SECTION_IDS.map((id, index) => {
  const orbit = INNER_ORBIT + index * ORBIT_SPACING;

  return {
    id,
    orbit,
    period: orbitalPeriod(orbit),
    phase: index * GOLDEN_ANGLE,
    size: index === 2 ? 0.017 : 0.013,
    color: (['star', 'solar', 'nebula-glow', 'comet', 'starlight'] as const)[index % 5] ?? 'star',
  };
});

export interface ScenePoint {
  x: number;
  y: number;
}

/**
 * Position of a planet at a given moment, in scene coordinates.
 *
 * `scale` is the scene's reference size in pixels, so the same definition
 * renders correctly in the full-width hero and in the docked navigator.
 */
export function planetPosition(
  planet: PlanetDefinition,
  seconds: number,
  origin: ScenePoint,
  scale: number,
): ScenePoint {
  const angle = planet.phase + (seconds / planet.period) * TAU;
  const radius = planet.orbit * scale;

  const offsetX = radius * Math.cos(angle);
  const offsetY = radius * Math.sin(angle) * ORBIT_FLATTEN;

  const cos = Math.cos(ORBIT_TILT);
  const sin = Math.sin(ORBIT_TILT);

  return {
    x: origin.x + offsetX * cos - offsetY * sin,
    y: origin.y + offsetX * sin + offsetY * cos,
  };
}

/** True while the planet is on the near side of its orbit, in front of the star. */
export function isInFront(planet: PlanetDefinition, seconds: number): boolean {
  const angle = planet.phase + (seconds / planet.period) * TAU;

  return Math.sin(angle) > 0;
}
