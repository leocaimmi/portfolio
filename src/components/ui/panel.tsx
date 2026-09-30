import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type PanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** Brightens the surface on hover and focus. Interactive panels only. */
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

/**
 * How far behind its siblings a card's rim meteor starts, spread evenly across
 * the animation's fifteen seconds.
 *
 * Written out rather than computed because Tailwind emits the classes it can
 * see in the source and nothing else, so a template string would compile to
 * nothing. A caller sets one on the card or on anything above it: the value is
 * a custom property, and custom properties reach the pseudo-element that reads
 * it.
 */
export const COMET_DELAYS = [
  '[--comet-delay:0s]',
  '[--comet-delay:-5.3s]',
  '[--comet-delay:-10.6s]',
] as const;

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
        'glass comet-rim rounded-panel',
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
