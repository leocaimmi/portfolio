import type { ScenePoint } from './scene-geometry';
import { OUTERMOST_ORBIT } from './scene-geometry';

/**
 * Where everything in the hero scene sits, and where it is going.
 *
 * Pure and separate from the component so the geometry can be asserted in a
 * test. The invariant that matters — that no planet ever reaches the black hole
 * — holds at every viewport or at none, and a value that is only ever checked
 * by eye is only checked at the sizes someone happened to open.
 */

export const NARROW_BREAKPOINT = 768;

/** Seconds of history kept behind each planet. */
export const TRAIL_SECONDS = 11;
export const TRAIL_SECONDS_COMPACT = 6;

/** Seconds for the system to cross from where it enters to the hole. */
export const TRAVERSE_SECONDS = 140;

/** How much the system is squeezed by the time it arrives. */
export const SYSTEM_SHRINK = 0.36;

/**
 * Below this the system is treated as gone: its links stop being focusable, so
 * a keyboard user is never sent to something nobody can see.
 */
export const VISIBILITY_THRESHOLD = 0.14;

export interface Layout {
  width: number;
  height: number;
  scale: number;
  /** Where the system enters, clear of the copy on the left. */
  entryX: number;
  /** The closest it comes to the hole before being drawn in. */
  approachX: number;
  originY: number;
  blackHole: ScenePoint;
  starRadius: number;
  trailSeconds: number;
}

/** Where the system is, and in what state, at a given moment. */
export interface SystemState {
  origin: ScenePoint;
  /** Orbit radii are multiplied by this: the system is squeezed as it falls. */
  scale: number;
  opacity: number;
  /** Which pass of the journey this is, so a wrap can be detected. */
  cycle: number;
}

/**
 * The system's journey.
 *
 * It enters at the left of the sky, is drawn towards the hole, and is swallowed
 * — dimming and tightening as it goes — before reappearing to begin again. The
 * approach decelerates for the same reason the star field does: from out here,
 * infalling matter appears to slow rather than accelerate.
 *
 * It never actually reaches the hole. `approachX` is derived from the hole's
 * own size and the outermost orbit, so the planets stop short of the horizon at
 * every viewport. Whatever crossed it could only have come back out.
 */
export function systemState(seconds: number, layout: Layout): SystemState {
  const cycle = Math.floor(seconds / TRAVERSE_SECONDS);
  const phase = (seconds % TRAVERSE_SECONDS) / TRAVERSE_SECONDS;
  const travel = 1 - (1 - phase) ** 2.1;

  const scale = 1 - travel * SYSTEM_SHRINK;
  const arrival = Math.min(1, phase / 0.05);
  const capture = Math.max(0, (travel - 0.86) / 0.14);

  return {
    origin: {
      x: layout.entryX + (layout.approachX - layout.entryX) * travel,
      // Pulled onto the hole's own line as it closes, so the system funnels in
      // rather than sliding past.
      y: layout.originY + (layout.blackHole.y - layout.originY) * travel * travel * 0.6,
    },
    scale,
    opacity: arrival * (1 - capture) ** 1.6,
    cycle,
  };
}

export function computeLayout(width: number, height: number): Layout {
  const isNarrow = width < NARROW_BREAKPOINT;
  const scale = Math.min(width, height);

  // Mirrors the element's own placement and size, since the scene has to know
  // both where it is falling towards and how much room that leaves.
  const blackHole = {
    x: width * (isNarrow ? 0.92 : 0.97),
    y: height * (isNarrow ? 0.46 : 0.48),
  };
  const blackHoleWidth = isNarrow ? width * 0.98 : scale * 0.78;
  const horizonRadius = blackHoleWidth * (50 / 480);

  // Enough room for the outermost orbit at its smallest, plus the horizon and a
  // margin. Derived rather than tuned, so the invariant holds at any viewport
  // instead of only at the ones that happened to get looked at.
  const clearance =
    horizonRadius * 2.1 + OUTERMOST_ORBIT * scale * (1 - SYSTEM_SHRINK) + scale * 0.03;

  const entryX = width * (isNarrow ? 0.2 : 0.46);

  return {
    width,
    height,
    scale,
    entryX,
    approachX: Math.max(entryX + scale * 0.05, blackHole.x - clearance),
    originY: height * 0.5,
    blackHole,
    starRadius: scale * (isNarrow ? 0.04 : 0.027),
    trailSeconds: isNarrow ? TRAIL_SECONDS_COMPACT : TRAIL_SECONDS,
  };
}
