'use client';

import { useLocale, useTranslations } from 'next-intl';

import { CosmicScene } from '@/components/cosmos/cosmic-scene';
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
 * Opening view: the name over the system it navigates.
 *
 * The scene runs full bleed behind the text, and the planets in it are the
 * site's navigation. The copy sits in its own column on the left with pointer
 * events switched off around it, so the planets stay clickable wherever they
 * drift.
 */
export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const activeSection = useActiveSection(SECTION_IDS);

  return (
    <section id="top" className="relative flex min-h-dvh items-center overflow-hidden">
      <CosmicScene activeId={activeSection} />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 pb-[52vh] md:py-28">
        <div className="pointer-events-auto max-w-2xl">
          {/*
            Both of these are hidden on narrow screens. They are the two lines
            above the name, and on a phone they pushed the system so far down
            that most of it fell off the fold. The name is what a visitor came
            for; the eyebrow and the availability badge are context, and context
            can wait for a viewport that has room for it.
          */}
          <p className="hidden telemetry md:block">{t('label')}</p>

          <p className="glass mt-6 hidden items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide text-moondust md:inline-flex">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${AVAILABILITY_DOT[profile.availability]}`}
            />
            {t(`availability.${profile.availability}`)}
          </p>

          <h1 className="font-display text-5xl font-semibold tracking-tight text-balance text-starlight sm:text-6xl md:mt-6 xl:text-7xl">
            {profile.name}
          </h1>

          <p className="mt-3 font-display text-xl text-nebula-glow sm:text-2xl md:mt-4">
            {profile.role[locale]}
          </p>

          <p className="mt-5 text-base leading-relaxed text-pretty text-moondust sm:text-lg md:mt-7">
            {profile.headline[locale]}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-9">
            <ActionLink href="#missions" variant="primary">
              {t('primaryAction')}
            </ActionLink>
            <ActionLink href="#contact">{t('secondaryAction')}</ActionLink>
          </div>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="absolute inset-x-0 bottom-7 z-10 text-center font-mono text-[0.625rem] tracking-[0.3em] text-dust uppercase"
      >
        {t('scrollHint')}
      </p>
    </section>
  );
}
