import { useLocale, useTranslations } from 'next-intl';

import { Panel } from '@/components/ui/panel';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { TechTagList } from '@/components/ui/tech-tag';
import { experience } from '@/content';
import { formatPeriod } from '@/lib/format-period';

const KIND_ACCENT = {
  employment: 'bg-star',
  teaching: 'bg-solar',
  freelance: 'bg-comet',
} as const;

/**
 * Career timeline drawn as a trajectory: one line, one node per role.
 *
 * Marked up as an ordered list because the sequence carries meaning, and each
 * period is a `<time>` element so the dates remain machine-readable.
 */
export function TrajectorySection() {
  const t = useTranslations('trajectory');
  const common = useTranslations('common');
  const locale = useLocale();

  return (
    <Section id="trajectory" label={t('label')} title={t('title')} description={t('description')}>
      <ol className="relative space-y-6 border-l border-horizon/60 pl-8 sm:pl-10">
        {experience.map((entry, index) => (
          <li key={entry.id} className="relative">
            <span
              aria-hidden="true"
              className={`absolute top-7 -left-[2.3rem] size-3 rounded-full ring-4 ring-void sm:-left-[2.8rem] ${KIND_ACCENT[entry.kind]}`}
            />

            <Reveal delay={index * 80}>
              <Panel className="p-6 sm:p-7">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
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
                  {t(`kind.${entry.kind}`)} · {entry.location[locale]}
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
                        className="mt-2 size-1 shrink-0 rounded-full bg-star"
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
