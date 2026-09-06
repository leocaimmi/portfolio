import { useLocale, useTranslations } from 'next-intl';

import { ActionLink } from '@/components/ui/action-link';
import { Panel } from '@/components/ui/panel';
import { Reveal } from '@/components/ui/reveal';
import { Section } from '@/components/ui/section';
import { TechTagList } from '@/components/ui/tech-tag';
import type { Project } from '@/content';
import { projects } from '@/content';
import type { Locale } from '@/i18n/routing';

const STATUS_DOT = {
  production: 'bg-star',
  development: 'bg-solar',
  archived: 'bg-dust',
} as const;

/**
 * Projects section: the case studies in full.
 *
 * The site's own solar system already indexes the sections, so this one stays
 * a plain list — a second orbital diagram here would compete with the
 * navigation rather than add to it.
 */
export function MissionsSection() {
  const t = useTranslations('missions');
  const locale = useLocale();

  return (
    <Section id="missions" label={t('label')} title={t('title')} description={t('description')}>
      <ul className="space-y-6">
        {projects.map((project, index) => (
          <li key={project.id}>
            <Reveal delay={index * 60}>
              <ProjectCard project={project} locale={locale} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const t = useTranslations('missions');
  const common = useTranslations('common');

  return (
    <Panel
      as="article"
      id={`project-${project.id}`}
      aria-labelledby={`project-${project.id}-title`}
      className="p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div>
          <h3
            id={`project-${project.id}-title`}
            className="font-display text-xl font-semibold text-starlight"
          >
            {project.name}
          </h3>
          <p className="mt-1.5 text-sm text-pretty text-nebula-glow">{project.tagline[locale]}</p>
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.6875rem] tracking-wide text-dust">
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
            />
            {t(`status.${project.status}`)}
          </li>
          <li>{t(`visibility.${project.visibility}`)}</li>
          <li>{project.year}</li>
        </ul>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-pretty text-moondust">
        {project.description[locale]}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="telemetry">{t('contributionTitle')}</h4>
          <p className="mt-3 text-sm leading-relaxed text-pretty text-moondust">
            {project.contribution[locale]}
          </p>
        </div>

        <div>
          <h4 className="telemetry">{t('highlightsTitle')}</h4>
          <ul className="mt-3 space-y-2">
            {project.highlights.map((highlight) => (
              <li
                key={highlight.en}
                className="flex gap-3 text-sm leading-relaxed text-pretty text-moondust"
              >
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-star" />
                {highlight[locale]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7 border-t border-horizon/50 pt-5">
        <h4 className="sr-only">{t('stackTitle')}</h4>
        <TechTagList items={project.stack} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {project.links.repository ? (
          <ActionLink
            href={project.links.repository}
            external
            newTabLabel={common('opensInNewTab')}
          >
            {t('viewSource')}
          </ActionLink>
        ) : null}

        {project.links.live ? (
          <ActionLink
            href={project.links.live}
            variant="primary"
            external
            newTabLabel={common('opensInNewTab')}
          >
            {t('viewLive')}
          </ActionLink>
        ) : null}

        {project.visibility === 'private' ? (
          <p className="font-mono text-[0.6875rem] tracking-wide text-dust">{t('privateNote')}</p>
        ) : null}
      </div>
    </Panel>
  );
}
