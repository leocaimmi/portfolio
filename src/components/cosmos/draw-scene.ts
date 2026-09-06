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

/*
 * Accretion palette, taken from Diego Inácio's SVG Gargantua study
 * (diegoinacio.github.io, MIT). These are not design tokens: the disk is
 * incandescent matter, and its colour comes from its temperature rather than
 * from the site's palette.
 */
const DISK_CORE: Rgb = [255, 236, 200];
const DISK_WARM: Rgb = [255, 150, 50];
const DISK_DEEP: Rgb = [255, 90, 0];
const DISK_EDGE: Rgb = [255, 0, 55];

/** Inclination of the disk, in radians. Roughly matches the orbital plane. */
const DISK_TILT = -0.38;

/** Vertical squash of the disk, seen close to edge-on. */
const DISK_FLATTEN = 0.3;

/**
 * A black hole after the fashion of Gargantua.
 *
 * Adapted from Diego Inácio's SVG study, which builds the effect out of an
 * inclined disk, a chromatically split photon ring and a glow blurred far more
 * along the plane than across it. SVG filters have no canvas equivalent, so
 * each is reproduced directly: the glow is an anisotropically scaled radial
 * gradient, the chromatic ring is three offset strokes composited additively,
 * and the orbiting matter is a dashed stroke whose offset advances with time.
 *
 * The order of the passes is the whole illusion — glow, far side of the disk
 * lensed over the top, the shadow, the near side, then the photon ring. Drawn
 * in any other order it collapses into a flat ring with a dot in the middle.
 */
export function drawBlackHole(
  context: CanvasRenderingContext2D,
  centre: ScenePoint,
  radius: number,
  palette: Palette,
  seconds: number,
): void {
  const diskRadius = radius * 2.9;

  drawDiskGlow(context, centre, diskRadius);

  // Far side of the disk: gravity bends it up and over the shadow, which is
  // why the ring appears to close above the hole as well as below it.
  drawAccretionArc(context, centre, diskRadius, radius * 1.3, seconds, true);

  const horizon = context.createRadialGradient(
    centre.x,
    centre.y,
    radius * 0.2,
    centre.x,
    centre.y,
    radius,
  );
  horizon.addColorStop(0, 'rgb(0, 0, 0)');
  horizon.addColorStop(0.82, 'rgb(0, 0, 0)');
  horizon.addColorStop(1, rgba(palette.void, 0.92));

  context.fillStyle = horizon;
  context.beginPath();
  context.arc(centre.x, centre.y, radius, 0, TAU);
  context.fill();

  // Near side, passing in front of the shadow.
  drawAccretionArc(context, centre, diskRadius, radius * DISK_FLATTEN, seconds, false);

  drawPhotonRing(context, centre, radius, seconds);
}

/**
 * The flare around the hole.
 *
 * The reference blurs it five times as much along the plane as across it
 * (`stdDeviation="15 3"`). A canvas gradient is isotropic, so the same shape
 * comes from scaling the axes before drawing a circular one.
 */
function drawDiskGlow(
  context: CanvasRenderingContext2D,
  centre: ScenePoint,
  diskRadius: number,
): void {
  context.save();
  context.translate(centre.x, centre.y);
  context.rotate(DISK_TILT);
  context.scale(1, 0.34);

  const glow = context.createRadialGradient(0, 0, 0, 0, 0, diskRadius * 1.5);
  glow.addColorStop(0, rgba(DISK_WARM, 0.34));
  glow.addColorStop(0.35, rgba(DISK_DEEP, 0.16));
  glow.addColorStop(0.7, rgba(DISK_EDGE, 0.06));
  glow.addColorStop(1, rgba(DISK_EDGE, 0));

  context.fillStyle = glow;
  context.beginPath();
  context.arc(0, 0, diskRadius * 1.5, 0, TAU);
  context.fill();

  context.restore();
}

/**
 * One half of the accretion disk.
 *
 * Two strokes: a continuous band for the body of the disk, then a dashed one
 * whose offset advances with time, which is the canvas equivalent of the
 * reference's animated `stroke-dasharray` and reads as matter being dragged
 * around the hole.
 */
function drawAccretionArc(
  context: CanvasRenderingContext2D,
  centre: ScenePoint,
  radiusX: number,
  radiusY: number,
  seconds: number,
  isFarSide: boolean,
): void {
  // Doppler beaming: the side turning towards the viewer burns brighter, and
  // the peak drifts so the disk reads as turbulent rather than painted on.
  const shimmer = 0.5 + 0.5 * Math.sin(seconds * 0.4);

  const gradient = context.createLinearGradient(
    centre.x - radiusX,
    centre.y,
    centre.x + radiusX,
    centre.y,
  );
  gradient.addColorStop(0, rgba(DISK_EDGE, 0.12));
  gradient.addColorStop(0.26, rgba(DISK_DEEP, 0.42 + shimmer * 0.18));
  gradient.addColorStop(0.5, rgba(DISK_WARM, 0.9));
  gradient.addColorStop(0.68, rgba(DISK_CORE, 0.95));
  gradient.addColorStop(1, rgba(DISK_DEEP, 0.16));

  const startAngle = isFarSide ? Math.PI : 0;
  const endAngle = isFarSide ? TAU : Math.PI;

  context.save();
  context.lineCap = 'round';

  context.strokeStyle = gradient;
  context.lineWidth = Math.max(1.5, radiusY * 0.5);
  context.beginPath();
  context.ellipse(centre.x, centre.y, radiusX, radiusY, DISK_TILT, startAngle, endAngle);
  context.stroke();

  // Streaks of infalling matter, sliding around the ring.
  context.globalCompositeOperation = 'lighter';
  context.strokeStyle = rgba(DISK_CORE, 0.22);
  context.lineWidth = Math.max(1, radiusY * 0.16);
  context.setLineDash([radiusX * 0.02, radiusX * 0.14]);
  context.lineDashOffset = -seconds * radiusX * (isFarSide ? 0.12 : 0.2);
  context.beginPath();
  context.ellipse(centre.x, centre.y, radiusX, radiusY, DISK_TILT, startAngle, endAngle);
  context.stroke();

  context.restore();
}

/**
 * The photon ring: light circling the hole before escaping.
 *
 * Drawn three times with a sub-pixel offset per channel and composited
 * additively, which is how the reference gets its chromatic fringe — there,
 * three filtered copies in `mix-blend-mode: screen`. The offset breathes so
 * the ring shimmers instead of sitting still.
 */
function drawPhotonRing(
  context: CanvasRenderingContext2D,
  centre: ScenePoint,
  radius: number,
  seconds: number,
): void {
  const spread = radius * 0.012 * (0.6 + 0.4 * Math.sin(seconds * 1.1));

  context.save();
  context.globalCompositeOperation = 'lighter';
  context.lineWidth = Math.max(1, radius * 0.035);

  const channels: readonly (readonly [Rgb, number])[] = [
    [[255, 40, 70], -spread],
    [[110, 255, 190], 0],
    [[70, 150, 255], spread],
  ];

  for (const [colour, offset] of channels) {
    context.strokeStyle = rgba(colour, 0.4);
    context.beginPath();
    context.arc(centre.x + offset, centre.y, radius * 1.045, 0, TAU);
    context.stroke();
  }

  // A thin white core keeps the ring reading as light rather than as three
  // coloured outlines that happen to overlap.
  context.strokeStyle = rgba(DISK_CORE, 0.55);
  context.lineWidth = Math.max(0.75, radius * 0.014);
  context.beginPath();
  context.arc(centre.x, centre.y, radius * 1.045, 0, TAU);
  context.stroke();

  context.restore();
}

export type { PlanetDefinition };
