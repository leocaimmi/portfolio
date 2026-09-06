'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { SectionId } from '@/config/navigation';
import { SECTION_IDS } from '@/config/navigation';
import { useActiveSection } from '@/hooks/use-active-section';
import { cn } from '@/lib/cn';

import { LocaleSwitcher } from './locale-switcher';
import { Wordmark } from './wordmark';

/**
 * Floating glass bar: the mark, the section links, the language switcher.
 *
 * The link list is inline from `md` upwards and collapses behind a hamburger
 * below it. Both renderings exist in the markup, but only one is ever
 * displayed, so no visitor — and no screen reader — meets the same links
 * twice.
 *
 * This is the plain, conventional route around the site. The solar system in
 * the hero is the same journey drawn as a map, and each carries its own
 * landmark label so the two are distinguishable when listed.
 */
export function SiteHeader({ name }: { name: string }) {
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
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="glass flex h-14 items-center gap-4 rounded-full glass-raised px-4 sm:px-5">
          <Wordmark name={name} />

          <nav aria-label={t('label')} className="ml-auto hidden md:block">
            <ul className="flex items-center gap-0.5">
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <NavLink id={id} isActive={activeSection === id} label={t(id)} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-3">
            <LocaleSwitcher />

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((open) => !open);
              }}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu"
              aria-label={isMenuOpen ? t('close') : t('open')}
              className="grid size-9 place-items-center rounded-full border border-starlight/12 text-starlight transition-colors duration-200 hover:bg-starlight/10 md:hidden"
            >
              <MenuIcon isOpen={isMenuOpen} />
            </button>
          </div>
        </div>

        <nav
          id="site-menu"
          aria-label={t('menu')}
          hidden={!isMenuOpen}
          className="glass absolute inset-x-0 top-full mt-2 rounded-3xl glass-raised md:hidden"
        >
          <ul className="p-2">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  aria-current={activeSection === id ? 'true' : undefined}
                  className={cn(
                    'block rounded-2xl px-4 py-3 font-mono text-xs tracking-[0.18em] uppercase transition-colors duration-200',
                    activeSection === id
                      ? 'bg-starlight/10 text-star'
                      : 'text-moondust hover:bg-starlight/6 hover:text-starlight',
                  )}
                >
                  {t(id)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ id, isActive, label }: { id: SectionId; isActive: boolean; label: string }) {
  return (
    <a
      href={`#${id}`}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'relative block rounded-full px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.14em] uppercase transition-colors duration-300',
        isActive ? 'text-star' : 'text-dust hover:text-starlight',
      )}
    >
      {label}

      {/* An underline rather than a filled pill: lighter, and it reads over glass. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-3 bottom-0.5 h-px origin-center bg-star transition-transform duration-300 ease-orbital',
          isActive ? 'scale-x-100' : 'scale-x-0',
        )}
      />
    </a>
  );
}

/**
 * Three bars that fold into a close icon: the outer two cross, the middle one
 * fades out.
 *
 * Decorative. The button carries the accessible name, which switches between
 * open and close, so the state is announced rather than inferred from a shape.
 */
function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-2.5 w-4">
      <span
        className={cn(
          'absolute inset-x-0 block h-px bg-current transition-all duration-300 ease-orbital',
          isOpen ? 'top-1/2 rotate-45' : 'top-0',
        )}
      />
      <span
        className={cn(
          'absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 bg-current transition-opacity duration-200',
          isOpen ? 'opacity-0' : 'opacity-100',
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
