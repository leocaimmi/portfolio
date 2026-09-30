import { describe, expect, it } from 'vitest';

import type { HitBox, HitCandidate } from '@/components/cosmos/planet-hit';
import { DOT_REACH, planetAt } from '@/components/cosmos/planet-hit';

function planet(x: number, y: number, name: HitBox | null = null, reachable = true): HitCandidate {
  return { x, y, name, reachable };
}

/** A name fifty pixels wide, the size of a short label on a phone. */
function nameAt(left: number, top: number): HitBox {
  return { left, top, right: left + 50, bottom: top + 13 };
}

describe('planetAt', () => {
  it('gives a click away from any name to the planet nearest it', () => {
    const planets = [planet(100, 100), planet(120, 100), planet(300, 300)];

    expect(planetAt(planets, 102, 101)).toBe(0);
    expect(planetAt(planets, 118, 99)).toBe(1);
  });

  it('decides the same way whatever order the planets are listed in', () => {
    // The bug this replaces: two overlapping targets, and the later one in the
    // document won wherever the pointer actually was.
    const inner = planet(100, 100);
    const outer = planet(130, 100);

    expect(planetAt([inner, outer], 104, 100)).toBe(0);
    expect(planetAt([outer, inner], 104, 100)).toBe(1);
  });

  it('sends a click on a word to that word’s planet, even with another dot nearer its own planet', () => {
    // The first planet's name runs from 60 to 110; the second planet sits at 150.
    const named = planet(40, 100, nameAt(60, 94));
    const neighbour = planet(150, 100);

    expect(planetAt([named, neighbour], 105, 100)).toBe(0);
    expect(planetAt([neighbour, named], 105, 100)).toBe(1);
  });

  it('does not let a passing name take a click aimed at the dot beside it', () => {
    // A name six pixels from someone else's dot: the regression that giving
    // names priority, with slack round the letters, introduced.
    const dot = planet(100, 100);
    const passing = planet(300, 300, nameAt(106, 94));

    expect(planetAt([dot, passing], 100, 100)).toBe(0);
    expect(planetAt([passing, dot], 100, 100)).toBe(1);
  });

  it('sends a click between a name and another dot to whichever is closer', () => {
    // The name ends at x = 110; the other planet sits at x = 130.
    const named = planet(40, 100, nameAt(60, 94));
    const neighbour = planet(130, 100);

    expect(planetAt([named, neighbour], 114, 100)).toBe(0);
    expect(planetAt([named, neighbour], 126, 100)).toBe(1);
  });

  it('settles a click inside two crossing names by whose name is centred nearer', () => {
    const left = planet(0, 0, { left: 100, top: 100, right: 160, bottom: 113 });
    const right = planet(400, 0, { left: 140, top: 100, right: 200, bottom: 113 });

    expect(planetAt([left, right], 145, 106)).toBe(0);
    expect(planetAt([left, right], 158, 106)).toBe(1);
  });

  it('gives a tap on a dot to that dot when a name passes right over it', () => {
    // A finger never lands on the exact centre, and the word covers the dot.
    const dot = planet(100, 100);
    const over = planet(300, 300, nameAt(80, 94));

    expect(planetAt([over, dot], 102, 98)).toBe(1);
    expect(planetAt([dot, over], 100 + DOT_REACH - 1, 100)).toBe(0);
  });

  it('gives the word back its planet a little further from the dot it covers', () => {
    const dot = planet(100, 100);
    const over = planet(300, 300, nameAt(80, 94));

    expect(planetAt([dot, over], 112, 100)).toBe(1);
  });

  it('never picks a planet that cannot be reached, by its name or its dot', () => {
    const faint = planet(100, 100, nameAt(110, 94), false);
    const visible = planet(160, 100);

    expect(planetAt([faint, visible], 100, 100)).toBe(1);
    expect(planetAt([faint, visible], 130, 100)).toBe(1);
  });

  it('reports no planet when none is reachable', () => {
    expect(planetAt([planet(0, 0, null, false), planet(10, 10, null, false)], 5, 5)).toBe(-1);
    expect(planetAt([], 5, 5)).toBe(-1);
  });
});
