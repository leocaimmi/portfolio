import { useTranslations } from 'next-intl';

import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';

import { StackGrid } from './stack-grid';

/**
 * Technical stack, grouped by domain.
 *
 * The heading is server rendered; the grid below it is a client island, because
 * the sectors can be switched off and back on and that is state.
 */
export function ConstellationsSection() {
  const t = useTranslations('constellations');

  return (
    <Section
      id="constellations"
      label={t('label')}
      title={t('title')}
      description={t('description')}
    >
      <Reveal>
        <StackGrid />
      </Reveal>
    </Section>
  );
}
