'use client';

import { useLocale, useTranslations } from 'next-intl';

import { SolarSystem } from '@/components/cosmos/solar-system';
import { ActionLink } from '@/components/ui/action-link';
import { SECTION_IDS } from '@/config/navigation';
import { profile } from '@/content';
import { useActiveSection } from '@/hooks/use-active-section';

const AVAILABILITY_DOT: Record<typeof profile.availability, string> = {
  open: 'bg-star',
  selective: 'bg-solar',
  unavailable: 'bg-dust',
};

/**
 * Opening view: who this is, and the map of everything else.
 *
 * The solar system is the site's navigation rather than an illustration, so
 * the first screen answers both "who is this" and "what else is here". It
 * tracks the active section for the moment the reader starts scrolling before
 * the hero has left the viewport.
 */
export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const activeSection = useActiveSection(SECTION_IDS);

  return (
    <section id="top" className="relative flex min-h-dvh items-center py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-10">
        <div>
          <p className="telemetry">{t('label')}</p>

          <p className="glass mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide text-moondust">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${AVAILABILITY_DOT[profile.availability]}`}
            />
            {t(`availability.${profile.availability}`)}
          </p>

          <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight text-balance text-starlight sm:text-6xl xl:text-7xl">
            {profile.name}
          </h1>

          <p className="mt-4 font-display text-xl text-nebula-glow sm:text-2xl">
            {profile.role[locale]}
          </p>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-pretty text-moondust sm:text-lg">
            {profile.headline[locale]}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ActionLink href="#missions" variant="primary">
              {t('primaryAction')}
            </ActionLink>
            <ActionLink href="#contact">{t('secondaryAction')}</ActionLink>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <SolarSystem variant="hero" activeId={activeSection} />
        </div>
      </div>

      <p
        aria-hidden="true"
        className="absolute inset-x-0 bottom-7 text-center font-mono text-[0.625rem] tracking-[0.3em] text-dust uppercase"
      >
        {t('scrollHint')}
      </p>
    </section>
  );
}
