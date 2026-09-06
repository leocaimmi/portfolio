import { describe, expect, it } from 'vitest';

import { constellations, education, experience, profile, projects } from '@/content';
import { periodSchema, projectSchema, slugSchema } from '@/content/schemas';
import { technologies } from '@/content/technologies';

/**
 * The content layer's contract.
 *
 * The point of these is not that the current copy happens to be valid — the
 * build already proves that by parsing it. It is that the guards which make
 * that proof meaningful actually reject what they claim to reject.
 */

describe('content invariants', () => {
  it('parses the real content at import time', () => {
    expect(profile.name).toBeTruthy();
    expect(experience.length).toBeGreaterThan(0);
    expect(projects.length).toBeGreaterThan(0);
    expect(constellations.length).toBeGreaterThan(0);
    expect(education.length).toBeGreaterThan(0);
  });

  it('orders experience and education newest first', () => {
    const starts = experience.map((entry) => entry.period.start);
    expect([...starts].sort().reverse()).toEqual(starts);

    // An entry with no period sorts last, so an empty start belongs at the end.
    const educationStarts = education.map((entry) => entry.period?.start ?? '');
    expect([...educationStarts].sort().reverse()).toEqual(educationStarts);
  });

  it('gives every entry a unique id', () => {
    for (const collection of [experience, projects, constellations, education]) {
      const ids = collection.map((entry) => entry.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('translates every localised string into both locales', () => {
    for (const paragraph of profile.biography) {
      expect(paragraph.es.trim()).not.toBe('');
      expect(paragraph.en.trim()).not.toBe('');
    }

    for (const project of projects) {
      expect(project.description.es).not.toBe(project.description.en);
    }
  });

  it('references only technologies that exist in the registry', () => {
    const known = new Set(Object.keys(technologies));

    for (const project of projects) {
      for (const id of project.stack) {
        expect(known.has(id)).toBe(true);
      }
    }

    for (const constellation of constellations) {
      for (const id of constellation.skills) {
        expect(known.has(id)).toBe(true);
      }
    }
  });
});

describe('schema guards', () => {
  it('rejects a period that ends before it starts', () => {
    expect(periodSchema.safeParse({ start: '2025-06', end: '2025-01' }).success).toBe(false);
    expect(periodSchema.safeParse({ start: '2025-01', end: '2025-06' }).success).toBe(true);
    expect(periodSchema.safeParse({ start: '2025-01', end: null }).success).toBe(true);
  });

  it('rejects a malformed month', () => {
    expect(periodSchema.safeParse({ start: '2025-13', end: null }).success).toBe(false);
    expect(periodSchema.safeParse({ start: '2025-1', end: null }).success).toBe(false);
    expect(periodSchema.safeParse({ start: 'soon', end: null }).success).toBe(false);
  });

  it('rejects a slug that is not lowercase and hyphen-separated', () => {
    expect(slugSchema.safeParse('valid-slug-2').success).toBe(true);
    expect(slugSchema.safeParse('Not Valid').success).toBe(false);
    expect(slugSchema.safeParse('trailing-').success).toBe(false);
    expect(slugSchema.safeParse('').success).toBe(false);
  });

  it('refuses to let a private project expose a repository link', () => {
    const base = {
      id: 'example',
      name: 'Example',
      description: { es: 'a', en: 'a' },
      year: 2025,
      status: 'production' as const,
      stack: ['typescript' as const],
    };

    expect(
      projectSchema.safeParse({
        ...base,
        visibility: 'private',
        links: { repository: 'https://github.com/example/private' },
      }).success,
    ).toBe(false);

    expect(projectSchema.safeParse({ ...base, visibility: 'private', links: {} }).success).toBe(
      true,
    );

    expect(
      projectSchema.safeParse({
        ...base,
        visibility: 'public',
        links: { repository: 'https://github.com/example/public' },
      }).success,
    ).toBe(true);
  });
});
