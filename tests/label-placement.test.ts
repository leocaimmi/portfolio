import { describe, expect, it } from 'vitest';

import type { LabelCandidate, LabelPlacement } from '@/components/cosmos/label-placement';
import {
  INITIAL_LABEL,
  LABEL_DWELL_SECONDS,
  labelOffset,
  placeLabels,
} from '@/components/cosmos/label-placement';

const FRAME = { width: 400, height: 300, gap: 9, seconds: 10 };

function candidate(overrides: Partial<LabelCandidate> = {}): LabelCandidate {
  return { x: 200, y: 150, radius: 4, width: 50, height: 13.5, eligible: true, ...overrides };
}

/** A planet with no name of its own, standing where a label might go. */
function obstacle(x: number, y: number): LabelCandidate {
  return candidate({ x, y, eligible: false });
}

describe('label placement', () => {
  it('puts a name below its planet when there is room', () => {
    const [placement] = placeLabels([candidate()], [], FRAME);

    expect(placement?.side).toBe('below');
  });

  it('moves a name round its planet when another planet takes the space', () => {
    const [placement] = placeLabels([candidate(), obstacle(200, 166)], [], FRAME);

    expect(placement?.side).toBe('above');
  });

  it('moves a name that would leave the scene', () => {
    const [placement] = placeLabels([candidate({ y: FRAME.height - 10 })], [], FRAME);

    expect(placement?.side).toBe('above');
  });

  it('pulls a name in from the side of the scene rather than cut it off', () => {
    const owner = candidate({ x: 10 });
    const offset = labelOffset(owner, 'below', FRAME);

    expect(owner.x + offset.x).toBeGreaterThanOrEqual(0);
    expect(owner.x + offset.x + owner.width).toBeLessThanOrEqual(FRAME.width);
  });

  /* Two names touching are not two names covering each other. */
  it('lets a name graze its neighbour without moving', () => {
    const planets = [candidate(), candidate({ x: 252 })];
    const placements = placeLabels(planets, [], FRAME);

    expect(placements.map((placement) => placement.side)).toEqual(['below', 'below']);
  });

  it('holds a name where it is when no side is clearly better', () => {
    const planets = [
      candidate(),
      obstacle(200, 166),
      obstacle(200, 134),
      obstacle(234, 150),
      obstacle(166, 150),
    ];
    const [placement] = placeLabels(planets, [], FRAME);

    expect(placement?.side).toBe('below');
  });

  /*
   * Otherwise two planets passing each other set their names hopping back and
   * forth: a name that has just moved stays put for a moment, even if its new
   * side is taken in turn.
   */
  it('does not move a name again straight away', () => {
    const moved: LabelPlacement = { side: 'above', movedAt: FRAME.seconds };
    const planets = [candidate(), obstacle(200, 134)];

    const soon = { ...FRAME, seconds: FRAME.seconds + LABEL_DWELL_SECONDS / 2 };
    const [held] = placeLabels(planets, [moved], soon);

    expect(held).toEqual(moved);

    const later = { ...FRAME, seconds: FRAME.seconds + LABEL_DWELL_SECONDS + 0.05 };
    const [free] = placeLabels(planets, [moved], later);

    expect(free).toEqual({ side: 'below', movedAt: later.seconds });
  });

  it('starts every name below its planet', () => {
    expect(INITIAL_LABEL.side).toBe('below');
  });
});
