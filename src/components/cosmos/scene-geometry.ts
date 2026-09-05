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

export const PLANETS: PlanetDefinition[] = SECTION_IDS.map((id, index) => ({
  id,
  orbit: 0.13 + index * 0.072,
  period: 30 + index * 13,
  phase: index * GOLDEN_ANGLE,
  size: index === 2 ? 0.017 : 0.013,
  color: (['star', 'solar', 'nebula-glow', 'comet', 'starlight'] as const)[index % 5] ?? 'star',
}));

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
