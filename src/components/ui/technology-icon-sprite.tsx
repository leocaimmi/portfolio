import type { TechnologyId } from '@/content';
import { constellations, experience, projects } from '@/content';
import { TECHNOLOGY_ICONS } from '@/content/technology-icons';

import { technologyIconId } from './brand-icon';

/**
 * Every brand mark the page shows, defined once, for `TechnologyIcon` to point
 * at with `<use>`.
 *
 * Built from the same content the page renders, so it carries exactly the marks
 * something on the page refers to: a technology added to a project brings its
 * mark with it, and one that only exists in the registry costs nothing.
 *
 * Kept out of layout and out of sight rather than `display: none`, which some
 * engines treat as reason not to resolve what is inside. It sits at the end of
 * the page so the hero is parsed before any of it.
 */
export function TechnologyIconSprite() {
  const used = new Set<TechnologyId>([
    ...experience.flatMap((entry) => entry.stack),
    ...projects.flatMap((project) => project.stack),
    ...constellations.flatMap((sector) => sector.skills),
  ]);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute size-0 overflow-hidden"
    >
      <defs>
        {[...used].map((id) => {
          const glyph = TECHNOLOGY_ICONS[id];

          return glyph === undefined ? null : (
            <symbol key={id} id={technologyIconId(id)} viewBox={glyph.viewBox ?? '0 0 24 24'}>
              <path d={glyph.path} />
            </symbol>
          );
        })}
      </defs>
    </svg>
  );
}
