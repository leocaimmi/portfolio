import { useTranslations } from 'next-intl';

import { profile } from '@/content';

/**
 * Closing band: authorship, the source link and a way back to the top.
 *
 * A server component — nothing here needs the browser.
 */
export function SiteFooter() {
  const t = useTranslations('footer');
  const common = useTranslations('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-horizon/40 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[0.6875rem] tracking-wide text-dust">
          © {currentYear} {profile.name} · {t('builtWith')}
        </p>

        <div className="flex items-center gap-5">
          <a
            href="https://github.com/leocaimmi/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.6875rem] tracking-wide text-dust transition-colors hover:text-star"
          >
            {t('sourceCode')}
            <span className="sr-only"> {common('opensInNewTab')}</span>
          </a>

          <a
            href="#top"
            className="font-mono text-[0.6875rem] tracking-wide text-dust transition-colors hover:text-star"
          >
            {t('backToTop')}
          </a>
        </div>
      </div>
    </footer>
  );
}
