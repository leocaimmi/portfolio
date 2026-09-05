import { useTranslations } from 'next-intl';

import { ActionLink } from '@/components/ui/action-link';

/**
 * 404 for anything under a valid locale.
 *
 * Deliberately quiet — a lost visitor wants the way back, not a set piece —
 * and it reuses the layout's chrome rather than rebuilding a page shell.
 */
export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-6 py-32">
      <p className="telemetry">{t('label')}</p>

      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-balance text-starlight sm:text-5xl">
        {t('title')}
      </h1>

      <p className="mt-5 max-w-lg text-base leading-relaxed text-pretty text-moondust">
        {t('description')}
      </p>

      <div className="mt-10">
        <ActionLink href="/" variant="primary">
          {t('action')}
        </ActionLink>
      </div>
    </section>
  );
}
