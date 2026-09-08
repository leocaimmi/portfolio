/**
 * The site's mark: Saturn beside the full name.
 *
 * Initials alone said nothing to a first-time visitor — a recruiter scanning a
 * tab needs the name, not a monogram to decode. The glyph is inline SVG, so it
 * costs no request, scales without artefacts and inherits the palette.
 *
 * What makes it Saturn rather than a generic ringed planet is the occlusion:
 * the far side of the rings passes behind the globe and the near side crosses
 * in front of it. A single ellipse drawn over the whole disc reads as a hoop
 * threaded onto a ball, which is what this was. So the ring is painted twice —
 * once behind the globe, then the near half again on top of it, clipped to the
 * lower half of its own tilted frame.
 *
 * The second cue is that the rings are a system and not a line: two bands with
 * a gap between them, which is the only part of the Cassini division that
 * survives at the size this is actually drawn.
 */
export function Wordmark({ name }: { name: string }) {
  const [given, ...rest] = name.split(' ');

  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <svg aria-hidden="true" viewBox="0 0 28 28" className="size-6 shrink-0 overflow-visible">
        <defs>
          <radialGradient id="wordmark-globe" cx="34%" cy="28%">
            <stop offset="0%" stopColor="var(--color-starlight)" />
            <stop offset="38%" stopColor="var(--color-solar)" />
            {/* The limb, turning away from the light rather than turning pink. */}
            <stop
              offset="100%"
              stopColor="color-mix(in oklab, var(--color-solar) 45%, var(--color-void))"
            />
          </radialGradient>

          {/*
            The near half of the rings, in the frame they are tilted in: from
            the globe's own centre line downwards.
          */}
          <clipPath id="wordmark-near" clipPathUnits="userSpaceOnUse">
            <rect x="-6" y="14" width="40" height="20" />
          </clipPath>
        </defs>

        <g transform="rotate(-17 14 14)">
          <g
            fill="none"
            stroke="var(--color-starlight)"
            className="opacity-80 transition-opacity duration-500 group-hover:opacity-100"
          >
            {/* Behind the globe. */}
            <ellipse cx="14" cy="14" rx="12.6" ry="4.4" strokeWidth="1.7" />
            <ellipse cx="14" cy="14" rx="9.1" ry="3.1" strokeWidth="1" opacity="0.6" />
          </g>

          <circle cx="14" cy="14" r="5.5" fill="url(#wordmark-globe)" />

          {/* And the same rings again, where they cross in front of it. */}
          <g
            fill="none"
            stroke="var(--color-starlight)"
            clipPath="url(#wordmark-near)"
            className="opacity-80 transition-opacity duration-500 group-hover:opacity-100"
          >
            <ellipse cx="14" cy="14" rx="12.6" ry="4.4" strokeWidth="1.7" />
            <ellipse cx="14" cy="14" rx="9.1" ry="3.1" strokeWidth="1" opacity="0.6" />
          </g>
        </g>
      </svg>

      <span className="font-display text-sm font-semibold tracking-tight whitespace-nowrap">
        <span className="text-starlight">{given}</span>{' '}
        <span className="text-moondust transition-colors duration-300 group-hover:text-starlight">
          {rest.join(' ')}
        </span>
      </span>
    </a>
  );
}
