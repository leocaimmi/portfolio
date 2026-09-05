import { useLocale, useTranslations } from 'next-intl';

import { ActionLink } from '@/components/ui/action-link';
import { profile } from '@/content';

const AVAILABILITY_DOT: Record<typeof profile.availability, string> = {
  open: 'bg-star',
  selective: 'bg-solar',
  unavailable: 'bg-dust',
};

/**
 * Opening view: who this is, what they do, and the two things a visitor is
 * most likely to want next.
 *
 * The decorative orbit rings are inline SVG rather than an image, so they cost
 * no extra request, scale without artefacts and inherit the palette. They are
 * hidden from assistive technology; the section carries no meaning that is not
 * also in the text.
 */
export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section id="top" className="relative flex min-h-dvh items-center overflow-hidden">
      <svg
        aria-hidden="true"
        viewBox="0 0 800 800"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[130vmin] w-[130vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]"
      >
        <defs>
          <radialGradient id="hero-orbit-fade">
            <stop offset="55%" stopColor="var(--color-star)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-star)" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        {[180, 280, 380].map((radius) => (
          <circle
            key={radius}
            cx="400"
            cy="400"
            r={radius}
            fill="none"
            stroke="url(#hero-orbit-fade)"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-32">
        <p className="telemetry">{t('label')}</p>

        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-horizon/70 bg-deep/60 px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide text-moondust">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${AVAILABILITY_DOT[profile.availability]}`}
          />
          {t(`availability.${profile.availability}`)}
        </p>

        <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight text-balance text-starlight sm:text-6xl lg:text-7xl">
          {profile.name}
        </h1>

        <p className="mt-4 font-display text-xl text-nebula-glow sm:text-2xl">
          {profile.role[locale]}
        </p>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-pretty text-moondust">
          {profile.headline[locale]}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ActionLink href="#missions" variant="primary">
            {t('primaryAction')}
          </ActionLink>
          <ActionLink href="#contact">{t('secondaryAction')}</ActionLink>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 text-center font-mono text-[0.625rem] tracking-[0.3em] text-dust uppercase"
      >
        {t('scrollHint')}
      </p>
    </section>
  );
}
