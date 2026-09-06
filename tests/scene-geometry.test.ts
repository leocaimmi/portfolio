import { describe, expect, it } from 'vitest';

import type { OrbitPlane, PlanetDefinition } from '@/components/cosmos/scene-geometry';
import { planetPosition, PLANETS, RESTING_PLANE } from '@/components/cosmos/scene-geometry';

const ORIGIN = { x: 500, y: 300 };
const SCALE = 400;

/** The plane at its most strained: rolled, and drawn out towards the hole. */
const FALLING_PLANE: OrbitPlane = {
  ...RESTING_PLANE,
  tilt: RESTING_PLANE.tilt - 0.14,
  stretch: 1.28,
};

function firstPlanet(): PlanetDefinition {
  const planet = PLANETS[0];

  if (planet === undefined) {
    throw new Error('The scene needs at least one planet to place.');
  }

  return planet;
}

const PLANET = firstPlanet();

/** Averages a full revolution's worth of offsets from the star. */
function meanOffset(plane: OrbitPlane): { x: number; y: number } {
  const samples = 720;
  let x = 0;
  let y = 0;

  for (let index = 0; index < samples; index += 1) {
    const position = planetPosition(
      PLANET,
      (index / samples) * PLANET.period,
      ORIGIN,
      SCALE,
      plane,
    );

    x += position.x - ORIGIN.x;
    y += position.y - ORIGIN.y;
  }

  return { x: x / samples, y: y / samples };
}

describe('orbital geometry', () => {
  /*
   * The star is the thing the orbit goes around, and it has to keep looking
   * like it under every state of the plane. Perspective used to displace the
   * planets as well as size them, which magnifies the near half of the ring
   * about its centre and so walks the drawn ellipse off the star it belongs to
   * — most visibly at the end of the journey, where the plane is most strained.
   */
  it.each([
    ['at rest', RESTING_PLANE],
    ['while falling', FALLING_PLANE],
  ])('keeps an orbit centred on its star %s', (_label, plane) => {
    const mean = meanOffset(plane);

    expect(Math.abs(mean.x)).toBeLessThan(0.001 * SCALE);
    expect(Math.abs(mean.y)).toBeLessThan(0.001 * SCALE);
  });

  /* Depth is still what sizes a body, which is where the sense of a near and a
   * far side now comes from. */
  it('reports a planet as nearer on one side of its orbit than the other', () => {
    const quarter = PLANET.period / 4;
    const phaseToNear = ((Math.PI / 2 - PLANET.phase) / (Math.PI * 2)) * PLANET.period;

    const near = planetPosition(PLANET, phaseToNear, ORIGIN, SCALE);
    const far = planetPosition(PLANET, phaseToNear + quarter * 2, ORIGIN, SCALE);

    expect(near.depth).toBeGreaterThan(1);
    expect(far.depth).toBeLessThan(1);
  });

  /* The tidal draw is towards the hole, which is a direction in the sky. */
  it('stretches towards the hole rather than along the plane', () => {
    const seconds = PLANET.period * 0.37;

    const resting = planetPosition(PLANET, seconds, ORIGIN, SCALE);
    const falling = planetPosition(PLANET, seconds, ORIGIN, SCALE, {
      ...RESTING_PLANE,
      stretch: 1.28,
    });

    // Only the horizontal offset grows: the pull does not tilt the system.
    expect(falling.x - ORIGIN.x).toBeCloseTo((resting.x - ORIGIN.x) * 1.28, 6);
    expect(falling.y).toBeCloseTo(resting.y, 6);
  });
});
