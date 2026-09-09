'use client';

import type { ReactNode } from 'react';

import { useRevealPhase } from '@/hooks/use-reveal-phase';
import { cn } from '@/lib/cn';

interface RevealProps {
  children: ReactNode;
  /** Milliseconds to stagger this item behind its siblings. */
  delay?: number;
  className?: string;
}

/**
 * Replays an entrance animation when its content scrolls into view.
 *
 * The wrapper only ever touches an element it knows the reader cannot see. An
 * element measured below the fold is hidden — invisibly, since it is below the
 * fold — and animated as it comes up. One that was on screen before anything
 * was measured is left exactly as the server painted it.
 *
 * Hiding everything up front would break the promise below. Hiding it on
 * arrival — as this did — painted the element at the edge of the screen, then
 * blanked it on the animation's first frame, then faded it back: a blink, and a
 * long one wherever the animation was delayed to stagger a row of cards.
 *
 * Content is never hidden behind JavaScript. With scripting disabled, an
 * unsupported browser, or a failed hydration, nothing is measured, the phase
 * stays unobserved and the page reads exactly the same without the motion.
 * Reduced motion is handled globally in the stylesheet.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, phase } = useRevealPhase<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        phase === 'hidden' && 'opacity-0',
        phase === 'arriving' && 'animate-reveal',
        className,
      )}
      style={delay > 0 ? { animationDelay: `${String(delay)}ms` } : undefined}
    >
      {children}
    </div>
  );
}
