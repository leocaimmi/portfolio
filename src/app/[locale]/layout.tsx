import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import type { LocaleRouteParams } from '@/i18n/resolve-locale';
import { resolveLocale } from '@/i18n/resolve-locale';
import { routing } from '@/i18n/routing';

export function generateStaticParams(): LocaleRouteParams[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export const viewport: Viewport = {
  themeColor: '#050510',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleRouteParams>;
}) {
  const locale = await resolveLocale(params);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
