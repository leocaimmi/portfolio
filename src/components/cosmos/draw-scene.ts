import type { Palette, Rgb } from './palette';
import { rgba } from './palette';
import type { PlanetDefinition, ScenePoint } from './scene-geometry';

/**
 * Painting routines for the hero scene.
 *
 * Kept apart from the React component so the drawing reads as drawing: every
 * function here takes a context and numbers, touches no state, and returns
 * nothing.
 */

const TAU = Math.PI * 2;

export interface SceneStar {
  x: number;
  y: number;
  /** 0 is distant and barely moves; 1 is near and streaks past. */
  depth: number;
  size: number;
  alpha: number;
}

/**
 * The star field being drawn into the black hole.
 *
 * Distinct from the page-wide backdrop: these stars stream towards the hole at
 * a rate set by their depth, and bend towards its plane as they get closer.
 * That is what makes the hole read as the thing pulling everything in, rather
 * than a bright shape that happens to be on the right.
 *
 * The bend is a function of horizontal position rather than of elapsed time, so
 * it stays continuous across the wrap: a star that reappears on the left starts
 * again from its own latitude instead of jumping.
 */
export function drawSceneStars(
  context: CanvasRenderingContext2D,
  stars: readonly SceneStar[],
  width: number,
  seconds: number,
  drift: number,
  blackHoleY: number,
  palette: Palette,
): void {
  context.save();
  context.lineCap = 'round';

  for (const star of stars) {
    const travelled = drift * star.depth * seconds;
    const x = (((star.x + travelled) % width) + width) % width;

    const approach = x / width;
    const y = star.y + (blackHoleY - star.y) * approach * approach * 0.4;
    const streak = star.depth * star.depth * 15;

    context.strokeStyle = rgba(palette.starlight, star.alpha);
    context.fillStyle = rgba(palette.starlight, star.alpha);

    // Only the nearest few stretch. If most of the field streaks it stops
    // reading as stars and starts reading as a screen full of dashes.
    if (streak > 4) {
      context.lineWidth = star.size;
      context.beginPath();
      // The streak trails the star, so it points away from the hole.
      context.moveTo(x - streak, y);
      context.lineTo(x, y);
      context.stroke();
    } else {
      context.fillRect(x, y, star.size, star.size);
    }
  }

  context.restore();
}

export function drawStar(
  context: CanvasRenderingContext2D,
  origin: ScenePoint,
  radius: number,
  palette: Palette,
): void {
  const halo = context.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, radius * 8);
  halo.addColorStop(0, rgba(palette.solar, 0.4));
  halo.addColorStop(0.35, rgba(palette.nebula, 0.16));
  halo.addColorStop(1, rgba(palette.nebula, 0));

  context.fillStyle = halo;
  context.beginPath();
  context.arc(origin.x, origin.y, radius * 8, 0, TAU);
  context.fill();

  const core = context.createRadialGradient(
    origin.x - radius * 0.3,
    origin.y - radius * 0.35,
    0,
    origin.x,
    origin.y,
    radius,
  );
  core.addColorStop(0, rgba(palette.starlight, 1));
  core.addColorStop(0.45, rgba(palette.solar, 1));
  core.addColorStop(1, rgba(palette.solar, 0.5));

  context.fillStyle = core;
  context.beginPath();
  context.arc(origin.x, origin.y, radius, 0, TAU);
  context.fill();
}

/**
 * A planet's recent path.
 *
 * Trails are kept as points rather than accumulated as pixels: the history can
 * be dropped the moment the scene stops being visible, and the lines stay crisp
 * at any resolution.
 *
 * The tail is one path stroked twice — a wide, faint pass for the glow and a
 * narrow bright one for the core — rather than a segment per sample with its
 * own alpha. Because the drift is horizontal, a gradient running from the
 * oldest point to the newest reproduces the fade almost exactly, at two draw
 * calls a planet instead of several hundred.
 */
export function drawTrail(
  context: CanvasRenderingContext2D,
  points: readonly ScenePoint[],
  color: Rgb,
  width: number,
): void {
  const tail = points[0];
  const head = points[points.length - 1];

  if (points.length < 2 || !tail || !head) {
    return;
  }

  // A zero-length gradient axis paints nothing at all, so skip the frames
  // before the tail has pulled away from the head.
  if (Math.abs(head.x - tail.x) < 1 && Math.abs(head.y - tail.y) < 1) {
    return;
  }

  context.lineCap = 'round';
  context.lineJoin = 'round';

  const trace = () => {
    context.beginPath();
    context.moveTo(tail.x, tail.y);

    for (let index = 1; index < points.length; index += 1) {
      const point = points[index];

      if (point) {
        context.lineTo(point.x, point.y);
      }
    }

    context.stroke();
  };

  const ramp = (peak: number): CanvasGradient => {
    const gradient = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
    gradient.addColorStop(0, rgba(color, 0));
    gradient.addColorStop(0.45, rgba(color, peak * 0.28));
    gradient.addColorStop(0.85, rgba(color, peak * 0.75));
    gradient.addColorStop(1, rgba(color, peak));

    return gradient;
  };

  context.strokeStyle = ramp(0.3);
  context.lineWidth = width * 3.4;
  trace();

  context.strokeStyle = ramp(0.95);
  context.lineWidth = width;
  trace();
}

export function drawPlanet(
  context: CanvasRenderingContext2D,
  position: ScenePoint,
  radius: number,
  color: Rgb,
  isActive: boolean,
): void {
  if (isActive) {
    const glow = context.createRadialGradient(
      position.x,
      position.y,
      0,
      position.x,
      position.y,
      radius * 5,
    );
    glow.addColorStop(0, rgba(color, 0.5));
    glow.addColorStop(1, rgba(color, 0));

    context.fillStyle = glow;
    context.beginPath();
    context.arc(position.x, position.y, radius * 5, 0, TAU);
    context.fill();
  }

  const body = context.createRadialGradient(
    position.x - radius * 0.35,
    position.y - radius * 0.4,
    0,
    position.x,
    position.y,
    radius,
  );
  body.addColorStop(0, rgba(color, 1));
  body.addColorStop(1, rgba(color, 0.55));

  context.fillStyle = body;
  context.beginPath();
  context.arc(position.x, position.y, radius, 0, TAU);
  context.fill();
}

export type { PlanetDefinition };
