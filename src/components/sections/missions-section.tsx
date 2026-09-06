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
 * Projects section: the catalogue.
 *
 * Three cards abreast, each one scannable in a glance — what the system is,
 * what it is built from, and whether its source can be read. The account of
 * what the work involved lives in the timeline, told once as a role with its
 * outcomes; when it was repeated here as well, every project had two versions
 * of itself and a card too tall to compare with its neighbours.
 *
 * The site's own solar system already indexes the sections, so this one stays a
 * plain grid — a second orbital diagram here would compete with the navigation
 * rather than add to it.
 */
export function MissionsSection() {
  const t = useTranslations('missions');
  const locale = useLocale();

  return (
    <Section id="missions" label={t('label')} title={t('title')} description={t('description')}>
      <ul className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <li key={project.id} className="h-full">
            <Reveal delay={index * 60} className="h-full">
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
      className="flex h-full flex-col p-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3
          id={`project-${project.id}-title`}
          className="font-display text-lg font-semibold text-starlight"
        >
          {project.name}
        </h3>
        <span className="font-mono text-[0.6875rem] tracking-wide text-dust">{project.year}</span>
      </div>

      <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.6875rem] tracking-wide text-dust">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
          />
          {t(`status.${project.status}`)}
        </li>
        <li>{t(`visibility.${project.visibility}`)}</li>
      </ul>

      <p className="mt-4 text-sm leading-relaxed text-pretty text-moondust">
        {project.description[locale]}
      </p>

      {/* Pushed to the bottom, so the stacks line up across the row. */}
      <div className="mt-auto pt-6">
        <h4 className="sr-only">{t('stackTitle')}</h4>
        <TechTagList items={project.stack} />
      </div>

      {(project.links.repository ?? project.links.live) ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
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
        </div>
      ) : null}
    </Panel>
  );
}
