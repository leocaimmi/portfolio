'use client';

import { useEffect, useRef } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';

/**
 * Parallax star field rendered on a canvas.
 *
 * Three depth layers drift at different rates against the scroll position,
 * which is what sells the sense of distance. The field is purely decorative:
 * it is hidden from assistive technology and carries no information that is
 * not also in the document.
 *
 * Cost is bounded on purpose. Star count scales with viewport area up to a
 * ceiling, the device pixel ratio is clamped, stars are blitted from a single
 * pre-rendered sprite instead of being painted arc by arc, and the loop stops
 * entirely when the tab is hidden or the visitor asked for reduced motion.
 */

const STAR_AREA_PER_STAR = 9_000;
const MAX_STARS = 420;
const MAX_PIXEL_RATIO = 2;
const PARALLAX_STRENGTH = 0.12;

/** Star tints, weighted towards white so the field reads as a sky, not confetti. */
const STAR_COLORS = [
  '233, 237, 255',
  '233, 237, 255',
  '233, 237, 255',
  '167, 177, 212',
  '34, 211, 238',
  '251, 191, 36',
] as const;

const METEOR_MIN_DELAY_MS = 7_000;
const METEOR_MAX_DELAY_MS = 18_000;

/**
 * How often the field is actually repainted, at rest and while the page moves.
 *
 * It does not need a frame of its own sixty times a second. A twinkle takes
 * seconds to cross its cycle, and this canvas sits behind every pane of glass
 * on the site — each of which has to blur its backdrop again whenever the
 * canvas repaints. At sixty frames a second an idle star field was the most
 * expensive thing on a page that was only being read.
 *
 * A meteor is the exception: it crosses in about a second and stutters at
 * anything less than the full rate, so it gets it, for the second it lasts.
 */
const IDLE_FRAME_MS = 66;
const MOVING_FRAME_MS = 32;

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  /** 0 is the most distant layer, 1 the nearest; drives parallax and size. */
  depth: number;
}

interface Meteor {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  length: number;
  progress: number;
  duration: number;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(values: readonly T[], fallback: T): T {
  return values[Math.floor(Math.random() * values.length)] ?? fallback;
}

const SPRITE_SIZE = 32;

/** Pre-renders one soft radial dot per tint. */
function createStarSprite(rgb: string): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;

  const context = sprite.getContext('2d');

  if (context) {
    const center = SPRITE_SIZE / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, `rgba(${rgb}, 1)`);
    gradient.addColorStop(0.4, `rgba(${rgb}, 0.5)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);

    context.fillStyle = gradient;
    context.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  }

  return sprite;
}

/**
 * Builds the sprite atlas once per mount, so a frame only ever blits an image
 * instead of rebuilding a gradient for every star.
 */
function createStarSprites(): Map<string, HTMLCanvasElement> {
  return new Map(new Set(STAR_COLORS).values().map((rgb) => [rgb, createStarSprite(rgb)]));
}

function createStars(width: number, height: number): Star[] {
  const count = Math.min(Math.round((width * height) / STAR_AREA_PER_STAR), MAX_STARS);

  return Array.from({ length: count }, () => {
    const depth = Math.random();

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: randomBetween(1, 2.6) * (0.6 + depth * 0.8),
      color: pick(STAR_COLORS, STAR_COLORS[0]),
      baseAlpha: randomBetween(0.25, 0.9) * (0.5 + depth * 0.5),
      twinkleSpeed: randomBetween(0.0004, 0.0016),
      twinklePhase: Math.random() * Math.PI * 2,
      depth,
    };
  });
}

function createMeteor(width: number, height: number): Meteor {
  const angle = randomBetween(Math.PI * 0.14, Math.PI * 0.28);
  const speed = randomBetween(0.55, 0.95);

  return {
    x: randomBetween(width * 0.25, width * 1.05),
    y: randomBetween(-height * 0.1, height * 0.35),
    velocityX: -Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    length: randomBetween(90, 190),
    progress: 0,
    duration: randomBetween(900, 1500),
  };
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    const sprites = createStarSprites();
    const fallbackSprite = createStarSprite(STAR_COLORS[0]);

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let meteor: Meteor | undefined;
    let nextMeteorAt = performance.now() + randomBetween(METEOR_MIN_DELAY_MS, METEOR_MAX_DELAY_MS);
    let scrollY = window.scrollY;
    let frameId = 0;
    let lastTime = performance.now();
    let hasMoved = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${String(width)}px`;
      canvas.style.height = `${String(height)}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = createStars(width, height);
    };

    const drawStars = (time: number) => {
      for (const star of stars) {
        const twinkle = prefersReducedMotion
          ? 1
          : 0.65 + 0.35 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);

        const offset = scrollY * star.depth * PARALLAX_STRENGTH;
        // Wrap vertically so the field never runs out as the page scrolls.
        const y = (((star.y - offset) % height) + height) % height;
        const diameter = star.size * 4;
        const sprite = sprites.get(star.color) ?? fallbackSprite;

        context.globalAlpha = star.baseAlpha * twinkle;
        context.drawImage(sprite, star.x - diameter / 2, y - diameter / 2, diameter, diameter);
      }

      context.globalAlpha = 1;
    };

    const drawMeteor = (delta: number) => {
      if (!meteor) {
        return;
      }

      meteor.progress += delta;

      const life = meteor.progress / meteor.duration;

      if (life >= 1) {
        meteor = undefined;
        nextMeteorAt = performance.now() + randomBetween(METEOR_MIN_DELAY_MS, METEOR_MAX_DELAY_MS);
        return;
      }

      const headX = meteor.x + meteor.velocityX * meteor.progress;
      const headY = meteor.y + meteor.velocityY * meteor.progress;
      const tailX = headX - meteor.velocityX * meteor.length;
      const tailY = headY - meteor.velocityY * meteor.length;

      // Fade in over the first fifth of the life, then out across the rest.
      const alpha = life < 0.2 ? life / 0.2 : 1 - (life - 0.2) / 0.8;

      const trail = context.createLinearGradient(tailX, tailY, headX, headY);
      trail.addColorStop(0, 'rgba(34, 211, 238, 0)');
      trail.addColorStop(1, `rgba(233, 237, 255, ${String(alpha.toFixed(3))})`);

      context.strokeStyle = trail;
      context.lineWidth = 1.4;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(headX, headY);
      context.stroke();
    };

    const render = (time: number) => {
      frameId = window.requestAnimationFrame(render);

      const interval = meteor ? 0 : hasMoved ? MOVING_FRAME_MS : IDLE_FRAME_MS;
      const delta = time - lastTime;

      if (delta < interval) {
        return;
      }

      lastTime = time;
      hasMoved = false;

      context.clearRect(0, 0, width, height);
      drawStars(time);

      if (!prefersReducedMotion) {
        if (!meteor && time >= nextMeteorAt) {
          meteor = createMeteor(width, height);
        }

        drawMeteor(delta);
      }
    };

    const start = () => {
      if (frameId !== 0) {
        return;
      }

      lastTime = performance.now();
      frameId = window.requestAnimationFrame(render);
    };

    const stop = () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      hasMoved = true;

      // With motion disabled there is no loop running, so repaint on demand.
      if (prefersReducedMotion) {
        context.clearRect(0, 0, width, height);
        drawStars(performance.now());
      }
    };

    /** A hidden tab must not burn battery on decoration. */
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else if (!prefersReducedMotion) {
        start();
      }
    };

    resize();

    if (prefersReducedMotion) {
      // A single static frame: the sky is still there, it just holds still.
      drawStars(performance.now());
    } else {
      start();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-dvh w-full"
    />
  );
}
