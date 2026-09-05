import type { TechnologyId } from '@/content/technologies';
import { technologyName } from '@/content/technologies';
import { cn } from '@/lib/cn';

interface TechTagListProps {
  items: readonly TechnologyId[];
  className?: string;
}

/**
 * Renders a stack as a list of technology chips.
 *
 * Marked up as a real list so assistive technology announces how many
 * technologies a project uses instead of reading a run of loose text. Names are
 * resolved from the registry, so a stack entry can never drift from its label.
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
          className="rounded-full border border-horizon/70 bg-deep/60 px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide text-moondust"
        >
          {technologyName(id)}
        </li>
      ))}
    </ul>
  );
}
