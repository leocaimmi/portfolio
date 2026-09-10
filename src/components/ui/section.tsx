import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { Reveal } from './reveal';

interface SectionProps {
  /** Doubles as the anchor target and the base for the heading id. */
  id: string;
  /** Small monospaced eyebrow, in the manner of an instrument readout. */
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Shared frame for every top-level section: anchor, eyebrow, heading and body,
 * on one measure and one vertical rhythm.
 *
 * The section is labelled by its own heading, so a screen reader announces
 * "Trajectory, region" rather than an unnamed landmark, and the heading level
 * is fixed at `h2` to keep the document outline predictable.
 */
export function Section({ id, label, title, description, children, className }: SectionProps) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      // The negative scroll margin cancels this section's own top padding, so
      // an anchored jump lands on the heading rather than well above it.
      className={cn('-scroll-mt-16 py-20 sm:-scroll-mt-24 sm:py-28', className)}
    >
      {/*
        A 1rem gutter on a phone, matching the header, rather than the 1.5rem
        the wider sizes get. Three quarters of an inch of margin on a
        three-inch screen is a third of the measure spent on nothing, and what
        it costs is paid by the text inside the cards: a timeline entry with
        eight bullets in it runs for pages when each line holds six words.
      */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          <header className="max-w-2xl">
            <p className="telemetry">{label}</p>

            <h2
              id={headingId}
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance text-starlight sm:text-4xl"
            >
              {title}
            </h2>

            {description ? (
              <p className="mt-4 text-base leading-relaxed text-pretty text-moondust">
                {description}
              </p>
            ) : null}
          </header>
        </Reveal>

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
