import { z } from 'zod';

import { education as educationData } from './education';
import { experience as experienceData } from './experience';
import { profile as profileData } from './profile';
import { projects as projectsData } from './projects';
import {
  constellationSchema,
  educationSchema,
  experienceSchema,
  profileSchema,
  projectSchema,
} from './schemas';
import { constellations as constellationsData } from './skills';

/**
 * Single entry point to the content layer.
 *
 * Every data file is parsed here, at module load. Because the pages are
 * statically generated, that means a malformed entry fails `next build` with a
 * readable message instead of reaching a visitor. Import from this module
 * rather than from the individual data files so nothing bypasses validation.
 */

function parseContent<T>(schema: z.ZodType<T>, value: unknown, source: string): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new Error(`Invalid content in "${source}".\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}

/** Ids double as DOM anchors and React keys, so collisions must be fatal. */
function uniqueById<T extends { id: string }>(schema: z.ZodType<T>) {
  return z.array(schema).superRefine((items, ctx) => {
    const seen = new Set<string>();

    items.forEach((item, index) => {
      if (seen.has(item.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate id "${item.id}".`,
          path: [index, 'id'],
        });
      }

      seen.add(item.id);
    });
  });
}

export const profile = parseContent(profileSchema, profileData, 'profile');

export const experience = parseContent(
  uniqueById(experienceSchema),
  experienceData,
  'experience',
).toSorted((a, b) => b.period.start.localeCompare(a.period.start));

export const education = parseContent(uniqueById(educationSchema), educationData, 'education')
  // Undated entries sort last: an empty start compares below every real one.
  .toSorted((a, b) => (b.period?.start ?? '').localeCompare(a.period?.start ?? ''));

export const projects = parseContent(uniqueById(projectSchema), projectsData, 'projects');

export const constellations = parseContent(
  uniqueById(constellationSchema),
  constellationsData,
  'skills',
);

export * from './schemas';
export type { TechnologyCategory, TechnologyId } from './technologies';
export { technologies, technologyName } from './technologies';
