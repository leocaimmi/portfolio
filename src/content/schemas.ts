import { z } from 'zod';

import type { Locale } from '@/i18n/routing';

import { TECHNOLOGY_IDS } from './technologies';

/**
 * Runtime contract for everything under `src/content`.
 *
 * The data files are plain TypeScript objects, so most mistakes are caught by
 * the compiler. These schemas cover what types cannot express — non-empty
 * strings, valid URLs, well-formed dates, chronological ordering — and are
 * evaluated while the pages are statically generated, which turns a malformed
 * entry into a failed build rather than a broken production page.
 */

/**
 * Text that must exist in every supported locale.
 *
 * The explicit annotation is deliberate: adding a locale to `routing` widens
 * `LocalizedText` and breaks this assignment until the schema is updated, so a
 * new language can never ship with silently missing copy.
 */
export type LocalizedText = Record<Locale, string>;

export const localizedTextSchema: z.ZodType<LocalizedText> = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
});

/** A slug used for anchors, keys and route segments. */
export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase, hyphen-separated slug.');

/** A calendar month, `YYYY-MM`. Day precision is noise on a career timeline. */
export const monthSchema = z
  .string()
  .regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, 'Must be a month in YYYY-MM format.');

export const technologyIdSchema = z.enum(TECHNOLOGY_IDS);

/**
 * A date range where a null end means "still ongoing".
 *
 * Refined rather than merely typed, because an end date preceding its start is
 * a valid pair of strings and an invalid piece of history.
 */
export const periodSchema = z
  .object({
    start: monthSchema,
    end: monthSchema.nullable(),
  })
  .refine((period) => period.end === null || period.end >= period.start, {
    message: 'The end month cannot precede the start month.',
    path: ['end'],
  });

export type Period = z.infer<typeof periodSchema>;

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

export const socialPlatforms = ['github', 'linkedin', 'email'] as const;

export const socialLinkSchema = z.object({
  platform: z.enum(socialPlatforms),
  /** Shown as the visible label and announced to screen readers. */
  handle: z.string().min(1),
  url: z.url(),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  /** Short job title, rendered next to the name. */
  role: localizedTextSchema,
  /** One-sentence hook for the hero section. */
  headline: localizedTextSchema,
  /** Longer narrative, one entry per paragraph. */
  biography: z.array(localizedTextSchema).min(1),
  location: localizedTextSchema,
  email: z.email(),
  socials: z.array(socialLinkSchema).min(1),
  /** Drives the availability badge; keep it honest. */
  availability: z.enum(['open', 'selective', 'unavailable']),
});

export type Profile = z.infer<typeof profileSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;

/* -------------------------------------------------------------------------- */
/* Experience                                                                 */
/* -------------------------------------------------------------------------- */

export const experienceSchema = z.object({
  id: slugSchema,
  organization: z.string().min(1),
  role: localizedTextSchema,
  kind: z.enum(['employment', 'teaching', 'freelance']),
  period: periodSchema,
  location: localizedTextSchema,
  summary: localizedTextSchema,
  /** Concrete outcomes. Prefer what shipped over what was used. */
  achievements: z.array(localizedTextSchema).min(1),
  stack: z.array(technologyIdSchema),
});

export type Experience = z.infer<typeof experienceSchema>;

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const projectLinksSchema = z.object({
  repository: z.url().optional(),
  live: z.url().optional(),
});

/**
 * `private` marks work under NDA or in a closed repository. The UI still tells
 * the full story but renders no source link, so the constraint is explicit
 * rather than looking like an omission.
 */
export const projectVisibility = ['public', 'private'] as const;

export const projectSchema = z
  .object({
    id: slugSchema,
    name: z.string().min(1),
    tagline: localizedTextSchema,
    description: localizedTextSchema,
    /** What the author personally owned on the project. */
    contribution: localizedTextSchema,
    year: z.number().int().gte(2020).lte(2100),
    status: z.enum(['production', 'development', 'archived']),
    visibility: z.enum(projectVisibility),
    /** Raises the project to the inner orbit and a larger card. */
    featured: z.boolean(),
    stack: z.array(technologyIdSchema).min(1),
    highlights: z.array(localizedTextSchema).min(1),
    links: projectLinksSchema,
  })
  .refine((project) => project.visibility === 'public' || project.links.repository === undefined, {
    message: 'A private project must not expose a repository link.',
    path: ['links', 'repository'],
  });

export type Project = z.infer<typeof projectSchema>;
export type ProjectLinks = z.infer<typeof projectLinksSchema>;

/* -------------------------------------------------------------------------- */
/* Skills                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Borrowed from stellar magnitude, where a lower number is a brighter star:
 * 1 is daily, production-grade work, 3 is working familiarity. The scale is
 * inverted on purpose so the metaphor holds visually.
 */
export const skillMagnitudeSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const skillSchema = z.object({
  technology: technologyIdSchema,
  magnitude: skillMagnitudeSchema,
});

export const constellationSchema = z.object({
  id: slugSchema,
  name: localizedTextSchema,
  description: localizedTextSchema,
  skills: z.array(skillSchema).min(1),
});

export type Skill = z.infer<typeof skillSchema>;
export type SkillMagnitude = z.infer<typeof skillMagnitudeSchema>;
export type Constellation = z.infer<typeof constellationSchema>;

/* -------------------------------------------------------------------------- */
/* Education                                                                  */
/* -------------------------------------------------------------------------- */

export const educationSchema = z.object({
  id: slugSchema,
  institution: z.string().min(1),
  title: localizedTextSchema,
  kind: z.enum(['degree', 'course', 'language']),
  period: periodSchema,
});

export type Education = z.infer<typeof educationSchema>;
