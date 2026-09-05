import { constellations, education, experience, profile, projects } from '@/content';
import type { LocaleRouteParams } from '@/i18n/resolve-locale';
import { resolveLocale } from '@/i18n/resolve-locale';

export default async function HomePage({ params }: { params: Promise<LocaleRouteParams> }) {
  const locale = await resolveLocale(params);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <p className="telemetry">
        {profile.name} · {experience.length} roles · {projects.length} projects ·{' '}
        {constellations.length} constellations · {education.length} entries
      </p>
      <p className="mt-4 text-moondust">{profile.headline[locale]}</p>
    </main>
  );
}
