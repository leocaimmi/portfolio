import { useLocale, useTranslations } from 'next-intl';

import { Panel } from '@/components/ui/panel';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { TechTagList } from '@/components/ui/tech-tag';
import { experience } from '@/content';
import { formatPeriod } from '@/lib/format-period';

/**
 * One tone per kind of role, used for the marker and everything drawn around
 * it. The kind is no longer written out — "employment" is not information a
 * reader needs from a timeline — so the colour is all that carries it, which is
 * why it is never the only thing distinguishing two entries.
 */
const KIND_TONE = {
  employment: 'var(--color-star)',
  teaching: 'var(--color-solar)',
  freelance: 'var(--color-comet)',
} as const;

/**
 * Career timeline drawn as a trajectory: one line, one station per role.
 *
 * The rail fades out at both ends rather than stopping flat, because a career
 * does not start at the top of a section and end at the bottom of it. Each
 * station is a lit body with a halo and a hairline out to the log entry it
 * marks — the same vocabulary as the chart in the corner and the system in the
 * hero, so the page reads as one instrument rather than three.
 *
 * Marked up as an ordered list because the sequence carries meaning, and each
 * period is a `<time>` element so the dates stay machine-readable.
 */
export function TrajectorySection() {
  const t = useTranslations('trajectory');
  const common = useTranslations('common');
  const locale = useLocale();

  return (
    <Section id="trajectory" label={t('label')} title={t('title')} description={t('description')}>
      <ol className="relative space-y-6 pl-8 sm:pl-10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-px"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent, var(--color-horizon) 8%, var(--color-horizon) 88%, transparent)',
          }}
        />

        {experience.map((entry, index) => (
          <li key={entry.id} className="relative">
            <span
              aria-hidden="true"
              className="absolute top-7 -left-[2.3rem] block size-2.5 sm:-left-[2.8rem]"
              style={{ color: KIND_TONE[entry.kind] }}
            >
              <span className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-current opacity-25" />

              <span className="absolute top-1/2 left-full ml-2 h-px w-4 -translate-y-1/2 bg-current opacity-25 sm:w-6" />

              <span
                className="block size-full rounded-full bg-current ring-4 ring-void"
                style={{ boxShadow: '0 0 0.75rem 0 currentColor' }}
              />
            </span>

            <Reveal delay={index * 80}>
              <Panel className="p-6 sm:p-7">
                {/* Numbered from the first entry, the way a log is kept. */}
                <p className="font-mono text-[0.625rem] tracking-[0.22em] text-dust uppercase">
                  {`LOG ${String(experience.length - index).padStart(2, '0')}`}
                </p>

                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-starlight">
                      {entry.role[locale]}
                    </h3>
                    <p className="mt-1 text-sm text-nebula-glow">{entry.organization}</p>
                  </div>

                  <p className="font-mono text-[0.6875rem] tracking-wide text-dust">
                    <time dateTime={entry.period.start}>
                      {formatPeriod(entry.period, locale, common('present'))}
                    </time>
                  </p>
                </div>

                <p className="mt-2 font-mono text-[0.6875rem] tracking-wide text-dust uppercase">
                  {entry.location[locale]}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-pretty text-moondust">
                  {entry.summary[locale]}
                </p>

                <ul className="mt-5 space-y-2">
                  {entry.achievements.map((achievement) => (
                    <li
                      key={achievement.en}
                      className="flex gap-3 text-sm leading-relaxed text-pretty text-moondust"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1 shrink-0 rounded-full"
                        style={{ backgroundColor: KIND_TONE[entry.kind] }}
                      />
                      {achievement[locale]}
                    </li>
                  ))}
                </ul>

                <TechTagList items={entry.stack} className="mt-6" />
              </Panel>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
