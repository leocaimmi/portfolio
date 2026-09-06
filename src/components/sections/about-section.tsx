import type { Messages } from 'next-intl';
import { useLocale, useTranslations } from 'next-intl';

import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { education, profile } from '@/content';
import { formatPeriod } from '@/lib/format-period';

/**
 * The `focus` entries are a structured list rather than a flat string, so they
 * are read with `t.raw`. The type comes from the registered message shape,
 * which keeps this cast honest: editing the JSON updates the type.
 */
type FocusItem = Messages['about']['focus'][number];

/**
 * Narrative section: the biography, three working principles, and the formal
 * education record.
 *
 * Kept deliberately quiet. This is the part a reader skims on the way to the
 * work, so it uses hairlines and plain text rather than the glass panels the
 * projects and skills sections rely on — the heavier surfaces are reserved for
 * the sections that actually carry evidence.
 */
export function AboutSection() {
  const t = useTranslations('about');
  const common = useTranslations('common');
  const locale = useLocale();

  const focus = t.raw('focus') as FocusItem[];

  return (
    <Section id="about" label={t('label')} title={t('title')}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-14">
        <Reveal className="space-y-4">
          {profile.biography.map((paragraph) => (
            <p key={paragraph.en} className="text-sm leading-relaxed text-pretty text-moondust">
              {paragraph[locale]}
            </p>
          ))}
        </Reveal>

        <Reveal delay={90}>
          <h3 className="telemetry">{t('educationTitle')}</h3>

          <dl className="mt-4 space-y-4">
            {education.map((entry) => (
              <div key={entry.id}>
                <dt className="text-sm text-starlight">{entry.title[locale]}</dt>
                <dd className="mt-0.5 font-mono text-[0.6875rem] tracking-wide text-dust">
                  {entry.institution}
                  {entry.period
                    ? ` · ${formatPeriod(entry.period, locale, common('present'))}`
                    : null}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <Reveal delay={150} className="mt-12">
        <h3 className="telemetry">{t('focusTitle')}</h3>

        <ul className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {focus.map((item) => (
            <li key={item.title} className="border-t border-horizon/50 pt-4">
              <h4 className="font-display text-sm font-medium text-starlight">{item.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-moondust">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
