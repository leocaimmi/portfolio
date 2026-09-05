'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/cn';

/**
 * Switches between the two locales while staying on the current page.
 *
 * Rendered as real links rather than a select, so each language version is
 * crawlable and can be opened in a new tab. The active option is marked with
 * `aria-current` instead of colour alone.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const activeLocale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('locale');

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
            href={pathname}
            locale={locale}
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
