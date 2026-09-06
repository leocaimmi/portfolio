# Security policy

## Reporting a vulnerability

Please report privately rather than opening a public issue.

- **GitHub**: open a [private security advisory](https://github.com/leocaimmi/portfolio/security/advisories/new)
- **Email**: leonardocaimmi1@gmail.com

Include what you found, how to reproduce it, and what an attacker could do with it. You
will get an acknowledgement within a few days, and credit in the fix unless you would
rather not have it.

This is a personal site, not a product with a support contract — but a report will be
taken seriously and fixed.

## Scope

In scope: this repository and the deployed site.

Out of scope: findings against third-party services the site talks to (Vercel, Resend),
missing headers with no demonstrated impact, and automated scanner output without a
working proof of concept.

## What the site already does

- A Content Security Policy and hardened headers on every response, including assets
- HSTS in production, with `includeSubDomains` and `preload`
- Environment variables parsed at startup; a malformed value fails the build
- Server secrets behind a `server-only` import, so a client import breaks the build
- Contact endpoint: body size cap, rate limit, schema validation, honeypot and a minimum
  fill time — each failing with a bare status code that never says which check rejected
  the request
- No user-supplied content is rendered anywhere on the site
- Fonts and icons self-hosted; no external origin is allowed by the policy
- Dependabot weekly, CodeQL on every push and weekly, `npm audit` in CI

## Known trade-offs

These are deliberate, and documented where they are made rather than left to be found:

- **`script-src` allows `'unsafe-inline'`.** A nonce must be minted per request, which
  would opt every page out of static generation. The cost is bounded because the site
  renders no user-supplied content. See `src/lib/security-headers.ts`.
- **The rate limiter is in-process.** On a multi-instance deployment the effective limit
  scales with the number of warm instances. Acceptable for a contact form whose purpose is
  to blunt casual abuse; a shared store is the upgrade path. See `src/lib/rate-limit.ts`.
- **Forwarded headers are trusted for rate-limit bucketing only.** They are never used for
  authorisation, so a spoofed value costs the sender their own quota and nothing else.
