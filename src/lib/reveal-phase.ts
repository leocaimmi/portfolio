/**
 * How an element stands in relation to the fold, from a reveal's point of view.
 *
 * Four cases rather than a boolean, because "on screen" and "worth animating"
 * are different questions, and answering them together is what makes an
 * entrance flicker: the element gets painted, the animation's first frame
 * blanks it, and it fades back in.
 */
export type RevealPhase =
  /** Never measured — no observer, no hydration, nothing yet. Leave it alone. */
  | 'unobserved'
  /** Measured off screen. Safe to hide: nobody is looking at it. */
  | 'hidden'
  /** Came in from off screen. This is the arrival worth animating. */
  | 'arriving'
  /** On screen without ever having been hidden. Painted; animating it would blink. */
  | 'present';

export interface Sighting {
  /** What the observer reported, margins and all. */
  intersecting: boolean;
  /** The element's own box in viewport coordinates. */
  top: number;
  bottom: number;
  /** The bottom of the viewport itself, with no margin applied. */
  fold: number;
}

/**
 * Moves an element to its next phase given what the observer just saw.
 *
 * Two rules, and everything follows from them. An element is hidden only while
 * it is entirely off screen, so hiding one is never something the reader can
 * see. And the animation runs only on the way out of `hidden`, so it never
 * starts over content that is already painted.
 *
 * Intersecting is not the same as visible: the observer runs with a negative
 * bottom margin to hold the reveal back until an element is properly on screen,
 * which reports the last strip of the viewport as out of view while the reader
 * is looking straight at it. That strip is why the element's own box decides
 * whether hiding is safe, rather than the margined one.
 */
export function nextRevealPhase(previous: RevealPhase, sighting: Sighting): RevealPhase {
  if (sighting.intersecting) {
    return previous === 'hidden' ? 'arriving' : settled(previous);
  }

  const offScreen = sighting.top >= sighting.fold || sighting.bottom <= 0;

  return offScreen ? 'hidden' : settled(previous);
}

/** Anything on screen that has no entrance left to play stays as it is. */
function settled(previous: RevealPhase): RevealPhase {
  return previous === 'unobserved' ? 'present' : previous;
}
