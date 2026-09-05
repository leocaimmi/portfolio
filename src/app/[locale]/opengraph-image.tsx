import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

import { profile } from '@/content';
import type { LocaleRouteParams } from '@/i18n/resolve-locale';
import { resolveLocale } from '@/i18n/resolve-locale';
import { routing } from '@/i18n/routing';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Leonardo Caimmi — Full Stack Developer';

export function generateStaticParams(): LocaleRouteParams[] {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Social preview card, rendered at build time — one per locale.
 *
 * Deliberately plain: this is composed by Satori, which supports a small
 * subset of CSS, so the palette is inlined as hex and the layout is flexbox
 * and border-radius only. The star and its rings are three nested boxes
 * rather than the real scene, because a link preview has to survive being
 * shown at thumbnail size.
 */
export default async function OpenGraphImage({ params }: { params: Promise<LocaleRouteParams> }) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        backgroundColor: '#02030a',
        backgroundImage:
          'radial-gradient(circle at 78% 34%, rgba(124,58,237,0.42), transparent 55%), radial-gradient(circle at 12% 88%, rgba(34,211,238,0.22), transparent 52%)',
        color: '#e9edff',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '150px',
          right: '96px',
          width: '330px',
          height: '330px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: '1px solid rgba(34,211,238,0.28)',
        }}
      >
        <div
          style={{
            width: '210px',
            height: '210px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: '1px solid rgba(34,211,238,0.22)',
          }}
        >
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              boxShadow: '0 0 90px 24px rgba(251,191,36,0.4)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: '26px',
          letterSpacing: '8px',
          textTransform: 'uppercase',
          color: '#22d3ee',
        }}
      >
        {profile.name}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: '26px',
          fontSize: '68px',
          fontWeight: 700,
          lineHeight: 1.1,
          maxWidth: '720px',
        }}
      >
        {profile.role[locale]}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: '30px',
          fontSize: '28px',
          lineHeight: 1.4,
          maxWidth: '680px',
          color: '#a7b1d4',
        }}
      >
        {t('description')}
      </div>
    </div>,
    size,
  );
}
