# Changing what the site says

Everything the page states lives in `src/content` as typed data. Nothing here requires
touching a component, and nothing here can be got wrong quietly: the schemas run during
`next build`, so a mistake fails the build with the path to the offending field.

Run `npm run typecheck && npm test && npm run build` after editing. All three will tell
you what is wrong before anyone else sees it.

## Where things live

| File                  | What it holds                                     |
| --------------------- | ------------------------------------------------- |
| `profile.ts`          | Name, role, headline, biography, contact channels |
| `experience.ts`       | Career timeline                                   |
| `projects.ts`         | Project case studies                              |
| `skills.ts`           | Technical skills, grouped into constellations     |
| `education.ts`        | Degrees and courses                               |
| `technologies.ts`     | The registry every stack entry refers to          |
| `technology-icons.ts` | Brand marks, keyed by technology                  |
| `schemas.ts`          | The rules all of the above must satisfy           |

Section headings, button labels and form copy are **not** here — they are interface
chrome and live in `messages/es.json` and `messages/en.json`.

## The rules

**Every string is bilingual.** Localised fields take both languages:

```ts
tagline: {
  es: 'Sistema de punto de venta en uso diario.',
  en: 'Point-of-sale system in daily use.',
},
```

**Dates are `YYYY-MM`.** Day precision is noise on a career timeline. A `null` end means
the entry is ongoing; the interface renders "present" in the reader's language, so that
word never appears in the data.

```ts
period: { start: '2025-10', end: null },
```

An end month earlier than its start is rejected.

**Ids are lowercase and hyphen-separated**, and unique within their file. They become DOM
anchors and React keys, so a collision is fatal rather than cosmetic.

**Stacks reference the registry.** `stack: ['java', 'spring-boot']` — a key that does not
exist in `technologies.ts` is a type error.

## Adding a project

Append to the array in `projects.ts`. Order is authorial: the first entry leads the
section.

```ts
{
  id: 'my-project',
  name: 'My Project',
  tagline: { es: '…', en: '…' },       // one line, shown under the title
  description: { es: '…', en: '…' },   // the paragraph
  contribution: { es: '…', en: '…' },  // what you personally owned
  year: 2026,
  status: 'production',                 // 'production' | 'development' | 'archived'
  visibility: 'private',                // 'public' | 'private'
  featured: false,
  stack: ['typescript', 'postgresql'],
  highlights: [{ es: '…', en: '…' }],
  links: {},                            // { repository?, live? }
}
```

`visibility: 'private'` is for client work in a closed repository. The interface says so
outright, so the absence of a source link reads as a constraint rather than an oversight —
and the schema **refuses** a private project that carries a `links.repository`, so the two
can never contradict each other.

## Adding a technology

Add it to the registry first:

```ts
// technologies.ts
rust: { name: 'Rust', category: 'language' },
```

Then, optionally, its brand mark:

```ts
// technology-icons.ts
import { siRust } from 'simple-icons';

rust: { path: siRust.path },
```

Icons are optional by design. Anything without one falls back to a monogram, so the
interface never shows a gap where a logo should be. If a mark is missing from
[Simple Icons](https://simpleicons.org) — usually for trademark reasons — vendor the path
with an attributing comment, as `java` does.

## Skill magnitudes

Borrowed from stellar magnitude, where a **lower number is a brighter star**:

| Magnitude | Meaning                        |
| --------- | ------------------------------ |
| `1`       | Daily, production-grade work   |
| `2`       | Used regularly and comfortably |
| `3`       | Working familiarity            |

The scale is coarse on purpose. Finer gradations would suggest a precision no
self-assessment actually has.

## Adding a section

This one does touch code, but only four places:

1. Add the id to `SECTION_IDS` in `src/config/navigation.ts`.
2. Add its label to `nav` in both message files — `typecheck` fails until you do.
3. Create the component in `src/components/sections/`, wrapped in the shared `Section`.
4. Render it in `src/app/[locale]/page.tsx`.

The star map, the docked chart and the header menu all read `SECTION_IDS`, so they pick it
up without further changes.

## Things that will fail the build

- A localised field missing one language
- A period whose end precedes its start, or a month outside `01`–`12`
- Two entries sharing an id
- A stack entry that is not in the technology registry
- A private project with a repository link
- An id that is not a lowercase hyphenated slug

Each fails with the path to the field, for example `✖ Duplicate id "arca-invoicing" → at
[3].id`.
