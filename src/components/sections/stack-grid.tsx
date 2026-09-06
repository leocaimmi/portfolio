'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { TechnologyIcon } from '@/components/ui/brand-icon';
import type { TechnologyId } from '@/content';
import { constellations, technologyName } from '@/content';
import { cn } from '@/lib/cn';

/**
 * The stack, sector by sector, laid out side by side.
 *
 * A column per group rather than bands stacked down the page: the same
 * information in a fraction of the scroll, and the groups can be compared
 * against each other instead of remembered one after another.
 *
 * What is held is the set of sectors switched *off*, so the initial state is an
 * empty array and "everything is shown" needs no special case anywhere.
 */
export function StackGrid() {
  const t = useTranslations('constellations');
  const locale = useLocale();
  const [muted, setMuted] = useState<readonly string[]>([]);

  const visible = constellations.filter((sector) => !muted.includes(sector.id));

  const toggle = (id: string) => {
    setMuted((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <h3 className="sr-only">{t('filterLabel')}</h3>

        {constellations.map((sector) => (
          <SectorToggle
            key={sector.id}
            label={sector.name[locale]}
            isOn={!muted.includes(sector.id)}
            onToggle={() => {
              toggle(sector.id);
            }}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-moondust">
          {t('empty')}{' '}
          <button
            type="button"
            onClick={() => {
              setMuted([]);
            }}
            className="text-star underline underline-offset-4 transition-colors duration-200 hover:text-starlight"
          >
            {t('showAll')}
          </button>
        </p>
      ) : (
        <div className="mt-10 grid items-start gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visible.map((sector) => (
            <section key={sector.id} aria-labelledby={`sector-${sector.id}`}>
              <h3
                id={`sector-${sector.id}`}
                className="font-display text-base font-semibold text-starlight"
              >
                {sector.name[locale]}
              </h3>

              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-moondust">
                {sector.description[locale]}
              </p>

              <ul className="mt-4 space-y-2">
                {sector.skills.map((id) => (
                  <SkillCard key={id} id={id} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function SectorToggle({
  label,
  isOn,
  onToggle,
}: {
  label: string;
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isOn}
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.14em] uppercase transition-colors duration-300 ease-orbital',
        isOn
          ? 'border-star/45 bg-star/8 text-starlight'
          : 'border-horizon/70 text-dust hover:border-horizon/100 hover:text-moondust',
      )}
    >
      <Meteor isOn={isOn} />
      {label}
    </button>
  );
}

/**
 * The switch itself: a star that draws its streak behind it when it lights.
 *
 * The tail is scaled from its own head rather than animated in width, so the
 * browser can run it on the compositor, and it reads as the thing shooting
 * rather than as a bar growing.
 */
function Meteor({ isOn }: { isOn: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-1.5 w-5">
      <span
        className={cn(
          'absolute top-1/2 right-1 h-px w-4 origin-right -translate-y-1/2 transition-transform duration-500 ease-orbital',
          isOn ? 'scale-x-100' : 'scale-x-0',
        )}
        style={{ backgroundImage: 'linear-gradient(to left, currentColor, transparent)' }}
      />

      <span
        className={cn(
          'absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rounded-full bg-current transition-shadow duration-500 ease-orbital',
          isOn && 'shadow-[0_0_7px_currentColor]',
        )}
      />
    </span>
  );
}

/** One line per technology: the mark and the name. */
function SkillCard({ id }: { id: TechnologyId }) {
  return (
    <li className="flex items-center gap-2.5 rounded-xl border border-horizon/70 bg-deep/40 px-3 py-2 transition-colors duration-300 ease-orbital hover:border-star/40">
      <TechnologyIcon id={id} className="size-4 text-moondust" />

      <span className="min-w-0 flex-1 truncate text-sm text-starlight">{technologyName(id)}</span>
    </li>
  );
}
