# Cosmos Portfolio

The personal site of **Leonardo Caimmi**, Full Stack Developer — a star chart you can
navigate, in Spanish and English.

[![CI](https://github.com/leocaimmi/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/leocaimmi/portfolio/actions/workflows/ci.yml)
[![CodeQL](https://github.com/leocaimmi/portfolio/actions/workflows/codeql.yml/badge.svg)](https://github.com/leocaimmi/portfolio/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-22d3ee)](LICENSE)

---

## What this is

A single-page portfolio where the navigation is the subject matter. The hero renders a
star with planets in orbit, each trailing behind it as the whole system falls towards a
black hole at the right-hand edge; every planet is a section of the site. Scroll and
click reach the same places, and a docked chart tracks where you are as you read.

Two ideas hold the codebase together:

**Content is data, not markup.** Everything the page says lives in `src/content` as
typed objects validated by [Zod](https://zod.dev). Adding a project means editing one
object; no component is touched. Because the pages are statically generated, a malformed
entry fails `next build` with the offending path rather than reaching a visitor.

**Decoration is never load-bearing.** The canvas scenes are hidden from assistive
technology and carry nothing the document does not also state. Reveal animations play
from the visible state, so with JavaScript disabled the page reads identically — it
simply does not move. Everything collapses under `prefers-reduced-motion`.

## Stack

| Concern    | Choice                                                         |
| ---------- | -------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19, TypeScript in `strict` mode |
| Styling    | Tailwind CSS v4, CSS-first design tokens                       |
| i18n       | next-intl — Spanish at the root, English under `/en`           |
| Validation | Zod, for content, environment and the contact endpoint         |
| Graphics   | Canvas 2D and inline SVG. No animation or 3D library           |
| Testing    | Vitest, Testing Library                                        |
| Hosting    | Vercel                                                         |

There is no runtime UI dependency beyond React: the scenes, the glass material and the
scroll behaviour are all first-party. That keeps the bundle small and the dependency
surface — the part a security advisory lands in — deliberately narrow.

## Getting started

Requires Node 22 (see [`.nvmrc`](.nvmrc)).

```bash
git clone https://github.com/leocaimmi/portfolio.git
cd portfolio
npm ci
cp .env.example .env.local
npm run dev
```

The site runs at <http://localhost:3000>. Only `NEXT_PUBLIC_SITE_URL` is required; without
mail credentials the contact section falls back to direct links rather than rendering a
form that cannot deliver.

### Environment

| Variable               | Required | Purpose                                                |
| ---------------------- | -------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Yes      | Absolute origin. Canonical URLs, sitemap, social cards |
| `RESEND_API_KEY`       | No       | Enables contact form delivery                          |
| `CONTACT_INBOX`        | No       | Address that receives messages                         |
| `CONTACT_SENDER`       | No       | Verified sender on your Resend domain                  |

Every variable is parsed at startup. A malformed value fails the build instead of
surfacing as a 500 later, and server secrets sit behind a `server-only` import so an
accidental client import breaks the build rather than shipping credentials to the browser.

## Scripts

| Command                 | What it does                            |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Development server                      |
| `npm run build`         | Production build                        |
| `npm start`             | Serve the production build              |
| `npm run typecheck`     | `tsc --noEmit`                          |
| `npm run lint`          | ESLint, with type-aware rules           |
| `npm run lint:fix`      | ESLint with autofix                     |
| `npm run format`        | Prettier, write                         |
| `npm run format:check`  | Prettier, check only — the gate CI runs |
| `npm test`              | Vitest, once                            |
| `npm run test:watch`    | Vitest, watching                        |
| `npm run test:coverage` | Vitest with a coverage report           |

Commits run ESLint and Prettier over the staged files and are checked against
[Conventional Commits](https://www.conventionalcommits.org).

## Structure

```
src/
├── app/              Routes: locale segment, contact endpoint, sitemap, robots, cards
├── components/
│   ├── cosmos/       Canvas and SVG scenes — the star system, the sonar chart
│   ├── layout/       Header, footer, wordmark, language switcher
│   ├── sections/     One file per section of the page
│   └── ui/           Shared primitives: panel, section frame, tags, reveal
├── config/           The section registry, which is also the navigation
├── content/          Everything the site says, as validated data
├── hooks/            Viewport entry, active section, motion preference
├── i18n/             Locale routing, request configuration, navigation helpers
├── lib/              Environment, SEO, security headers, rate limiting, formatters
└── styles/           Design tokens, glass material, typography
```

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the pieces fit together, and
[`docs/CONTENT.md`](docs/CONTENT.md) to change what the site says without touching a
component.

## Accessibility

Not an afterthought, and not a claim without a mechanism behind it:

- Every landmark is labelled, and the three navigations (header, star map, docked chart)
  are labelled distinctly rather than repeating one name.
- The docked chart is `inert` while hidden, so it never appears twice in the tab order.
- Canvas scenes are `aria-hidden`; their planets are real anchors with real accessible
  names, repositioned each frame.
- Status is never conveyed by colour alone — `aria-current`, text labels and the skill
  legend all state it outright.
- A skip link is the first focusable element, and one visible focus treatment covers
  every interactive element.
- Form errors are wired through `aria-invalid` and `aria-describedby`, with the submit
  outcome announced in a live region.

## Security

- A Content Security Policy and hardened headers on every response, including assets.
  The one relaxation — `'unsafe-inline'` for scripts — is documented at the point it is
  made, along with what it costs and why the alternative costs more. See
  [`src/lib/security-headers.ts`](src/lib/security-headers.ts).
- The contact endpoint layers its checks cheapest first and answers every failure with a
  bare status code: it never says which check rejected the request, and never echoes the
  submission back.
- Spam is handled without a third-party captcha — a honeypot, a minimum fill time and a
  rate limit — so no visitor data leaves for an external service.
- Delivery failures log a status code only. A contact message is personal data and does
  not belong in a log line.
- Fonts and icons are self-hosted. There is no external origin to allow.

To report a vulnerability, see [`SECURITY.md`](SECURITY.md).

## Deployment

Built for Vercel. Import the repository, set `NEXT_PUBLIC_SITE_URL` to the production
origin, and add the Resend variables if you want the contact form live. Both locales are
prerendered at build time; only the contact endpoint is dynamic.

## Credits

- The black hole **is** [Diego Inácio's SVG Gargantua](https://github.com/diegoinacio/creative-coding-notebooks)
  (MIT), not a lookalike. `scripts/build-gargantua.py` generates `public/gargantua.svg`
  from his notebook, trimmed for the wire and with its animations converted from SMIL to
  CSS so a media query can stop them.
- The Java mark is vendored from [skill-icons](https://github.com/tandpfun/skill-icons) (MIT);
  the rest come from [Simple Icons](https://simpleicons.org) (CC0).
- Brand marks belong to their respective owners and are used only to identify the
  technology they name.

## License

[MIT](LICENSE) © Leonardo Caimmi.

The code is free to reuse. The content of `src/content` and `messages/` is a personal
biography — please write your own.
