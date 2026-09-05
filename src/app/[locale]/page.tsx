import type { LocaleRouteParams } from '@/i18n/resolve-locale';
import { resolveLocale } from '@/i18n/resolve-locale';

export default async function HomePage({ params }: { params: Promise<LocaleRouteParams> }) {
  await resolveLocale(params);

  return <main>Leonardo Caimmi</main>;
}
