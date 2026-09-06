import { useLocale, useTranslations } from 'next-intl';

import { CosmicScene } from '@/components/cosmos/cosmic-scene';
import { ActionLink } from '@/components/ui/action-link';
import { profile } from '@/content';

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
 *
 * The name comes first, with everything that qualifies it underneath: the role,
 * the degree behind it, and whether he is taking work. Nothing sits above the
 * name any more — a label over a headline pushes the one thing a visitor came
 * for further down the screen in exchange for saying less.
 *
 * Rendered on the server. Only the scene tracks which section the reader is
 * in, and it tracks that for itself: when the hero held the subscription, every
 * section boundary crossed on the way down re-rendered the name, the role, the
 * headline and both buttons to change one planet's colour.
 */
export function HeroSection() {
  const t = useTranslations('hero');
  const common = useTranslations('common');
  const locale = useLocale();

  return (
    <section id="top" className="relative flex min-h-dvh items-center overflow-hidden">
      <CosmicScene />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 pb-[52vh] md:py-24">
        <div className="pointer-events-auto max-w-2xl">
          <h1 className="font-display text-5xl font-semibold tracking-tight text-balance text-starlight sm:text-6xl xl:text-7xl">
            {profile.name}
          </h1>

          <p className="mt-3 font-display text-xl text-nebula-glow sm:text-2xl">
            {profile.role[locale]}
          </p>

          <p className="mt-1.5 font-mono text-[0.6875rem] tracking-wide text-dust sm:text-xs">
            {profile.credential[locale]}
          </p>

          {/*
            Hidden on narrow screens. On a phone this line pushed the system so
            far down that most of it fell off the fold, and the same statement
            is repeated in the footer, which a phone reaches quickly.
          */}
          <p className="glass mt-5 hidden items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide text-moondust md:inline-flex">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${AVAILABILITY_DOT[profile.availability]}`}
            />
            {common(`availability.${profile.availability}`)}
          </p>

          <p className="mt-5 text-base leading-relaxed text-pretty text-moondust sm:text-lg md:mt-6">
            {profile.headline[locale]}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-8">
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
