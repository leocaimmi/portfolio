'use client';

import type { CSSProperties, ReactNode } from 'react';

interface TopLinkProps {
  className?: string;
  style?: CSSProperties;
  /** Hidden from the keyboard while the thing carrying it is out of the way. */
  inert?: boolean;
  children: ReactNode;
}

/**
 * A link to the top of the page that leaves nothing behind in the address bar.
 *
 * `#top` is a real anchor on the hero, so this works with no JavaScript and is
 * announced as a link to somewhere. What that anchor is not is a place worth
 * naming: the top of a landing page is the page, and `/#top` — bookmarked,
 * shared, pasted into a message — says otherwise. So the click is handled here
 * instead, and a section hash left over from earlier is dropped with it.
 *
 * The scroll asks for no behaviour of its own. The stylesheet decides whether
 * the page glides or jumps, and it already answers the motion preference.
 *
 * A modified click means "open this somewhere else"; the anchor is left to do
 * exactly that.
 */
export function TopLink({ className, style, inert, children }: TopLinkProps) {
  return (
    <a
      href="#top"
      inert={inert}
      className={className}
      style={style}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        event.preventDefault();
        window.scrollTo({ top: 0 });
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }}
    >
      {children}
    </a>
  );
}
