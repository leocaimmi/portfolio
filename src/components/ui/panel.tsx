import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type PanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** Brightens the surface on hover and focus. Interactive panels only. */
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

/**
 * The liquid-glass surface every card in the site is built from.
 *
 * Elevation is expressed through light — a blurred, saturated backdrop, a
 * specular rim and an inner top highlight — because a drop shadow is invisible
 * against a near-black sky. Polymorphic through `as` so a panel can be an
 * article, a list item or a link without inheriting a wrapper element it does
 * not need.
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
        'glass rounded-panel',
        interactive &&
          'transition-colors duration-300 ease-orbital focus-within:bg-orbit/55 hover:bg-orbit/55',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
