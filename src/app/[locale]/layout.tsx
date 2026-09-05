import '@/styles/globals.css';

import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { NebulaBackdrop } from '@/components/cosmos/nebula-backdrop';
import { OrbitalNavigator } from '@/components/cosmos/orbital-navigator';
import { Starfield } from '@/components/cosmos/starfield';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { profile } from '@/content';
import type { LocaleRouteParams } from '@/i18n/resolve-locale';
import { resolveLocale } from '@/i18n/resolve-locale';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/styles/fonts';

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
  colorScheme: 'dark',
};

const initials = profile.name
  .split(' ')
  .map((part) => part.charAt(0))
  .join('');

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleRouteParams>;
}) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <html lang={locale} className={fontVariables}>
      <body className="bg-void text-starlight antialiased">
        {/* First focusable element on the page, revealed only on focus. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-starlight focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-void"
        >
          {t('skipToContent')}
        </a>

        <NextIntlClientProvider>
          <NebulaBackdrop />
          <Starfield />

          <SiteHeader initials={initials} />

          <main id="main">{children}</main>

          <SiteFooter />

          <OrbitalNavigator />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
