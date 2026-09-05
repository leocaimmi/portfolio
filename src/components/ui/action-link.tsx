import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ActionVariant = 'primary' | 'ghost';

interface ActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: ActionVariant;
  /** Opens in a new tab. Announce the fact with `newTabLabel`. */
  external?: boolean;
  /** Localised "(opens in a new tab)" text, appended for screen readers only. */
  newTabLabel?: string;
  className?: string;
}

const VARIANTS: Record<ActionVariant, string> = {
  primary: 'bg-starlight text-void hover:bg-white',
  ghost: 'border border-horizon text-starlight hover:border-star/60 hover:text-star',
};

/**
 * A call to action rendered as a link.
 *
 * External links get `rel="noopener noreferrer"`, which prevents the opened
 * page from reaching back through `window.opener`, and their new-tab behaviour
 * is announced to screen readers rather than left as a surprise.
 */
export function ActionLink({
  href,
  children,
  variant = 'ghost',
  external = false,
  newTabLabel,
  className,
}: ActionLinkProps) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5',
        'font-mono text-xs tracking-wide uppercase',
        'transition-colors duration-300 ease-orbital',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
      {external && newTabLabel ? <span className="sr-only">{newTabLabel}</span> : null}
    </a>
  );
}
