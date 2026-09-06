import { useLocale, useTranslations } from 'next-intl';

import { TechnologyIcon } from '@/components/ui/brand-icon';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import type { Skill, SkillMagnitude } from '@/content';
import { constellations, technologyName } from '@/content';

/**
 * Level is stated in words on every card, so colour is reinforcement rather
 * than the only carrier of the meaning.
 */
const LEVEL_TONE: Record<SkillMagnitude, string> = {
  1: 'text-star',
  2: 'text-nebula-glow',
  3: 'text-dust',
};

/**
 * Technical stack, grouped by domain.
 *
 * A card per technology: its mark, its name and the level it is actually held
 * at. The previous arrangement gave each group a panel and a decorative star
 * figure, which took a screen and a half to convey a list of names — a lot of
 * room for what a reader is here to check quickly.
 *
 * The level is written out on every card rather than encoded in the size of a
 * dot with a legend somewhere else. A scale nobody has to look up is worth more
 * than a prettier one that they do.
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
      <div className="space-y-10">
        {constellations.map((constellation, index) => (
          <Reveal key={constellation.id} delay={index * 60}>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-horizon/50 pb-3">
                <h3 className="font-display text-lg font-semibold text-starlight">
                  {constellation.name[locale]}
                </h3>
                <p className="text-sm text-pretty text-moondust">
                  {constellation.description[locale]}
                </p>
              </div>

              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {constellation.skills.map((skill) => (
                  <SkillCard
                    key={skill.technology}
                    skill={skill}
                    level={t(`level.${skill.magnitude}`)}
                  />
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function SkillCard({ skill, level }: { skill: Skill; level: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-horizon/70 bg-deep/40 px-3.5 py-3 transition-colors duration-300 ease-orbital hover:border-star/40">
      <TechnologyIcon id={skill.technology} className="size-5 text-moondust" />

      <span className="min-w-0">
        <span className="block truncate text-sm text-starlight">
          {technologyName(skill.technology)}
        </span>
        <span
          className={`block font-mono text-[0.5625rem] tracking-[0.14em] uppercase ${LEVEL_TONE[skill.magnitude]}`}
        >
          {level}
        </span>
      </span>
    </li>
  );
}
