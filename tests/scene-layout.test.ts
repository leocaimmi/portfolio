import { describe, expect, it } from 'vitest';

import { OUTERMOST_ORBIT, PLANETS } from '@/components/cosmos/scene-geometry';
import {
  computeLayout,
  planetEmergence,
  STILL_SECONDS,
  systemState,
  TRAVERSE_SECONDS,
  VISIBILITY_THRESHOLD,
} from '@/components/cosmos/scene-layout';

/**
 * A spread of real viewports, including the awkward ones: a tall phone, a phone
 * on its side, a short laptop, an ultrawide, and the widths just either side of
 * the breakpoint where the layout changes shape.
 */
const VIEWPORTS: readonly (readonly [number, number])[] = [
  [320, 568],
  [375, 812],
  [414, 896],
  [600, 900],
  [640, 360],
  [700, 400],
  [767, 400],
  [767, 1024],
  [768, 1024],
  [820, 1180],
  [1024, 640],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
  [2560, 1080],
  [3440, 1440],
];

/** Samples across a full journey, including both ends. */
const PHASES = Array.from({ length: 201 }, (_unused, index) => (index / 200) * TRAVERSE_SECONDS);

/**
 * Radius of the event horizon in pixels, mirroring how the element is sized in
 * `black-hole.tsx`: `98vw` below the breakpoint and `78vmin` above it, with the
 * shadow occupying 50 of the artwork's 480 units.
 */
function horizonRadius(width: number, height: number): number {
  const imageWidth = width < 768 ? width * 0.98 : Math.min(width, height) * 0.78;

  return imageWidth * (50 / 480);
}

describe('scene layout', () => {
  it.each(VIEWPORTS)('keeps the system inside the viewport at %ix%i', (width, height) => {
    const layout = computeLayout(width, height);

    expect(layout.entryX).toBeGreaterThan(0);
    expect(layout.approachX).toBeGreaterThan(layout.entryX);
    expect(layout.approachX).toBeLessThan(width);
  });

  it.each(VIEWPORTS)('starts from the edge opposite the hole at %ix%i', (width, height) => {
    const layout = computeLayout(width, height);

    // Within the first quarter of the run up to the hole, so the system reads
    // as arriving from the far edge rather than from the middle of the page.
    expect(layout.entryX).toBeLessThan(layout.blackHole.x * 0.25);
  });

  /*
   * The invariant the whole layout exists to protect. The system falls into the
   * hole, but it is spent before it gets there: nothing a visitor can still see
   * or click ever reaches the horizon, because anything that did could only
   * come back out of it — and a viewport nobody happened to open is exactly
   * where that would first show up.
   */
  it.each(VIEWPORTS)('never lets a visible planet reach the horizon at %ix%i', (width, height) => {
    const layout = computeLayout(width, height);
    const horizon = horizonRadius(width, height);

    for (const seconds of PHASES) {
      const system = systemState(seconds, layout);

      if (system.opacity < VISIBILITY_THRESHOLD) {
        continue;
      }

      const reach = OUTERMOST_ORBIT * layout.scale * system.scale;

      expect(layout.blackHole.x - (system.origin.x + reach)).toBeGreaterThan(horizon);
    }
  });

  it.each(VIEWPORTS)('leaves nothing on the far side of the hole at %ix%i', (width, height) => {
    const layout = computeLayout(width, height);

    for (const seconds of PHASES) {
      const system = systemState(seconds, layout);

      // Faint is still visible. Whatever can be made out at all is on this side
      // of the hole, all the way down to the point where it goes out.
      if (system.opacity <= 0.02) {
        continue;
      }

      const reach = OUTERMOST_ORBIT * layout.scale * system.scale;

      expect(system.origin.x + reach).toBeLessThan(layout.blackHole.x);
    }
  });

  it('ends its fall at the hole rather than beside it', () => {
    const layout = computeLayout(1440, 900);
    const end = systemState(TRAVERSE_SECONDS * 0.9999, layout);

    expect(end.origin.x).toBeCloseTo(layout.blackHole.x, 0);
    expect(end.origin.y).toBeCloseTo(layout.blackHole.y, 0);
    expect(end.opacity).toBeLessThan(0.01);
    expect(end.scale).toBeLessThan(0.01);
  });

  it('is largest as it surfaces and smallest as it falls in', () => {
    const layout = computeLayout(1440, 900);

    const near = systemState(0, layout);
    const middle = systemState(TRAVERSE_SECONDS * 0.5, layout);
    const far = systemState(TRAVERSE_SECONDS * 0.95, layout);

    expect(near.scale).toBeGreaterThan(1);
    expect(middle.scale).toBeLessThan(near.scale);
    expect(far.scale).toBeLessThan(middle.scale);
    expect(far.origin.x).toBeGreaterThan(near.origin.x);
  });

  /*
   * Two acts, and they have to read as two: an unhurried crossing that eases
   * off as the distance opens up, then a fall that gets away from it.
   */
  it('eases off across the sky, then plunges', () => {
    const layout = computeLayout(1440, 900);
    const at = (phase: number) => systemState(TRAVERSE_SECONDS * phase, layout).origin.x;

    expect(at(0.7) - at(0.6)).toBeLessThan(at(0.1) - at(0));
    // Stopping a hair short of the wrap, which is the next journey's first step.
    expect(at(0.9999) - at(0.9)).toBeGreaterThan(at(0.8) - at(0.7));
  });

  it('fades in at the edge and out into the hole', () => {
    const layout = computeLayout(1440, 900);

    expect(systemState(0, layout).opacity).toBeLessThan(0.05);
    expect(systemState(TRAVERSE_SECONDS * 0.05, layout).opacity).toBeGreaterThan(0.9);
    expect(systemState(TRAVERSE_SECONDS * 0.999, layout).opacity).toBeLessThan(0.05);
  });

  /*
   * These planets are the site's navigation, so the window in which they are
   * neither visible nor focusable has to stay a moment rather than a phase of
   * the journey. Hanging the fade off distance covered instead of time elapsed
   * is what previously stretched it across a fifth of every cycle.
   */
  it('stays reachable for all but a moment of the journey', () => {
    const layout = computeLayout(1440, 900);
    const samples = 700;

    const reachable = Array.from({ length: samples }, (_unused, index) => {
      const seconds = (index / samples) * TRAVERSE_SECONDS;

      return systemState(seconds, layout).opacity >= VISIBILITY_THRESHOLD;
    }).filter(Boolean).length;

    expect(reachable / samples).toBeGreaterThan(0.95);
  });

  it('lets the star out first and the planets after it', () => {
    expect(planetEmergence(0, 0)).toBe(0);
    expect(planetEmergence(PLANETS.length - 1, 0)).toBe(0);

    // Partway out, the inner orbits are ahead of the outer ones.
    for (let index = 1; index < PLANETS.length; index += 1) {
      expect(planetEmergence(index, 0.5)).toBeLessThan(planetEmergence(index - 1, 0.5));
    }

    for (let index = 0; index < PLANETS.length; index += 1) {
      expect(planetEmergence(index, 1)).toBe(1);
    }
  });

  it('settles into a visible system when motion is not wanted', () => {
    const layout = computeLayout(1440, 900);
    const system = systemState(STILL_SECONDS, layout);

    expect(system.opacity).toBe(1);
    expect(system.origin.x).toBeGreaterThan(layout.entryX);

    for (let index = 0; index < PLANETS.length; index += 1) {
      expect(planetEmergence(index, system.emergence)).toBe(1);
    }
  });

  it('starts a new journey rather than running backwards', () => {
    const layout = computeLayout(1440, 900);

    const beforeWrap = systemState(TRAVERSE_SECONDS * 0.99, layout);
    const afterWrap = systemState(TRAVERSE_SECONDS * 1.01, layout);

    expect(afterWrap.cycle).toBe(beforeWrap.cycle + 1);
    expect(afterWrap.origin.x).toBeLessThan(beforeWrap.origin.x);
  });
});
