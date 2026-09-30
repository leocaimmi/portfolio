import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type PanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** Brightens the surface on hover and focus. Interactive panels only. */
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

/**
 * The clocks a row of cards runs its rim meteor on: when each one starts, and
 * how long it waits before going again.
 *
 * The periods are what matter. Fourteen, fifteen and seventeen seconds share no
 * common factor, so the combination of which cards are lit at any moment only
 * comes back around after fifty-nine minutes — long enough that nobody watching
 * will ever see it repeat. On one shared period the same cards would fire in
 * the same order forever, which is what makes a decoration read as a status
 * light. The offsets only keep them from all starting together on the first
 * paint.
 *
 * Written out rather than computed because Tailwind emits the classes it can
 * see in the source and nothing else, so a template string would compile to
 * nothing. A caller puts one on the card or on anything above it: these are
 * custom properties, and custom properties reach the pseudo-element that reads
 * them.
 */
export const COMET_RHYTHMS = [
  '[--comet-delay:0s] [--comet-duration:14s]',
  '[--comet-delay:-5s] [--comet-duration:15s]',
  '[--comet-delay:-9s] [--comet-duration:17s]',
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
