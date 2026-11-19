import { useLocale, useTranslations } from 'next-intl';

import { TechnologyIcon } from '@/components/ui/brand-icon';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import type { TechnologyId } from '@/content';
import { constellations, technologyName } from '@/content';
import { cn } from '@/lib/cn';

import type { StackSector } from './stack-grid';
import { StackGrid } from './stack-grid';

/**
 * The group with far more entries than the rest, which is given the room for
 * them rather than being allowed to set the height of every other column.
 */
const WIDE_SECTOR = 'tools';

/**
 * Technical stack, grouped by domain.
 *
 * The heading and every card are server rendered; the grid that lays them out
 * is a client island, because the sectors can be switched off and back on and
 * that is state. What crosses over to it is the sectors in the reader's
 * language and their cards as finished markup, never the content layer itself.
 */
export function ConstellationsSection() {
  const t = useTranslations('constellations');
  const locale = useLocale();

  const sectors: StackSector[] = constellations.map((sector) => {
    const isWide = sector.id === WIDE_SECTOR;

    return {
      id: sector.id,
      name: sector.name[locale],
      description: sector.description[locale],
      isWide,
      skills: <SkillList ids={sector.skills} isWide={isWide} />,
    };
  });

  return (
    <Section
      id="constellations"
      label={t('label')}
      title={t('title')}
      description={t('description')}
    >
      <Reveal>
        <StackGrid sectors={sectors} />
      </Reveal>
    </Section>
  );
}

/**
 * Two columns where a sector has the whole width to itself, one where the
 * sectors are already columns side by side. A phone gave each of forty cards a
 * line of its own and a third of that line to a name eleven characters long,
 * which is two and a half thousand pixels of scroll spent mostly on air.
 */
function SkillList({ ids, isWide }: { ids: readonly TechnologyId[]; isWide: boolean }) {
  return (
    <ul
      className={cn(
        'mt-4 grid grid-cols-2 gap-2 sm:grid-cols-1',
        isWide && 'xl:grid-cols-2 xl:gap-x-3',
      )}
    >
      {ids.map((id) => (
        <SkillCard key={id} id={id} />
      ))}
    </ul>
  );
}

/**
 * One line per technology: the mark and the name.
 *
 * The name is clipped rather than wrapped wherever a card shares its row with
 * another sector's cards, so a long one cannot set the height of a whole row of
 * short ones. In the two-column layout a phone gets there is no such row to
 * protect - the cards beside it belong to the same list - and half of 343
 * pixels is not enough for "Row Level Security", so there it wraps. A clipped
 * skill is a worse answer than a tall one.
 */
function SkillCard({ id }: { id: TechnologyId }) {
  return (
    <li className="flex items-center gap-2.5 rounded-xl border border-horizon/70 bg-deep/40 px-3 py-2 transition-colors duration-300 ease-orbital hover:border-star/40">
      <TechnologyIcon id={id} className="size-5 text-moondust" />

      <span className="min-w-0 flex-1 text-sm text-starlight sm:truncate">
        {technologyName(id)}
      </span>
    </li>
  );
}
