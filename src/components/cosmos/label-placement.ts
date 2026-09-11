/**
 * Which side of its planet each name sits on, frame by frame.
 *
 * Five names do not fit around a system the width of a phone. The orbits there
 * are a couple of dozen pixels apart and the names are wider than that, so
 * wherever two planets draw level their labels land on top of one another.
 * Hiding every name on a small screen was the old answer, and it also hid that
 * the planets are links. Fading out whichever name had no room was the next
 * one, and it read as the names blinking on and off.
 *
 * So a name never goes. It sits below its planet, and when another name or
 * another planet takes that space it moves to whichever side of its own
 * planet is clear: above, to the right or to the left. Where every side is
 * taken it stays put and is overlapped for a moment, which is rarer and
 * briefer than a name disappearing was.
 *
 * Calm is worth more than a perfect layout. A name only moves for a real
 * clash, not for grazing a neighbour, only to somewhere clearly better, and
 * never twice in quick succession — otherwise two planets passing each other
 * would set their names hopping back and forth.
 *
 * Pure and separate from the component, like the layout, so the rules can be
 * asserted in a test rather than checked by eye on whichever phone was nearest.
 */

export type LabelSide = 'below' | 'above' | 'right' | 'left';

export interface LabelCandidate {
  /** The planet the label belongs to, in scene pixels. */
  x: number;
  y: number;
  /** The planet's body as drawn. Zero while it cannot be seen. */
  radius: number;
  width: number;
  height: number;
  /** False while the planet is too faint, or too near an edge, to carry a name. */
  eligible: boolean;
}

export interface LabelPlacement {
  side: LabelSide;
  /** Scene time at which the label last changed side. */
  movedAt: number;
}

export interface LabelFrame {
  width: number;
  height: number;
  /** From a planet's centre to the near edge of its label. */
  gap: number;
  /** Scene time of the frame being placed. */
  seconds: number;
}

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Clear space a label keeps from other labels, other planets and the frame. */
const LABEL_PADDING = 3;

/** Seconds a label stays on a side once it has moved there. */
export const LABEL_DWELL_SECONDS = 1;

/**
 * How much of its own area a label may have crowded before it moves. Below
 * this, two names are touching rather than covering each other, and moving
 * for that is movement for nothing.
 */
const LABEL_TOLERANCE = 0.1;

/** In order of preference: below is home, and the rest are ways round a clash. */
const SIDES: readonly LabelSide[] = ['below', 'above', 'right', 'left'];

export const INITIAL_LABEL: LabelPlacement = { side: 'below', movedAt: -Infinity };

/**
 * Where a label's top-left corner sits relative to its planet's centre.
 *
 * Pulled sideways where it would cross the left or right edge of the scene, so
 * a name near the edge is drawn whole rather than cut in half.
 */
export function labelOffset(
  candidate: LabelCandidate,
  side: LabelSide,
  frame: Pick<LabelFrame, 'width' | 'gap'>,
): { x: number; y: number } {
  const { width, height } = candidate;
  const { gap } = frame;

  const x = {
    below: -width / 2,
    above: -width / 2,
    right: gap,
    left: -gap - width,
  }[side];

  const y = {
    below: gap,
    above: -gap - height,
    right: -height / 2,
    left: -height / 2,
  }[side];

  const left = Math.min(
    Math.max(candidate.x + x, LABEL_PADDING),
    frame.width - LABEL_PADDING - width,
  );

  return { x: left - candidate.x, y };
}

function labelBox(candidate: LabelCandidate, side: LabelSide, frame: LabelFrame): Box {
  const offset = labelOffset(candidate, side, frame);
  const left = candidate.x + offset.x;
  const top = candidate.y + offset.y;

  return { left, right: left + candidate.width, top, bottom: top + candidate.height };
}

function bodyBox(candidate: LabelCandidate): Box {
  return {
    left: candidate.x - candidate.radius,
    right: candidate.x + candidate.radius,
    top: candidate.y - candidate.radius,
    bottom: candidate.y + candidate.radius,
  };
}

/** Area two boxes share once the first is grown by `padding` all round. */
function shared(a: Box, b: Box, padding: number): number {
  const across = Math.min(a.right + padding, b.right) - Math.max(a.left - padding, b.left);
  const down = Math.min(a.bottom + padding, b.bottom) - Math.max(a.top - padding, b.top);

  return across > 0 && down > 0 ? across * down : 0;
}

/**
 * Decides which side of its planet every name sits on this frame.
 *
 * Each label is weighed against the others where they already are — the ones
 * decided this frame on their new sides, the rest on their previous ones — and
 * against every visible planet, its own included, since a name pulled in from
 * the edge of the scene can end up across the body it belongs to.
 */
export function placeLabels(
  candidates: readonly LabelCandidate[],
  previous: readonly LabelPlacement[],
  frame: LabelFrame,
): LabelPlacement[] {
  const placements = candidates.map((_candidate, index) => previous[index] ?? INITIAL_LABEL);

  const boxes = candidates.map((candidate, index) =>
    candidate.eligible ? labelBox(candidate, placements[index]?.side ?? 'below', frame) : undefined,
  );

  const bodies = candidates.map((candidate) =>
    candidate.radius > 0 ? bodyBox(candidate) : undefined,
  );

  const crowding = (box: Box, owner: number): number => {
    const outside =
      box.top < LABEL_PADDING || box.bottom > frame.height - LABEL_PADDING ? Infinity : 0;

    const labels = boxes.reduce(
      (sum, other, index) =>
        index === owner || !other ? sum : sum + shared(box, other, LABEL_PADDING),
      0,
    );

    // Covering a body hides a planet, which is worse than covering a name.
    const planets = bodies.reduce(
      (sum, body, index) =>
        body ? sum + shared(box, body, index === owner ? 0 : LABEL_PADDING) * 2 : sum,
      0,
    );

    return outside + labels + planets;
  };

  candidates.forEach((candidate, index) => {
    const placement = placements[index] ?? INITIAL_LABEL;

    if (!candidate.eligible) {
      return;
    }

    const current = crowding(labelBox(candidate, placement.side, frame), index);
    const isSettled = frame.seconds - placement.movedAt < LABEL_DWELL_SECONDS;
    const grazes = current <= LABEL_TOLERANCE * candidate.width * candidate.height;

    let side = placement.side;

    // Leaving the scene is not a clash that can wait out the dwell.
    if (current === Infinity || (!isSettled && !grazes)) {
      let best = current;

      for (const option of SIDES) {
        const crowd =
          option === placement.side ? current : crowding(labelBox(candidate, option, frame), index);

        // Clearly better, not marginally: a name that moves for a sliver of
        // space moves back for the next one.
        if (crowd < best && crowd < current / 2) {
          best = crowd;
          side = option;
        }
      }
    }

    if (side !== placement.side) {
      placements[index] = { side, movedAt: frame.seconds };
    }

    boxes[index] = labelBox(candidate, side, frame);
  });

  return placements;
}
