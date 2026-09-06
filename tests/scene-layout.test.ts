import { describe, expect, it } from 'vitest';

import { OUTERMOST_ORBIT } from '@/components/cosmos/scene-geometry';
import { computeLayout, systemState, TRAVERSE_SECONDS } from '@/components/cosmos/scene-layout';

/**
 * A spread of real viewports, including the awkward ones: a tall phone, a short
 * laptop, an ultrawide, and the widths just either side of the breakpoint where
 * the layout changes shape.
 */
const VIEWPORTS: readonly (readonly [number, number])[] = [
  [320, 568],
  [375, 812],
  [414, 896],
  [600, 900],
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
const PHASES = Array.from({ length: 41 }, (_unused, index) => (index / 40) * TRAVERSE_SECONDS);

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

  /*
   * The invariant the whole layout exists to protect. Nothing may reach the
   * hole, because anything that did could only come back out of it — and a
   * viewport nobody happened to open is exactly where that would first show up.
   */
  it.each(VIEWPORTS)('never lets a planet reach the horizon at %ix%i', (width, height) => {
    const layout = computeLayout(width, height);
    const horizon = horizonRadius(width, height);

    for (const seconds of PHASES) {
      const system = systemState(seconds, layout);
      const reach = OUTERMOST_ORBIT * layout.scale * system.scale;
      const distance = layout.blackHole.x - (system.origin.x + reach);

      expect(distance).toBeGreaterThan(horizon);
    }
  });

  it('advances, shrinks and dims as it approaches', () => {
    const layout = computeLayout(1440, 900);

    const early = systemState(TRAVERSE_SECONDS * 0.2, layout);
    const late = systemState(TRAVERSE_SECONDS * 0.9, layout);

    expect(late.origin.x).toBeGreaterThan(early.origin.x);
    expect(late.scale).toBeLessThan(early.scale);
    expect(late.opacity).toBeLessThan(early.opacity);
  });

  /* From out here, infalling matter appears to slow rather than accelerate. */
  it('decelerates as it nears the hole', () => {
    const layout = computeLayout(1440, 900);
    const at = (phase: number) => systemState(TRAVERSE_SECONDS * phase, layout).origin.x;

    const firstTenth = at(0.1) - at(0);
    const lastTenth = at(1) - at(0.9);

    expect(lastTenth).toBeLessThan(firstTenth);
  });

  it('fades in on arrival so the wrap is not a pop', () => {
    const layout = computeLayout(1440, 900);

    expect(systemState(0, layout).opacity).toBeLessThan(0.05);
    expect(systemState(TRAVERSE_SECONDS * 0.1, layout).opacity).toBeGreaterThan(0.9);
  });

  it('starts a new journey rather than running backwards', () => {
    const layout = computeLayout(1440, 900);

    const beforeWrap = systemState(TRAVERSE_SECONDS * 0.99, layout);
    const afterWrap = systemState(TRAVERSE_SECONDS * 1.01, layout);

    expect(afterWrap.cycle).toBe(beforeWrap.cycle + 1);
    expect(afterWrap.origin.x).toBeLessThan(beforeWrap.origin.x);
  });
});
