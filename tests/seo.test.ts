import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

// The public origin is read when the module loads, and outside development it
// is required, so it has to exist before the import below is evaluated.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
});

import { profile } from '@/content';
import { buildSiteJsonLd, searchPreview } from '@/lib/seo';

type Node = Record<string, unknown> & { '@type': string; '@id': string };

function graph(locale: 'es' | 'en'): Node[] {
  return (JSON.parse(buildSiteJsonLd(locale)) as { '@graph': Node[] })['@graph'];
}

function node(nodes: Node[], type: string): Node {
  const found = nodes.find((candidate) => candidate['@type'] === type);
  if (!found) throw new Error(`No ${type} node in the graph.`);
  return found;
}

describe('site structured data', () => {
  it('declares the site name for the home page, slash included', () => {
    const website = node(graph('es'), 'WebSite');

    expect(website.url).toBe('https://example.com/');
    expect(website.name).toBe(profile.name);
  });

  it('offers the shorter name as an alternate, never the preferred one again', () => {
    const website = node(graph('es'), 'WebSite');

    expect(website.alternateName).toEqual([profile.shortName]);
    expect(website.alternateName).not.toContain(profile.name);
  });

  it('names the search preview as the picture of the page in each language', () => {
    for (const [locale, url] of [
      ['es', 'https://example.com/'],
      ['en', 'https://example.com/en'],
    ] as const) {
      const nodes = graph(locale);
      const page = node(nodes, 'WebPage');
      const image = node(nodes, 'ImageObject');

      expect(page.url).toBe(url);
      expect(page.primaryImageOfPage).toEqual({ '@id': image['@id'] });
      expect(image.url).toBe(`https://example.com${searchPreview.path}`);
    }
  });

  it('points at a preview that is actually shipped', () => {
    const file = join(process.cwd(), 'public', searchPreview.path);

    expect(existsSync(file)).toBe(true);
  });

  it('resolves every reference to a node in the same graph', () => {
    const nodes = graph('es');
    const ids = new Set(nodes.map((candidate) => candidate['@id']));
    const references = nodes.flatMap((candidate) =>
      Object.values(candidate).filter(
        (value): value is { '@id': string } =>
          typeof value === 'object' && value !== null && '@id' in value,
      ),
    );

    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) expect(ids).toContain(reference['@id']);
  });
});
