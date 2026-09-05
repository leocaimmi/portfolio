import type { TechnologyId } from '@/content/technologies';
import { technologyName } from '@/content/technologies';
import { cn } from '@/lib/cn';

import { TechnologyIcon } from './brand-icon';

interface TechTagListProps {
  items: readonly TechnologyId[];
  className?: string;
}

/**
 * Renders a stack as a list of technology chips.
 *
 * Marked up as a real list so assistive technology announces how many
 * technologies a project uses instead of reading a run of loose text. Names
 * come from the registry, so a chip's label can never drift from its id, and
 * each mark sits beside its own name rather than standing in for it — a wall
 * of logos is a quiz, not a stack.
 */
export function TechTagList({ items, className }: TechTagListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {items.map((id) => (
        <li
          key={id}
          className="flex items-center gap-1.5 rounded-full border border-horizon/70 bg-deep/50 px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide text-moondust"
        >
          <TechnologyIcon id={id} />
          {technologyName(id)}
        </li>
      ))}
    </ul>
  );
}
