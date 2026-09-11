import { describe, expect, it } from 'vitest';

import type { LabelCandidate, LabelPlacement } from '@/components/cosmos/label-placement';
import {
  INITIAL_LABEL,
  LABEL_DWELL_SECONDS,
  labelOffset,
  placeLabels,
} from '@/components/cosmos/label-placement';
import { planetPosition, PLANETS } from '@/components/cosmos/scene-geometry';
import {
  computeLayout,
  NARROW_BREAKPOINT,
  planetEmergence,
  systemState,
  TRAVERSE_SECONDS,
  VISIBILITY_THRESHOLD,
} from '@/components/cosmos/scene-layout';

const FRAME = { width: 400, height: 300, gap: 9, seconds: 10 };

function candidate(overrides: Partial<LabelCandidate> = {}): LabelCandidate {
  return { x: 200, y: 150, radius: 4, width: 50, height: 13.5, eligible: true, ...overrides };
}

/** A planet with no name of its own, standing where a label might go. */
function obstacle(x: number, y: number): LabelCandidate {
  return candidate({ x, y, eligible: false });
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Where the scene draws a label, using the same offset it does. */
function labelRect(owner: LabelCandidate, placement: LabelPlacement, width: number, gap: number) {
  const offset = labelOffset(owner, placement.side, { width, gap });
  const left = owner.x + offset.x;
  const top = owner.y + offset.y;

  return { left, right: left + owner.width, top, bottom: top + owner.height };
}

function sharedArea(a: Rect, b: Rect): number {
  const across = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const down = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);

  return across > 0 && down > 0 ? across * down : 0;
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

/**
 * Scene sizes rather than screen sizes: on a phone the scene is the lower half
 * of the hero, below the copy. Above the breakpoint it fills the hero.
 */
const SCENES: readonly (readonly [number, number])[] = [
  [320, 330],
  [360, 420],
  [375, 459],
  [414, 500],
  [700, 420],
  [1024, 640],
  [1440, 900],
  [1920, 1080],
];

/** Spanish, which has the longer of the two sets of names. */
const NAMES = ['Perfil', 'Trayectoria', 'Misiones', 'Stack', 'Contacto'];

/**
 * The type the names are set in, as measured in the browser: nine-pixel mono
 * on a phone and ten-pixel above the breakpoint, each with its tracking.
 */
function typeFor(width: number): { character: number; line: number } {
  return width < NARROW_BREAKPOINT ? { character: 6.67, line: 13.5 } : { character: 7.8, line: 15 };
}

interface JourneyFrame {
  seconds: number;
  candidates: LabelCandidate[];
  placements: LabelPlacement[];
  isVisible: boolean;
}

/** A whole journey at thirty frames a second, fed in the way the scene feeds it. */
function journey(width: number, height: number): { gap: number; frames: JourneyFrame[] } {
  const layout = computeLayout(width, height);
  const type = typeFor(width);
  const frames: JourneyFrame[] = [];
  let placements: LabelPlacement[] = PLANETS.map(() => INITIAL_LABEL);

  for (let frame = 0; frame < TRAVERSE_SECONDS * 30; frame += 1) {
    const seconds = frame / 30;
    const system = systemState(seconds, layout);
    const orbitScale = layout.scale * system.scale;

    const candidates = PLANETS.map((planet, index): LabelCandidate => {
      const position = planetPosition(planet, seconds, system.origin, orbitScale, system.plane);
      const visibility = system.opacity * planetEmergence(index, system.emergence);
      const inset = Math.min(position.x, width - position.x, position.y, height - position.y);
      const edge = Math.min(1, Math.max(0, inset / layout.markerMargin));

      return {
        x: position.x,
        y: position.y,
        radius: visibility >= VISIBILITY_THRESHOLD ? planet.size * orbitScale * position.depth : 0,
        width: (NAMES[index]?.length ?? 0) * type.character,
        height: type.line,
        eligible: visibility * edge >= 0.5,
      };
    });

    placements = placeLabels(candidates, placements, {
      width,
      height,
      gap: layout.labelGap,
      seconds,
    });

    frames.push({
      seconds,
      candidates,
      placements,
      isVisible: system.opacity >= VISIBILITY_THRESHOLD,
    });
  }

  return { gap: layout.labelGap, frames };
}

/** Every name a frame draws, as the rectangle it is drawn in. */
function drawnLabels(frame: JourneyFrame, width: number, gap: number): Rect[] {
  return frame.placements.flatMap((placement, index) => {
    const owner = frame.candidates[index];

    return owner?.eligible ? [labelRect(owner, placement, width, gap)] : [];
  });
}

/*
 * Each check collects the frames that break it and asserts once, so a failure
 * names the frames at fault and a passing run is not thousands of assertions.
 */
describe('label placement across a journey', () => {
  it.each(SCENES)('keeps every name whole inside the scene at %ix%i', (width, height) => {
    const { gap, frames } = journey(width, height);

    const escapes = frames.filter((frame) =>
      drawnLabels(frame, width, gap).some(
        (rect) => rect.left < 0 || rect.top < 0 || rect.right > width || rect.bottom > height,
      ),
    );

    expect(escapes).toHaveLength(0);
  });

  /*
   * A name that moves is a name that is harder to read, so they have to be
   * still most of the time: on average each one keeps its place for well over
   * ten seconds at a stretch.
   */
  it.each(SCENES)('keeps the names still most of the time at %ix%i', (width, height) => {
    const { frames } = journey(width, height);

    const moves = frames.reduce(
      (count, frame, position) =>
        count +
        frame.placements.filter(
          (placement, index) => placement.side !== frames[position - 1]?.placements[index]?.side,
        ).length,
      0,
    );

    const perNamePerMinute = moves / PLANETS.length / (TRAVERSE_SECONDS / 60);

    expect(perNamePerMinute).toBeLessThan(5);
  });

  /*
   * What moving round is for. Where every side of a planet is taken two names
   * can still meet, but only for moments: a name more than a quarter covered
   * is rare on a phone and all but unheard of above the breakpoint.
   */
  it.each(SCENES)('rarely lets one name cover another at %ix%i', (width, height) => {
    const { gap, frames } = journey(width, height);
    const visible = frames.filter((frame) => frame.isVisible);

    const covered = visible.filter((frame) => {
      const rects = drawnLabels(frame, width, gap);

      return rects.some((rect, position) =>
        rects.slice(position + 1).some((other) => {
          const smaller = Math.min(
            (rect.right - rect.left) * (rect.bottom - rect.top),
            (other.right - other.left) * (other.bottom - other.top),
          );

          return sharedArea(rect, other) > smaller / 4;
        }),
      );
    }).length;

    expect(covered / visible.length).toBeLessThan(width < NARROW_BREAKPOINT ? 0.08 : 0.01);
  });
});
