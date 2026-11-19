import type { TechnologyId } from '@/content/technologies';
import { technologyName } from '@/content/technologies';
import { TECHNOLOGY_ICONS } from '@/content/technology-icons';
import { cn } from '@/lib/cn';

/**
 * Builds a short monogram for technologies with no brand mark.
 *
 * A name already short enough to fit is kept whole, so "SQL" stays SQL rather
 * than being clipped to SQ. Longer multi-word names give their initials, and
 * anything else gives its first two letters. The row then stays visually even
 * instead of showing holes where a logo was never available.
 *
 * A parenthetical is a gloss on the name rather than part of it, so it is
 * dropped first: "ARCA (AFIP)" was giving its initials as A and an open
 * bracket.
 *
 * A name that leads with an acronym has already been abbreviated by the people
 * who named it, so the acronym is kept: "REST APIs" is REST, where its
 * initials gave RA, which names nothing.
 */
function monogram(fullName: string): string {
  const name = fullName.replace(/\([^)]*\)/g, ' ').trim();

  if (name.length <= 3) {
    return name.toUpperCase();
  }

  const acronym = /^[A-Z]{2,4}(?=\s)/.exec(name)?.[0];

  if (acronym) {
    return acronym;
  }

  const words = name.split(/[\s.]+/).filter(Boolean);

  if (words.length > 1) {
    return words
      .slice(0, 3)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

/**
 * The id a technology's mark is defined under in `TechnologyIconSprite`.
 *
 * One function for both ends of the reference, so the definition and every use
 * of it cannot drift apart.
 */
export function technologyIconId(id: TechnologyId): string {
  return `tech-icon-${id}`;
}

interface TechnologyIconProps {
  id: TechnologyId;
  className?: string;
}

/**
 * Renders a technology's brand mark, or a monogram when none exists.
 *
 * Always `aria-hidden`: every call site puts the technology's name in text
 * beside it, so announcing the mark as well would just repeat the label.
 * Painted in `currentColor` rather than the brand's own hue, which keeps a
 * row of thirty logos from turning into a colour chart.
 *
 * The mark itself is a reference to the page's sprite, not a copy of the path.
 * The same logos repeat under every entry in the timeline and every project,
 * and some of them run to five kilobytes of path data: inlined, they were a
 * third of the document, and each copy was paid for twice — once in the HTML
 * and again in the payload React hydrates from.
 */
export function TechnologyIcon({ id, className }: TechnologyIconProps) {
  const glyph = TECHNOLOGY_ICONS[id];
  const classes = cn('size-4 shrink-0', className);

  if (glyph === undefined) {
    const letters = monogram(technologyName(id));

    return (
      <span
        aria-hidden="true"
        className={cn(
          classes,
          'grid place-items-center rounded-[3px] border border-current/45 font-mono leading-none',
          // Three letters do not fit a square at the size two do, and the ones
          // that overflowed sat off their own badge. Four do not fit one at any
          // size still worth reading, so that badge grows sideways instead.
          letters.length > 3
            ? 'w-auto px-[3px] text-[0.4375rem] tracking-[-0.02em]'
            : letters.length > 2
              ? 'text-[0.4375rem] tracking-[-0.06em]'
              : 'text-[0.5rem]',
        )}
      >
        {letters}
      </span>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox={glyph.viewBox ?? '0 0 24 24'}
      fill="currentColor"
      className={classes}
    >
      <use href={`#${technologyIconId(id)}`} />
    </svg>
  );
}
