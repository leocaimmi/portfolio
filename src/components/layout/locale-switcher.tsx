'use client';

import { useLocale, useTranslations } from 'next-intl';

import { useActiveSection } from '@/hooks/use-active-section';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/**
 * Switches between the two locales while staying where the reader is.
 *
 * Everything lives on one page, so the section under the reader is the whole of
 * their position. The fragment in the href carries it for anyone who copies the
 * link or opens it in a new tab; an ordinary click never uses it, because
 * following it meant a fresh document that starts at the top and then smooth
 * scrolls the reader all the way back down to where they already were.
 *
 * A plain click swaps the locale in place instead: the same route, the same
 * scroll offset, only the text changes. The keys that ask for a new tab or
 * window are left to the browser, and the anchors stay real anchors, so each
 * language version is still crawlable.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const activeSection = useActiveSection();
  const t = useTranslations('locale');

  const href = activeSection === undefined ? pathname : `${pathname}#${activeSection}`;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-full border border-horizon/70 p-0.5',
        className,
      )}
    >
      <span className="sr-only">{t('label')}</span>

      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;

        return (
          <Link
            key={locale}
            href={href}
            locale={locale}
            onClick={(event) => {
              if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              ) {
                return;
              }

              event.preventDefault();
              router.push(pathname, { locale, scroll: false });
            }}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'rounded-full px-2.5 py-1 font-mono text-[0.6875rem] tracking-wide transition-colors duration-200',
              isActive
                ? 'bg-starlight/95 text-void'
                : 'text-dust hover:bg-horizon/40 hover:text-starlight',
            )}
          >
            {t(locale)}
          </Link>
        );
      })}
    </div>
  );
}
