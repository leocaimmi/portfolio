import { useLocale, useTranslations } from 'next-intl';

import { ConstellationFigure } from '@/components/cosmos/constellation-figure';
import { Panel } from '@/components/ui/panel';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import type { SkillMagnitude } from '@/content';
import { constellations, technologyName } from '@/content';

const MAGNITUDES: readonly SkillMagnitude[] = [1, 2, 3];

const MAGNITUDE_DOT: Record<SkillMagnitude, string> = {
  1: 'size-2 bg-starlight',
  2: 'size-1.5 bg-moondust',
  3: 'size-1 bg-dust',
};

/**
 * Technical stack, grouped into constellations.
 *
 * Each group pairs a decorative star pattern with the same information in
 * plain text. Magnitude is never conveyed by size alone: every entry carries
 * its meaning as a `title`, and the legend states the scale outright.
 */
export function ConstellationsSection() {
  const t = useTranslations('constellations');
  const locale = useLocale();

  return (
    <Section
      id="constellations"
      label={t('label')}
      title={t('title')}
      description={t('description')}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {constellations.map((constellation, index) => (
          <Reveal key={constellation.id} delay={index * 80}>
            <Panel className="flex h-full flex-col p-6">
              <h3 className="font-display text-lg font-semibold text-starlight">
                {constellation.name[locale]}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-moondust">
                {constellation.description[locale]}
              </p>

              <div className="my-5">
                <ConstellationFigure id={constellation.id} skills={constellation.skills} />
              </div>

              <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-2">
                {constellation.skills.map((skill) => (
                  <li
                    key={skill.technology}
                    title={t(`magnitude.${skill.magnitude}`)}
                    className="flex items-center gap-2 text-sm text-moondust"
                  >
                    <span
                      aria-hidden="true"
                      className={`shrink-0 rounded-full ${MAGNITUDE_DOT[skill.magnitude]}`}
                    />
                    {technologyName(skill.technology)}
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          <h3 className="telemetry">{t('legendTitle')}</h3>

          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {MAGNITUDES.map((magnitude) => (
              <li
                key={magnitude}
                className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-wide text-dust"
              >
                <span
                  aria-hidden="true"
                  className={`shrink-0 rounded-full ${MAGNITUDE_DOT[magnitude]}`}
                />
                {t(`magnitude.${magnitude}`)}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
