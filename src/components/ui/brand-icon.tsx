import type { TechnologyId } from '@/content/technologies';
import { technologyName } from '@/content/technologies';
import { TECHNOLOGY_ICON_PATHS } from '@/content/technology-icons';
import { cn } from '@/lib/cn';

/**
 * Builds a short monogram for technologies with no brand mark.
 *
 * A name already short enough to fit is kept whole, so "SQL" stays SQL rather
 * than being clipped to SQ. Longer multi-word names give their initials, and
 * anything else gives its first two letters. The row then stays visually even
 * instead of showing holes where a logo was never available.
 */
function monogram(name: string): string {
  if (name.length <= 3) {
    return name.toUpperCase();
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
 */
export function TechnologyIcon({ id, className }: TechnologyIconProps) {
  const path = TECHNOLOGY_ICON_PATHS[id];
  const classes = cn('size-3.5 shrink-0', className);

  if (path === undefined) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          classes,
          'grid place-items-center rounded-[3px] border border-current/45 font-mono text-[0.5rem] leading-none',
        )}
      >
        {monogram(technologyName(id))}
      </span>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={classes}>
      <path d={path} />
    </svg>
  );
}
