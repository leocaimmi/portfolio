# Contributing

This is a personal site, so it is unlikely to need outside features — but corrections,
accessibility findings and bug reports are welcome, and the setup below is also the
reference for future me.

## Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Node 22, per [`.nvmrc`](.nvmrc).

## Before opening a pull request

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

CI runs exactly these. Getting them green locally means CI will be green too.

## House rules

**Content goes in `src/content`, never into a component.** If you find yourself typing a
sentence inside JSX, it belongs in the content layer or in `messages/`. See
[docs/CONTENT.md](docs/CONTENT.md).

**Both languages, always.** Spanish and English. `typecheck` will catch a missing key,
but it cannot catch a placeholder — write the real sentence.

**Motion is optional.** Anything that animates must be neutralised by
`prefers-reduced-motion`, and content must never depend on an animation to become
visible.

**Keyboard first.** If it can be clicked, it must be reachable by Tab and operable by
Enter or Space, with a visible focus ring. State conveyed by colour must also be conveyed
some other way.

**Comment the _why_.** The code says what it does. A comment earns its place by
explaining a decision, a trade-off, or a trap that a reasonable person would otherwise
walk into.

## Commits

[Conventional Commits](https://www.conventionalcommits.org), in English. A commit-msg hook
enforces the format and the allowed scopes, which are listed in
[`commitlint.config.mjs`](commitlint.config.mjs).

```
feat(sections): add the skill constellations
fix(cosmos): tint stars by their assigned colour
docs: explain the content layer
```

Write the body for the person who runs `git blame` in a year. Say what changed and, more
importantly, why the alternative was worse.

Keep each commit to one idea. `git add` the specific paths rather than `git add -A` — a
commit takes the whole index, not just what you last staged, which is an easy way to
bundle unrelated work into a change that does not mention it.
