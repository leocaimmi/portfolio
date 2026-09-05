import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type PanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** Adds a glow and a lifted border on hover. Use for interactive panels only. */
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

/**
 * The instrument-panel surface: a translucent card lit from behind by the sky.
 *
 * Elevation is expressed with light rather than shadow, which is the only thing
 * that reads correctly against a near-black background. Polymorphic through
 * `as` so a panel can be an article, a list item or a link without inheriting
 * a wrapper element it does not need.
 */
export function Panel<T extends ElementType = 'div'>({
  as,
  children,
  interactive = false,
  className,
  ...props
}: PanelProps<T>) {
  const Component = as ?? 'div';

  return (
    <Component
      className={cn(
        'rounded-panel border border-horizon/60 bg-orbit/35 shadow-panel backdrop-blur-sm',
        interactive &&
          'transition-colors duration-300 ease-orbital hover:border-star/45 hover:bg-orbit/55',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
