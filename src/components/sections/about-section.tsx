import type { Messages } from 'next-intl';
import { useLocale, useTranslations } from 'next-intl';

import { Panel } from '@/components/ui/panel';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { education, profile } from '@/content';
import { formatPeriod } from '@/lib/format-period';

/**
 * The `focus` entries are a structured list rather than a flat string, so they
 * are read with `t.raw`. The type is pulled from the registered message shape,
 * which keeps this cast honest: editing the JSON updates the type.
 */
type FocusItem = Messages['about']['focus'][number];

/**
 * Narrative section: the biography, the three principles behind the work, and
 * the formal education record.
 *
 * Education is a description list, which is what it actually is: a set of
 * institutions paired with what was studied there.
 */
export function AboutSection() {
  const t = useTranslations('about');
  const common = useTranslations('common');
  const locale = useLocale();

  const focus = t.raw('focus') as FocusItem[];

  return (
    <Section id="about" label={t('label')} title={t('title')} description={t('description')}>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-12">
          <Reveal className="space-y-5">
            {profile.biography.map((paragraph) => (
              <p key={paragraph.en} className="text-base leading-relaxed text-pretty text-moondust">
                {paragraph[locale]}
              </p>
            ))}
          </Reveal>

          <div>
            <h3 className="telemetry">{t('focusTitle')}</h3>

            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {focus.map((item, index) => (
                <Reveal key={item.title} delay={index * 90}>
                  <Panel as="li" className="h-full list-none p-5">
                    <h4 className="font-display text-base font-semibold text-starlight">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-pretty text-moondust">
                      {item.body}
                    </p>
                  </Panel>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        <Reveal delay={120}>
          <Panel className="p-6">
            <h3 className="telemetry">{t('educationTitle')}</h3>

            <dl className="mt-5 space-y-5">
              {education.map((entry) => (
                <div key={entry.id} className="border-l border-horizon/70 pl-4">
                  <dt className="font-display text-sm font-medium text-starlight">
                    {entry.title[locale]}
                  </dt>
                  <dd className="mt-1 text-sm text-moondust">{entry.institution}</dd>
                  <dd className="mt-1 font-mono text-[0.6875rem] tracking-wide text-dust">
                    {formatPeriod(entry.period, locale, common('present'))}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}
