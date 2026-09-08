import { describe, expect, it } from 'vitest';

import type { RevealPhase, Sighting } from '@/lib/reveal-phase';
import { nextRevealPhase } from '@/lib/reveal-phase';

const FOLD = 900;
const HEIGHT = 200;

/** A sighting of an element whose top edge sits at `top`. */
function at(top: number, intersecting: boolean): Sighting {
  return { intersecting, top, bottom: top + HEIGHT, fold: FOLD };
}

/** Replays a run of sightings and returns the phase they end on. */
function replay(...sightings: Sighting[]): RevealPhase {
  return sightings.reduce<RevealPhase>(nextRevealPhase, 'unobserved');
}

describe('nextRevealPhase', () => {
  it('hides an element that is measured below the fold', () => {
    expect(replay(at(FOLD + 400, false))).toBe('hidden');
  });

  it('hides an element that is measured above the top of the screen', () => {
    expect(replay(at(-HEIGHT - 40, false))).toBe('hidden');
  });

  it('animates a hidden element when it arrives', () => {
    expect(replay(at(FOLD + 400, false), at(300, true))).toBe('arriving');
  });

  it('leaves an element that was on screen before anything was measured', () => {
    expect(replay(at(300, true))).toBe('present');
  });

  /*
   * The reveal is held back by a negative bottom margin, so an element in the
   * last strip of the screen is reported as out of view while the reader can
   * see it perfectly well. Hiding that is the blink this all exists to avoid.
   */
  it('leaves an element that is on screen but held back by the margin', () => {
    expect(replay(at(FOLD - 40, false))).toBe('present');
  });

  it('never animates an element the reader was already looking at', () => {
    expect(replay(at(FOLD - 40, false), at(FOLD - 200, true))).toBe('present');
  });

  it('keeps an element hidden while the margin holds its arrival back', () => {
    expect(replay(at(FOLD + 400, false), at(FOLD - 40, false))).toBe('hidden');
  });

  it('stays on the entrance once it has started', () => {
    expect(replay(at(FOLD + 400, false), at(300, true), at(200, true))).toBe('arriving');
  });
});
