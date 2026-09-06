# Architecture

How the pieces fit together, and why they are arranged this way. For changing what the
site _says_, see [CONTENT.md](CONTENT.md).

## The shape of it

```
Request
  └─ middleware.ts ......... resolves the locale, skips assets and metadata images
       └─ app/[locale]/layout.tsx
            ├─ backdrop, star field, docked chart  (decoration, aria-hidden)
            ├─ header + footer                      (chrome)
            └─ page.tsx
                 └─ six sections, each reading from src/content
```

Both locales are prerendered at build time. The only dynamic route is
`POST /api/contact`.

## Layers

### Content — `src/content`

The site's single source of truth. Plain TypeScript objects, one file per kind of
entity, with a Zod schema per kind in `schemas.ts`.

`index.ts` is the only entry point. It parses every file at module load, so importing
content anywhere in the app runs the validation. Because pages are statically generated,
that validation happens during `next build`: a duplicate id or a private project carrying
a repository link fails the build with the offending path, rather than shipping.

Technologies live in a keyed registry (`technologies.ts`). Entities refer to them by key,
so a typo in a project's stack is a compile error rather than an unknown tag rendered at
runtime.

Localised text is `Record<Locale, string>`. Adding a locale to `routing` widens that type
and breaks the schema assignment until every field is translated — deliberately, so a new
language cannot ship with holes in it.

### Configuration — `src/config/navigation.ts`

`SECTION_IDS` is the page's table of contents and doubles as three things: the DOM anchor
for each section, the `nav.*` translation key, and the scroll-spy target. Adding a section
without translating its label fails `typecheck`.

The star system, the docked chart and the header menu all read from this tuple, which is
why they can never disagree about what the sections are.

### Presentation — `src/components`

- **`ui/`** — the shared vocabulary: the section frame, the glass panel, technology tags,
  the reveal wrapper. Sections compose these rather than restating the same layout.
- **`sections/`** — one file per section. Each reads content, renders it, and owns no
  state beyond what its own interaction needs.
- **`cosmos/`** — the scenes. `cosmic-scene.tsx` owns the hero's render loop;
  `draw-scene.ts` holds the painting routines as pure functions of a context and some
  numbers; `scene-geometry.ts` holds the orbital maths, shared with the docked chart so
  the two always agree about where a section sits.
- **`layout/`** — header, footer, wordmark, language switcher.

### Platform — `src/lib`

Environment parsing, SEO assembly, security headers, the rate limiter, formatters. Server
modules import `server-only`, which turns an accidental client import into a build error
instead of a leaked secret.

## Decisions worth knowing about

### Static rendering over a nonce-based CSP

A nonce has to be minted per request, which means reading request headers during render,
which opts every page out of static generation. For pages that are pure content that is
the worse trade, so `script-src` allows `'unsafe-inline'` and the reasoning sits in
`security-headers.ts` next to the value. The site renders no user-supplied content
anywhere, which is what bounds the cost. If it ever does, that is the first decision to
revisit.

### Canvas for the scenes, DOM for the interaction

The hero paints planets and trails on a canvas, but the things you click are ordinary
anchors repositioned each frame. What a visitor aims at is therefore a real link with a
real accessible name, and only the decoration lives in a bitmap.

Trails are kept as points and stroked as one gradient path per planet, rather than
accumulated as pixels: two draw calls a planet instead of several hundred, crisp at any
resolution, and the history can simply be dropped when the scene stops being visible.

### One place decides whether the scene animates

`isInViewport && !document.hidden && !prefersReducedMotion`, evaluated in a single
function that every observer calls. Splitting that decision across the callbacks that
observe each input is how the first version ended up frozen after a single frame — the
initial render ran while the reduced-motion store still held its server snapshot, and
nothing owned the job of starting the loop afterwards.

### The black hole is generated, not written

`public/gargantua.svg` comes from Diego Inácio's notebook by way of
`scripts/build-gargantua.py`. Two attempts to reproduce it on canvas got closer each time
and were never going to arrive: the effect is `feTurbulence` and per-channel colour
matrices composited in `screen`, and canvas has no answer to either.

The generator is committed so the asset stays reproducible rather than a blob to be taken
on trust. It downloads the upstream notebook on demand and is never called by
`npm run build`, so a network failure cannot break a deploy. It cuts revolutions per
strand to 35% — the path data is almost all of the weight — and rewrites the SMIL
animations as CSS, because no media query can stop SMIL and the file has to hold still
under reduced motion.

### Reveals animate from the visible state

Content renders in its final state and the reveal only replays an entrance when the
element scrolls into view. A missing IntersectionObserver, a failed hydration or disabled
JavaScript therefore costs the animation and never the content.

### Kepler, not a linear ramp

Orbital periods follow `T = T₀ · (a / a₀)^1.5`. A linear ramp made every planet look like
it was keeping pace with its neighbours; under the real law the inner bodies race and the
outer ones barely move, which is what makes the system read as a system.

## What is deliberately absent

- **No animation library.** IntersectionObserver plus CSS covers the reveals; the scenes
  are canvas. A dependency here would buy nothing and cost bundle size and audit surface.
- **No CSS framework beyond Tailwind.** The glass material is about forty lines of CSS.
- **No Lighthouse budget in CI.** On a canvas-heavy page in a shared container the numbers
  swing enough to fail honest work, and a flaky gate teaches people to rerun until it
  passes.
- **No end-to-end suite yet.** The unit tests cover the content contract, the endpoint
  guards and the formatters — the parts where a regression would be silent. Rendering is
  currently verified by hand; a Playwright smoke test is the obvious next addition.

## Extending it

**A new section** — add its id to `SECTION_IDS`, translate the label in both message
files, create the component in `sections/`, render it in `page.tsx`. The star map, the
docked chart and the header menu pick it up on their own.

**A new locale** — add it to `routing.locales`, create `messages/<locale>.json`, and widen
`localizedTextSchema`. TypeScript will point at every piece of content still missing a
translation.

**A shared store for the rate limiter** — `createRateLimiter` is deliberately small and
in-process. On a multi-instance deployment the effective limit scales with the number of
warm instances, which is the right trade for a contact form and the wrong one for
anything that matters. Swapping in Redis means replacing one function.
