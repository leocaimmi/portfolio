import type { LocaleRouteParams } from '@/i18n/resolve-locale';
import { resolveLocale } from '@/i18n/resolve-locale';

export default async function HomePage({ params }: { params: Promise<LocaleRouteParams> }) {
  await resolveLocale(params);

  return (
    <main className="grid min-h-dvh place-items-center">
      <p className="telemetry">Leonardo Caimmi</p>
    </main>
  );
}
