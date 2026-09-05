'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { SECTION_IDS } from '@/config/navigation';
import { useActiveSection } from '@/hooks/use-active-section';
import { cn } from '@/lib/cn';

import { LocaleSwitcher } from './locale-switcher';

/**
 * Fixed navigation bar with scroll spy and a mobile disclosure menu.
 *
 * The active section is conveyed with `aria-current` as well as colour, the
 * mobile toggle is a real button wired to `aria-expanded`, and Escape closes
 * the panel — the behaviours a keyboard user expects from a disclosure.
 */
export function SiteHeader({ initials }: { initials: string }) {
  const t = useTranslations('nav');
  const activeSection = useActiveSection(SECTION_IDS);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-orbital',
        isScrolled || isMenuOpen
          ? 'border-b border-horizon/50 bg-void/80 backdrop-blur-md'
          : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <a
          href="#top"
          className="font-display text-sm font-semibold tracking-[0.2em] text-starlight"
        >
          {initials}
        </a>

        <nav aria-label={t('label')} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {SECTION_IDS.map((id) => {
              const isActive = activeSection === id;

              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'rounded-full px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide uppercase transition-colors duration-200',
                      isActive
                        ? 'bg-horizon/40 text-star'
                        : 'text-dust hover:bg-horizon/25 hover:text-starlight',
                    )}
                  >
                    {t(id)}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />

          <button
            type="button"
            onClick={() => {
              setIsMenuOpen((open) => !open);
            }}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="rounded-full border border-horizon/70 px-3 py-1.5 font-mono text-[0.6875rem] tracking-wide text-starlight md:hidden"
          >
            {isMenuOpen ? t('close') : t('open')}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        aria-label={t('label')}
        hidden={!isMenuOpen}
        className="border-t border-horizon/40 md:hidden"
      >
        <ul className="mx-auto flex w-full max-w-6xl flex-col px-6 py-2">
          {SECTION_IDS.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                aria-current={activeSection === id ? 'true' : undefined}
                className="block py-3 font-mono text-xs tracking-wide text-moondust uppercase"
              >
                {t(id)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
