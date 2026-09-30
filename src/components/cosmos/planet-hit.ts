/**
 * Which planet a click was meant for.
 *
 * Every planet in the hero carries a target far larger than the planet itself,
 * so a moving dot a few pixels across can still be hit with a thumb, and its
 * name is part of the same link. The inner orbits run closer together than
 * those targets are wide, and wherever two overlapped, the click went to
 * whichever came later in the document — the same planet every time, whatever
 * the pointer was on. An invisible target could even sit over another planet's
 * name and take the click meant for the word underneath it.
 *
 * Measured by clicking every planet the way a person would: on an emulated
 * phone, seven taps on a planet in fifteen and five on a name in eighteen went
 * to a neighbour's section; on a laptop, one name in nineteen. Rarer there only
 * because the orbits are wider, until the system shrinks into the hole and
 * they close up just the same.
 *
 * So what is on top no longer decides anything. A click belongs to the planet
 * whose dot or name is nearest to it: inside a word is no distance at all from
 * that word, on a dot is none from that dot, and anywhere in between goes to
 * whichever is closer. It is how a map settles a tap among crowded pins, with
 * the names counted as part of the pins.
 *
 * Names get no priority of their own. That was tried, with a few pixels of
 * slack around each word for the width of a thumb, and it let a word take the
 * clicks aimed at the dot right beside it: two taps in thirteen, landing on the
 * planet whose name happened to be passing.
 *
 * The dot does get a little: it counts as a small disc rather than a point, and
 * where it and a word are both under the pointer, the dot wins. A name can pass
 * right over another planet for a moment when every side of its own is taken,
 * and a finger never lands on the exact centre of anything, so a tap on the
 * dot fell inside the word and went to the wrong planet. The dot is the
 * smaller, more deliberate target of the two; hitting it is the stronger sign.
 *
 * Pure and separate from the component, like the layout and the labels, so the
 * rule is asserted in a test rather than tried on whichever screen was nearest.
 */

/** How far from its centre a dot still counts as hit. */
export const DOT_REACH = 4;

export interface HitBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface HitCandidate {
  /** The planet's centre, in the same coordinates as the click. */
  x: number;
  y: number;
  /** Where its name is laid out, or null while it has none. */
  name: HitBox | null;
  /** False while the planet is too faint, or too near an edge, to be a target. */
  reachable: boolean;
}

/** From a point to the nearest part of a box: zero anywhere inside it. */
function distanceToBox(box: HitBox, x: number, y: number): number {
  return Math.hypot(
    Math.max(box.left - x, 0, x - box.right),
    Math.max(box.top - y, 0, y - box.bottom),
  );
}

/**
 * How close a planet is to the pointer, as three things compared in order: how
 * far from its dot or its name; which of the two, a dot ranking ahead of a
 * name; and how far from the middle of that dot or name.
 */
type Score = readonly [distance: number, kind: 0 | 1, middle: number];

function isCloser(a: Score, b: Score): boolean {
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) {
      return (a[index] ?? Infinity) < (b[index] ?? Infinity);
    }
  }

  return false;
}

function score(candidate: HitCandidate, x: number, y: number): Score {
  const { name } = candidate;
  const toCentre = Math.hypot(candidate.x - x, candidate.y - y);
  const toDot = Math.max(0, toCentre - DOT_REACH);
  const toName = name ? distanceToBox(name, x, y) : Infinity;

  if (!name || toDot <= toName) {
    return [toDot, 0, toCentre];
  }

  return [
    toName,
    1,
    Math.hypot((name.left + name.right) / 2 - x, (name.top + name.bottom) / 2 - y),
  ];
}

/** Index of the planet the click at (x, y) was meant for, or -1 when there is none. */
export function planetAt(candidates: readonly HitCandidate[], x: number, y: number): number {
  let best = -1;
  let bestScore: Score = [Infinity, 1, Infinity];

  candidates.forEach((candidate, index) => {
    if (!candidate.reachable) {
      return;
    }

    const candidateScore = score(candidate, x, y);

    if (isCloser(candidateScore, bestScore)) {
      best = index;
      bestScore = candidateScore;
    }
  });

  return best;
}
