import type { Skill, SkillMagnitude } from '@/content';

const VIEWBOX_WIDTH = 300;
const VIEWBOX_HEIGHT = 110;
const PADDING_X = 22;

const STAR_RADIUS: Record<SkillMagnitude, number> = { 1: 3.4, 2: 2.4, 3: 1.6 };
const STAR_OPACITY: Record<SkillMagnitude, number> = { 1: 1, 2: 0.72, 3: 0.45 };

/**
 * Deterministic pseudo-random unit value.
 *
 * `Math.random` cannot be used here: the server and the client would scatter
 * the stars differently and React would report a hydration mismatch. Seeding
 * from a stable string keeps every render identical while still looking
 * irregular enough to read as a real star pattern.
 */
function seededUnit(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  const value = Math.sin(hash) * 10_000;

  return value - Math.floor(value);
}

interface ConstellationFigureProps {
  id: string;
  skills: readonly Skill[];
}

/**
 * Draws a group of skills as a connected star pattern.
 *
 * Purely decorative — brightness restates the magnitude that the list below
 * already spells out in words, so nothing is lost when the figure is not
 * perceived.
 */
export function ConstellationFigure({ id, skills }: ConstellationFigureProps) {
  const step = (VIEWBOX_WIDTH - PADDING_X * 2) / Math.max(skills.length - 1, 1);

  const stars = skills.map((skill, index) => ({
    key: skill.technology,
    x: PADDING_X + index * step + (seededUnit(`${id}-${skill.technology}-x`) - 0.5) * step * 0.5,
    y: 20 + seededUnit(`${id}-${skill.technology}-y`) * (VIEWBOX_HEIGHT - 40),
    radius: STAR_RADIUS[skill.magnitude],
    opacity: STAR_OPACITY[skill.magnitude],
  }));

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${String(VIEWBOX_WIDTH)} ${String(VIEWBOX_HEIGHT)}`}
      className="w-full"
    >
      <polyline
        points={stars.map((star) => `${String(star.x)},${String(star.y)}`).join(' ')}
        fill="none"
        stroke="var(--color-star)"
        strokeWidth="0.75"
        opacity="0.3"
      />

      {stars.map((star) => (
        <circle
          key={star.key}
          cx={star.x}
          cy={star.y}
          r={star.radius}
          fill="var(--color-starlight)"
          opacity={star.opacity}
        />
      ))}
    </svg>
  );
}
