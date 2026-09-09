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
 *
 * The chips carry less padding on a phone, which is not a cosmetic trim. A
 * stack of twelve wrapped two to a line there and left a third of every line
 * empty, because a chip is mostly chrome — mark, two gaps and two insets
 * around a word of eight letters. Six pixels off each one is the difference
 * between two per line and three, and a third off the height of a block that
 * repeats under every entry in the timeline.
 */
export function TechTagList({ items, className }: TechTagListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={cn('flex flex-wrap gap-1.5 sm:gap-2', className)}>
      {items.map((id) => (
        <li
          key={id}
          className="flex items-center gap-1 rounded-full border border-horizon/70 bg-deep/50 px-2 py-1 font-mono text-[0.6875rem] tracking-wide text-moondust sm:gap-1.5 sm:px-2.5"
        >
          <TechnologyIcon id={id} />
          {technologyName(id)}
        </li>
      ))}
    </ul>
  );
}
