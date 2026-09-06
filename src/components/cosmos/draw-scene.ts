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

/** Where along the width a star is close enough to start being torn apart. */
const ABSORPTION_START = 0.72;

/**
 * The star field being drawn into the black hole.
 *
 * Distinct from the page-wide backdrop: these stars stream towards the hole at
 * a rate set by their depth and bend towards its plane as they close, which is
 * what makes the hole read as the thing pulling everything in rather than a
 * bright shape that happens to be on the right.
 *
 * Past `ABSORPTION_START` a star stretches and fades to nothing, and only then
 * does it wrap round to the left. Letting it cross the hole and reappear on the
 * far side would have shown matter leaving a black hole, which is the one thing
 * a black hole is for.
 *
 * The bend and the fade are both functions of horizontal position rather than
 * of elapsed time, so they stay continuous across the wrap: a star reappearing
 * on the left starts again from its own latitude at full brightness.
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
    const cycle = ((((star.x + travelled) / width) % 1) + 1) % 1;

    // Gravitational time dilation, near enough: from out here, infalling matter
    // appears to slow as it nears the horizon rather than speed up. A linear
    // sweep looked like a conveyor belt; this crawls at the end.
    const approach = 1 - (1 - cycle) ** 2.1;
    const x = approach * width;

    // 0 until the star nears the hole, then 1 at the point of no return.
    const capture = Math.max(0, (approach - ABSORPTION_START) / (1 - ABSORPTION_START));

    // Fading in over the first sliver of the journey hides the wrap: a star
    // reappears at the left edge rather than popping into existence there.
    const arrival = Math.min(1, cycle / 0.06);
    const fade = arrival * (1 - capture) ** 2;

    if (fade <= 0.01) {
      continue;
    }

    const y = star.y + (blackHoleY - star.y) * approach * approach * 0.55;
    // Spaghettification: the closer it gets, the more it is drawn out.
    const streak = star.depth * star.depth * 15 + capture * capture * 40;

    context.strokeStyle = rgba(palette.starlight, star.alpha * fade);
    context.fillStyle = rgba(palette.starlight, star.alpha * fade);

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

/**
 * The star at the centre of the system.
 *
 * A star is not a disc of flat colour, and the first version looked like one:
 * too large, and perfectly still. Three things fix that without a texture or a
 * shader — a corona that breathes on two out-of-phase cycles so the rhythm
 * never repeats visibly, a pair of slowly counter-rotating flare arcs, and a
 * limb that darkens towards its edge the way a real photosphere does.
 *
 * `pull` is how hard the hole has hold of it, and it is answered with a plume
 * drawn towards the hole rather than with a change of shape. Scaling the star
 * itself made it an oval, which reads as a squashed sun and not as a star being
 * taken: what a star losing material looks like is a round body with something
 * streaming off it.
 */
export function drawStar(
  context: CanvasRenderingContext2D,
  origin: ScenePoint,
  radius: number,
  palette: Palette,
  seconds: number,
  pull = 0,
  angleToHole = 0,
): void {
  if (pull > 0.01) {
    drawPlume(context, origin, radius, palette, pull, angleToHole);
  }

  // Two incommensurable periods, so the pulse never settles into a loop the
  // eye can predict.
  const pulse = 1 + 0.07 * Math.sin(seconds * 0.83) + 0.035 * Math.sin(seconds * 2.17 + 1.1);
  const coronaRadius = radius * 8.5 * pulse;

  const halo = context.createRadialGradient(
    origin.x,
    origin.y,
    radius * 0.5,
    origin.x,
    origin.y,
    coronaRadius,
  );
  halo.addColorStop(0, rgba(palette.solar, 0.34));
  halo.addColorStop(0.28, rgba(palette.solar, 0.13));
  halo.addColorStop(0.6, rgba(palette.nebula, 0.08));
  halo.addColorStop(1, rgba(palette.nebula, 0));

  context.fillStyle = halo;
  context.beginPath();
  context.arc(origin.x, origin.y, coronaRadius, 0, TAU);
  context.fill();

  drawCorona(context, origin, radius, palette, seconds);

  // Limb darkening: brightest just off centre, cooling towards the edge.
  const core = context.createRadialGradient(
    origin.x - radius * 0.28,
    origin.y - radius * 0.32,
    0,
    origin.x,
    origin.y,
    radius,
  );
  core.addColorStop(0, rgba(palette.starlight, 1));
  core.addColorStop(0.35, rgba(palette.solar, 1));
  core.addColorStop(0.86, rgba(palette.solar, 0.95));
  core.addColorStop(1, rgba(palette.comet, 0.7));

  context.fillStyle = core;
  context.beginPath();
  context.arc(origin.x, origin.y, radius, 0, TAU);
  context.fill();
}

/**
 * The star's own matter, streaming off towards the hole.
 *
 * A teardrop leaving the limb and thinning to nothing, painted under the body
 * so the star stays a star and only what it is losing is out of shape.
 */
function drawPlume(
  context: CanvasRenderingContext2D,
  origin: ScenePoint,
  radius: number,
  palette: Palette,
  pull: number,
  angleToHole: number,
): void {
  const length = radius * (1.6 + pull * 9);
  const mouth = radius * 0.85;

  context.save();
  context.translate(origin.x, origin.y);
  context.rotate(angleToHole);
  context.globalCompositeOperation = 'lighter';

  const stream = context.createLinearGradient(0, 0, length, 0);
  stream.addColorStop(0, rgba(palette.solar, 0.55 * pull));
  stream.addColorStop(0.45, rgba(palette.comet, 0.22 * pull));
  stream.addColorStop(1, rgba(palette.comet, 0));

  context.fillStyle = stream;
  context.beginPath();
  context.moveTo(0, -mouth);
  context.quadraticCurveTo(length * 0.55, -mouth * 0.32, length, 0);
  context.quadraticCurveTo(length * 0.55, mouth * 0.32, 0, mouth);
  context.closePath();
  context.fill();

  context.restore();
}

/** Faint arcs turning around the star, at odds with each other so it churns. */
function drawCorona(
  context: CanvasRenderingContext2D,
  origin: ScenePoint,
  radius: number,
  palette: Palette,
  seconds: number,
): void {
  const arcs: readonly (readonly [number, number, number, number])[] = [
    // [radius multiple, angular speed, sweep in radians, alpha]
    [1.5, 0.22, 2.1, 0.3],
    [1.9, -0.14, 1.4, 0.2],
    [2.4, 0.09, 2.6, 0.12],
  ];

  context.save();
  context.globalCompositeOperation = 'lighter';
  context.lineCap = 'round';

  for (const [scale, speed, sweep, alpha] of arcs) {
    const from = seconds * speed;

    context.strokeStyle = rgba(palette.solar, alpha);
    context.lineWidth = Math.max(0.6, radius * 0.16);
    context.beginPath();
    context.arc(origin.x, origin.y, radius * scale, from, from + sweep);
    context.stroke();
  }

  context.restore();
}

/** Number of pieces a trail is stroked in. Higher is smoother and costs more. */
const TRAIL_SEGMENTS = 18;

/**
 * A planet's recent path.
 *
 * Trails are kept as points rather than accumulated as pixels: the history can
 * be dropped the moment the scene stops being visible, and the lines stay crisp
 * at any resolution.
 *
 * The fade runs along the *path*, not along a straight axis. The earlier
 * version stroked the whole tail once with a gradient from the oldest point to
 * the newest, which is correct only while the trail is monotonic in x. It is
 * not: orbit plus drift makes a helix, and where the curve doubles back a
 * segment sits at the same horizontal position as a much older one and is given
 * its opacity — which reads as the trail snapping rather than curling round.
 *
 * Stroking in a fixed number of overlapping chunks instead makes opacity a
 * function of age, which is what it always meant. Fourteen chunks is smooth
 * enough to look continuous and still an order of magnitude cheaper than a
 * segment per sample.
 */
export function drawTrail(
  context: CanvasRenderingContext2D,
  points: readonly ScenePoint[],
  color: Rgb,
  width: number,
): void {
  if (points.length < 3) {
    return;
  }

  context.save();
  // Butt caps, deliberately. A round cap at every chunk boundary left a bead of
  // colour at each joint, which read as a string of dots rather than a trail.
  // The chunks overlap by a point, so they still meet cleanly without them.
  context.lineCap = 'butt';
  context.lineJoin = 'round';

  const perChunk = Math.max(1, Math.ceil((points.length - 1) / TRAIL_SEGMENTS));

  for (let start = 0; start < points.length - 1; start += perChunk) {
    // One point of overlap, so consecutive chunks meet instead of leaving gaps.
    const end = Math.min(start + perChunk, points.length - 1);
    const age = (start + perChunk / 2) / points.length;
    // Gentler than a square, which dimmed everything but the last third and
    // left the tail looking clipped rather than faded.
    const strength = age ** 1.5;

    context.beginPath();
    const first = points[start];

    if (!first) {
      continue;
    }

    context.moveTo(first.x, first.y);

    for (let index = start + 1; index <= end; index += 1) {
      const point = points[index];

      if (point) {
        context.lineTo(point.x, point.y);
      }
    }

    // A wide faint pass for the glow, then a narrow bright one for the core.
    context.strokeStyle = rgba(color, strength * 0.16);
    context.lineWidth = width * 2.6;
    context.stroke();

    context.strokeStyle = rgba(color, strength * 0.72);
    context.lineWidth = width;
    context.stroke();
  }

  context.restore();
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
