import type { OrbitPlane, ScenePoint } from './scene-geometry';
import { MAX_DEPTH, OUTERMOST_ORBIT, PLANETS, RESTING_PLANE } from './scene-geometry';

/**
 * Where everything in the hero scene sits, and where it is going.
 *
 * Pure and separate from the component so the geometry can be asserted in a
 * test. The invariants that matter — that nothing visible ever crosses the
 * horizon, and that the navigation is reachable for all but a moment of the
 * cycle — hold at every viewport or at none, and a value that is only ever
 * checked by eye is only checked at the sizes someone happened to open.
 */

export const NARROW_BREAKPOINT = 768;

/** Seconds of history kept behind each planet. */
export const TRAIL_SECONDS = 11;
export const TRAIL_SECONDS_COMPACT = 6;

/** Seconds for the system to cross the sky and be taken by the hole. */
export const TRAVERSE_SECONDS = 140;

/** Where the crossing ends and the fall begins, as a fraction of the journey. */
const CAPTURE_PHASE = 0.75;

/** How sharply what is left folds in on itself once the hole has it. */
const CAPTURE_COLLAPSE = 1.5;

/**
 * Shape of the crossing. Above 1, the system covers ground early and eases off
 * later. Kept gentle: a steeper curve parked it beside the hole for most of the
 * cycle, and the planets are the site's navigation.
 */
const APPROACH_EASING = 1.45;

/**
 * Shape of the fall. Cubic, so the last stretch is a plunge rather than a
 * drift — and steep enough that by the time the system is deep in the hole's
 * reach it has already collapsed to nothing. That relationship is what keeps
 * the horizon clear of anything a visitor can still see or click.
 */
const PLUNGE_EASING = 3;

/**
 * When the hole starts to show in the system's shape, well before it starts to
 * take it. Shrinking alone read as a badge sliding into the distance; the plane
 * has to be visibly under strain on the way in.
 */
const TIP_PHASE = 0.38;

/** How far the plane rolls out of its resting tilt as it falls, in radians. */
const TILT_ROLL = -0.34;

/** How far the system is drawn out along its own axis by the time it arrives. */
const STRETCH_GAIN = 0.34;

/**
 * The most the outermost orbit can extend beyond its nominal radius: the near
 * side of the ellipse under perspective, drawn out by the tidal stretch. The
 * clearance in front of the hole is derived from it, so the two cannot drift.
 */
const MAX_REACH = MAX_DEPTH * (1 + STRETCH_GAIN);

/** Fraction of the journey spent surfacing at the left edge. */
const EMERGE_SPAN = 0.11;

/** Each orbit outward waits this much longer than the one inside it. */
const ORBIT_LAG = 0.12;

/** Fraction of the journey given to fading in at the edge. */
const FADE_IN_PHASE = 0.02;

/**
 * Below this the system is treated as gone: its links stop being focusable, so
 * a keyboard user is never sent to something nobody can see.
 *
 * The window this opens is deliberately small. These links are the navigation,
 * and an earlier version keyed the fade to distance covered rather than to time
 * elapsed, which — under a decelerating approach — left the system dim and
 * unreachable for roughly a fifth of every cycle.
 */
export const VISIBILITY_THRESHOLD = 0.14;

/**
 * A moment mid-journey, standing in for the whole scene when a visitor has
 * asked for less motion.
 *
 * Phase zero is the system at nothing: invisible, still behind the edge.
 * Freezing the clock there would have left the navigation blank and inert for
 * exactly the people least able to work around it.
 */
export const STILL_SECONDS = TRAVERSE_SECONDS * 0.22;

export interface Layout {
  width: number;
  height: number;
  scale: number;
  /** Where the system surfaces: the far edge, opposite the hole. */
  entryX: number;
  /** Where the crossing ends and the hole takes over. */
  approachX: number;
  originY: number;
  /** Size of the system as it surfaces, and as the crossing ends. */
  entryScale: number;
  arrivalScale: number;
  blackHole: ScenePoint;
  starRadius: number;
  trailSeconds: number;
  /** How close to an edge a marker may sit before it is faded out. */
  markerMargin: number;
}

/** Where the system is, and in what state, at a given moment. */
export interface SystemState {
  origin: ScenePoint;
  /** Orbit radii are multiplied by this: near is large, falling is nothing. */
  scale: number;
  opacity: number;
  /** How much of the system has surfaced, 0 to 1. */
  emergence: number;
  /** The orbital plane, increasingly strained as the hole takes hold. */
  plane: OrbitPlane;
  /** Which pass of the journey this is, so a wrap can be detected. */
  cycle: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

/**
 * How far along one planet is in surfacing, 0 to 1.
 *
 * The star clears the edge alone and the planets follow it out, innermost
 * first. This is a stagger in appearance only: an earlier version grew each
 * orbit's radius from zero instead, which sent the planets spiralling out from
 * the star rather than travelling the ellipse they belong on.
 */
export function planetEmergence(index: number, emergence: number): number {
  const span = 1 - (PLANETS.length - 1) * ORBIT_LAG;

  return smoothstep(clamp01((emergence - index * ORBIT_LAG) / span));
}

/**
 * The system's journey, in two acts.
 *
 * It surfaces at the far left of the sky, large and close, and crosses towards
 * the hole — easing off and shrinking as the distance opens up. From the middle
 * of the crossing the hole starts to tell on it: the plane rolls out of its
 * resting tilt and the whole system is drawn out along its own axis. Past the
 * capture phase the hole has it outright, and the crossing becomes a plunge
 * that accelerates to the centre while the system folds in and goes out. It
 * arrives as nothing, and begins again at the edge it came from.
 *
 * Nothing ever comes back out. The plunge is cubic and the collapse steep, so
 * the system is spent well before it is anywhere near the horizon, and the next
 * pass starts at the far edge rather than on the wrong side of the hole. Both
 * are asserted, at every viewport, in the layout test.
 */
export function systemState(seconds: number, layout: Layout): SystemState {
  const cycle = Math.floor(seconds / TRAVERSE_SECONDS);
  const phase = (seconds % TRAVERSE_SECONDS) / TRAVERSE_SECONDS;

  const cruise = clamp01(phase / CAPTURE_PHASE);
  const travel = 1 - (1 - cruise) ** APPROACH_EASING;

  // Measured in elapsed time, not in distance covered. Distance is what the
  // easing bends, and hanging the fade off it is what made the system vanish
  // two thirds of the way through.
  const capture = clamp01((phase - CAPTURE_PHASE) / (1 - CAPTURE_PHASE));
  const plunge = capture ** PLUNGE_EASING;

  const fall = smoothstep(clamp01((phase - TIP_PHASE) / (1 - TIP_PHASE)));
  const arrival = clamp01(phase / FADE_IN_PHASE);
  const distance = layout.entryScale + (layout.arrivalScale - layout.entryScale) * travel;

  return {
    origin: {
      x:
        layout.entryX +
        (layout.approachX - layout.entryX) * travel +
        (layout.blackHole.x - layout.approachX) * plunge,
      // Funnelled onto the hole's own line, and exactly on it by the end: the
      // system goes into the hole rather than past it.
      y:
        layout.originY +
        (layout.blackHole.y - layout.originY) * (travel * travel * 0.6 + plunge * 0.4),
    },
    scale: distance * (1 - capture) ** CAPTURE_COLLAPSE,
    opacity: arrival * (1 - capture),
    emergence: clamp01(phase / EMERGE_SPAN),
    plane: {
      flatten: RESTING_PLANE.flatten,
      tilt: RESTING_PLANE.tilt + TILT_ROLL * fall,
      stretch: 1 + STRETCH_GAIN * fall,
      perspective: RESTING_PLANE.perspective,
    },
    cycle,
  };
}

export function computeLayout(width: number, height: number): Layout {
  const isNarrow = width < NARROW_BREAKPOINT;
  const scale = Math.min(width, height);

  // A phone has neither the width for the system to cross nor the room for its
  // labels, so it gets a smaller system in a shorter run rather than the same
  // one spilling off both edges.
  const entryScale = isNarrow ? 0.7 : 1.1;
  const arrivalScale = isNarrow ? 0.34 : 0.5;

  // Mirrors the element's own placement and size, since the scene has to know
  // both where it is falling towards and how much room that leaves.
  const blackHole = {
    x: width * (isNarrow ? 0.92 : 0.97),
    y: height * (isNarrow ? 0.46 : 0.48),
  };
  const blackHoleWidth = isNarrow ? width * 0.98 : scale * 0.78;
  const horizonRadius = blackHoleWidth * (50 / 480);

  // Room for the horizon, the outermost orbit at its widest reach in the state
  // it crosses in, and a margin. Derived rather than tuned, so the fall always
  // begins with the whole system still in clear sky whatever the viewport.
  const clearance =
    horizonRadius * 2.1 + OUTERMOST_ORBIT * scale * arrivalScale * MAX_REACH + scale * 0.03;

  // As far from the hole as the width allows. The system has to look like it is
  // coming from somewhere, and the only somewhere on offer is the far edge.
  const entryX = width * (isNarrow ? 0.24 : 0.12);

  return {
    width,
    height,
    scale,
    entryX,
    approachX: Math.max(entryX + scale * 0.05, blackHole.x - clearance),
    originY: height * 0.5,
    entryScale,
    arrivalScale,
    blackHole,
    starRadius: scale * (isNarrow ? 0.04 : 0.027),
    trailSeconds: isNarrow ? TRAIL_SECONDS_COMPACT : TRAIL_SECONDS,
    // Half a section label on a screen wide enough to show them; barely more
    // than a planet on one where they are read out of the menu instead.
    markerMargin: isNarrow ? 14 : 60,
  };
}
