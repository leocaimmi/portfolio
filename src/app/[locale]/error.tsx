'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { Link } from '@/i18n/navigation';

/**
 * Error boundary for the localised routes.
 *
 * The error's own message is never rendered. In production Next.js replaces it
 * with a digest anyway, but in development it can carry file paths and query
 * fragments, and a boundary that prints whatever it is handed is exactly how
 * that leaks into a screenshot. The digest is shown instead: enough to match a
 * report against a server log, and meaningless to anyone else.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 py-32">
      <p className="telemetry">{t('label')}</p>

      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance text-starlight sm:text-5xl">
        {t('title')}
      </h1>

      <p className="mt-5 max-w-lg text-base leading-relaxed text-pretty text-moondust">
        {t('description')}
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-starlight px-5 py-2.5 font-mono text-xs tracking-wide text-void uppercase transition-colors duration-300 hover:bg-white"
        >
          {t('retry')}
        </button>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-horizon px-5 py-2.5 font-mono text-xs tracking-wide text-starlight uppercase transition-colors duration-300 hover:border-star/60 hover:text-star"
        >
          {t('home')}
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-8 font-mono text-[0.6875rem] tracking-wide text-dust">
          REF {error.digest}
        </p>
      ) : null}
    </section>
  );
}
