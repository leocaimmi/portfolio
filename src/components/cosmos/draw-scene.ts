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

/**
 * A black hole after the fashion of Gargantua: an accretion disk seen almost
 * edge-on, its far side lensed up and over the event horizon so the ring
 * closes above the shadow as well as below it.
 *
 * The order of the three passes is the whole trick — far arc, then the
 * shadow, then the near arc. Drawn in any other order it collapses into a flat
 * ring with a dot in the middle.
 */
export function drawBlackHole(
  context: CanvasRenderingContext2D,
  centre: ScenePoint,
  radius: number,
  palette: Palette,
  seconds: number,
): void {
  const diskRadius = radius * 2.7;

  const halo = context.createRadialGradient(
    centre.x,
    centre.y,
    radius * 0.85,
    centre.x,
    centre.y,
    diskRadius * 1.6,
  );
  halo.addColorStop(0, rgba(palette.solar, 0.22));
  halo.addColorStop(0.4, rgba(palette.solar, 0.07));
  halo.addColorStop(1, rgba(palette.solar, 0));

  context.fillStyle = halo;
  context.beginPath();
  context.arc(centre.x, centre.y, diskRadius * 1.6, 0, TAU);
  context.fill();

  // Far side of the disk, bent up and over the shadow by the lensing.
  drawAccretionArc(context, centre, diskRadius, radius * 1.22, palette, seconds, true);

  context.fillStyle = rgba(palette.void, 1);
  context.beginPath();
  context.arc(centre.x, centre.y, radius, 0, TAU);
  context.fill();

  // Near side, passing in front of the shadow.
  drawAccretionArc(context, centre, diskRadius, radius * 0.34, palette, seconds, false);

  // Photon ring: a thin, very bright circle hugging the shadow.
  context.strokeStyle = rgba(palette.solar, 0.7);
  context.lineWidth = Math.max(1, radius * 0.03);
  context.beginPath();
  context.arc(centre.x, centre.y, radius * 1.04, 0, TAU);
  context.stroke();
}

function drawAccretionArc(
  context: CanvasRenderingContext2D,
  centre: ScenePoint,
  radiusX: number,
  radiusY: number,
  palette: Palette,
  seconds: number,
  isFarSide: boolean,
): void {
  // Doppler beaming: matter turning towards the viewer burns brighter. The
  // peak drifts so the disk reads as turbulent rather than painted on.
  const shimmer = 0.5 + 0.5 * Math.sin(seconds * 0.4);

  const gradient = context.createLinearGradient(
    centre.x - radiusX,
    centre.y,
    centre.x + radiusX,
    centre.y,
  );
  gradient.addColorStop(0, rgba(palette.nebula, 0.1));
  gradient.addColorStop(0.28, rgba(palette.comet, 0.3 + shimmer * 0.2));
  gradient.addColorStop(0.5, rgba(palette.solar, 0.9));
  gradient.addColorStop(0.68, rgba(palette.starlight, 0.6));
  gradient.addColorStop(1, rgba(palette.solar, 0.14));

  context.strokeStyle = gradient;
  context.lineWidth = Math.max(1.5, radiusY * 0.5);
  context.beginPath();
  context.ellipse(
    centre.x,
    centre.y,
    radiusX,
    radiusY,
    0,
    isFarSide ? Math.PI : 0,
    isFarSide ? TAU : Math.PI,
  );
  context.stroke();
}

export type { PlanetDefinition };
