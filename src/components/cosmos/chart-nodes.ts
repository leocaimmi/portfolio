import type { SectionId } from '@/config/navigation';

import { OUTERMOST_ORBIT, planetPosition, PLANETS, RESTING_PLANE } from './scene-geometry';

/**
 * The system as the docked chart draws it, measured once at module load.
 *
 * Taken from the same definitions the hero animates: the same orbit radii, the
 * same golden-angle spacing, the same tilt. Kept in its own module because two
 * components need the answer — the chart, to draw it, and the readout beside
 * it, to state where the reader currently is.
 *
 * Frozen at the start of a revolution rather than turning: a target meant to be
 * hit precisely should not also be moving, and a coordinate that changed every
 * frame would be a slot machine rather than a position.
 */

/** How much of the box the outermost orbit takes, as a percentage of its width. */
const OUTER_RADIUS = 40;

/** Turns an orbit radius from the shared geometry into a percentage of the box. */
const SCALE = OUTER_RADIUS / OUTERMOST_ORBIT;

/** The star, and the reading given when the reader is not in a section yet. */
export const CHART_CENTRE = { x: 50, y: 50 };

export const CHART_TILT_DEGREES = (RESTING_PLANE.tilt * 180) / Math.PI;
export const CHART_FLATTEN = RESTING_PLANE.flatten;

export interface ChartNode {
  id: SectionId;
  /** A CSS colour, taken from the palette token the hero paints it with. */
  color: string;
  /** Orbit radius, as a percentage of the box's width. */
  orbit: number;
  left: number;
  top: number;
}

export const CHART_NODES: ChartNode[] = PLANETS.map((planet) => {
  const point = planetPosition(planet, 0, CHART_CENTRE, SCALE);

  return {
    id: planet.id,
    color: `var(--color-${planet.color})`,
    orbit: planet.orbit * SCALE,
    left: point.x,
    top: point.y,
  };
});

/** Where a section sits on the chart, or the star while none has been reached. */
export function chartPosition(id: SectionId | undefined): { x: number; y: number } {
  const node = CHART_NODES.find((entry) => entry.id === id);

  return node ? { x: node.left, y: node.top } : CHART_CENTRE;
}

/** Padded to a fixed width so the readout never shifts as the numbers change. */
export function formatCoordinate(value: number): string {
  return value.toFixed(1).padStart(5, '0');
}
