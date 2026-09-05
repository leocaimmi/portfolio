'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { SECTION_IDS } from '@/config/navigation';
import { useActiveSection } from '@/hooks/use-active-section';
import { cn } from '@/lib/cn';

import { LocaleSwitcher } from './locale-switcher';

/**
 * Floating glass bar holding the wordmark, the language switcher and the menu.
 *
 * There is deliberately no inline link list: the solar system is the site's
 * navigation, and repeating every section in the header would give screen
 * readers three copies of the same set of links. The menu here is the direct,
 * conventional route for anyone who would rather read a list than aim at a
 * planet.
 */
export function SiteHeader({ initials }: { initials: string }) {
  const t = useTranslations('nav');
  const activeSection = useActiveSection(SECTION_IDS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="glass flex h-14 items-center justify-between gap-4 rounded-full glass-raised px-4 sm:px-5">
          <a
            href="#top"
            className="font-display text-sm font-semibold tracking-[0.22em] text-starlight"
          >
            {initials}
          </a>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((open) => !open);
              }}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu"
              aria-label={isMenuOpen ? t('close') : t('open')}
              className="grid size-9 place-items-center rounded-full border border-starlight/12 text-starlight transition-colors duration-200 hover:bg-starlight/10"
            >
              <MenuIcon isOpen={isMenuOpen} />
            </button>
          </div>
        </div>

        <nav
          id="site-menu"
          aria-label={t('menu')}
          hidden={!isMenuOpen}
          className="glass mt-2 overflow-hidden rounded-3xl glass-raised"
        >
          <ul className="p-2">
            {SECTION_IDS.map((id) => {
              const isActive = activeSection === id;

              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'block rounded-2xl px-4 py-3 font-mono text-xs tracking-[0.18em] uppercase transition-colors duration-200',
                      isActive
                        ? 'bg-starlight/10 text-star'
                        : 'text-moondust hover:bg-starlight/6 hover:text-starlight',
                    )}
                  >
                    {t(id)}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

/**
 * Two bars that cross into a close icon.
 *
 * Decorative: the button itself carries the accessible name, which changes
 * between "open" and "close" so the state is announced rather than inferred
 * from the shape.
 */
function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-3 w-4">
      <span
        className={cn(
          'absolute inset-x-0 block h-px bg-current transition-all duration-300 ease-orbital',
          isOpen ? 'top-1/2 rotate-45' : 'top-0',
        )}
      />
      <span
        className={cn(
          'absolute inset-x-0 block h-px bg-current transition-all duration-300 ease-orbital',
          isOpen ? 'top-1/2 -rotate-45' : 'top-full',
        )}
      />
    </span>
  );
}
