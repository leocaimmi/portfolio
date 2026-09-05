'use client';

import type { ReactNode } from 'react';

import { useInView } from '@/hooks/use-in-view';
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
 * The wrapper renders in the final visible state and only adds an animation
 * once the element enters the viewport. Content is therefore never hidden
 * behind JavaScript: with scripting disabled, an unsupported browser, or a
 * failed hydration, the page reads exactly the same — it simply does not
 * animate. Reduced motion is handled globally in the stylesheet.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(inView && 'animate-reveal', className)}
      style={delay > 0 ? { animationDelay: `${String(delay)}ms` } : undefined}
    >
      {children}
    </div>
  );
}
