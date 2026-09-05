/**
 * The site's mark: a ringed planet beside the full name.
 *
 * Initials alone said nothing to a first-time visitor — a recruiter scanning a
 * tab needs the name, not a monogram to decode. The glyph is inline SVG, so it
 * costs no request, scales without artefacts and inherits the palette.
 */
export function Wordmark({ name }: { name: string }) {
  const [given, ...rest] = name.split(' ');

  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <svg aria-hidden="true" viewBox="0 0 28 28" className="size-6 shrink-0 overflow-visible">
        <defs>
          <radialGradient id="wordmark-core" cx="35%" cy="30%">
            <stop offset="0%" stopColor="var(--color-starlight)" />
            <stop offset="55%" stopColor="var(--color-solar)" />
            <stop offset="100%" stopColor="var(--color-nebula)" />
          </radialGradient>
        </defs>

        <ellipse
          cx="14"
          cy="14"
          rx="13"
          ry="4.6"
          fill="none"
          stroke="var(--color-star)"
          strokeWidth="1.3"
          opacity="0.75"
          transform="rotate(-24 14 14)"
          className="transition-opacity duration-500 group-hover:opacity-100"
        />
        <circle cx="14" cy="14" r="5.4" fill="url(#wordmark-core)" />
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
