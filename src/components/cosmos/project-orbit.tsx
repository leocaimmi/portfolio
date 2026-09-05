import type { Project } from '@/content';

/** Distance of the innermost orbit, in viewBox units. */
const ORBIT_BASE = 96;
const ORBIT_STEP = 46;
const CENTER = 320;

/**
 * The golden angle. Spacing successive planets by 137.5° is what keeps them
 * from lining up into spokes, the same reason it shows up in seed heads.
 */
const GOLDEN_ANGLE = 137.5;

const PLANET_COLORS = [
  'var(--color-star)',
  'var(--color-solar)',
  'var(--color-nebula-glow)',
  'var(--color-comet)',
] as const;

interface ProjectOrbitProps {
  projects: readonly Project[];
  label: string;
  hint: string;
}

/**
 * Visual index of the projects, drawn as a solar system.
 *
 * Each planet is a plain anchor pointing at the matching card further down the
 * page, so navigation works with no JavaScript, is reachable by keyboard, and
 * is announced from the SVG `<title>`. The diagram is an entry point to the
 * content, never the only copy of it: every project is also rendered in full
 * below.
 */
export function ProjectOrbit({ projects, label, hint }: ProjectOrbitProps) {
  const planets = projects.map((project, index) => {
    const radius = ORBIT_BASE + index * ORBIT_STEP;
    const angle = ((index * GOLDEN_ANGLE - 90) * Math.PI) / 180;

    return {
      project,
      radius,
      x: CENTER + radius * Math.cos(angle),
      y: CENTER + radius * Math.sin(angle),
      size: project.featured ? 13 : 9,
      color: PLANET_COLORS[index % PLANET_COLORS.length] ?? PLANET_COLORS[0],
    };
  });

  return (
    <svg
      viewBox="0 0 640 660"
      role="group"
      aria-label={label}
      className="mx-auto w-full max-w-lg overflow-visible"
    >
      <defs>
        <radialGradient id="orbit-core">
          <stop offset="0%" stopColor="var(--color-starlight)" />
          <stop offset="45%" stopColor="var(--color-solar)" />
          <stop offset="100%" stopColor="var(--color-nebula)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {planets.map(({ project, radius }) => (
        <circle
          key={`orbit-${project.id}`}
          cx={CENTER}
          cy={CENTER}
          r={radius}
          fill="none"
          stroke="var(--color-horizon)"
          strokeWidth="1"
          strokeDasharray="2 7"
          opacity="0.6"
        />
      ))}

      <circle cx={CENTER} cy={CENTER} r="54" fill="url(#orbit-core)" opacity="0.85" />
      <circle cx={CENTER} cy={CENTER} r="9" fill="var(--color-starlight)" />

      {planets.map(({ project, x, y, size, color }) => (
        <a
          key={project.id}
          href={`#project-${project.id}`}
          className="group focus-visible:outline-none"
        >
          <title>{project.name}</title>

          {/* Generous invisible hit area: the painted planet is far too small to aim at. */}
          <circle cx={x} cy={y} r={size + 14} fill="transparent" />

          <circle
            cx={x}
            cy={y}
            r={size + 7}
            fill={color}
            opacity="0"
            className="transition-opacity duration-300 group-hover:opacity-25 group-focus-visible:opacity-40"
          />

          <circle
            cx={x}
            cy={y}
            r={size}
            fill={color}
            className="[transform-origin:center] transition-transform duration-300 ease-orbital [transform-box:fill-box] group-hover:scale-125 group-focus-visible:scale-125"
          />

          <text
            x={CENTER}
            y="628"
            textAnchor="middle"
            fill="var(--color-starlight)"
            className="pointer-events-none font-mono text-[15px] tracking-wide opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {project.name}
          </text>
        </a>
      ))}

      <text
        x={CENTER}
        y="656"
        textAnchor="middle"
        fill="var(--color-dust)"
        className="font-mono text-[12px] tracking-wide"
      >
        {hint}
      </text>
    </svg>
  );
}
