/**
 * Conventional Commits ruleset.
 *
 * `scope-enum` mirrors the top-level folders under `src/` plus the
 * cross-cutting concerns, so history stays greppable as the site grows.
 */

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [1, 'always', 100],
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'app',
        'ci',
        'config',
        'content',
        'cosmos',
        'deps',
        'git',
        'hooks',
        'i18n',
        'layout',
        'lib',
        'lint',
        'sections',
        'security',
        'seo',
        'styles',
        'ui',
      ],
    ],
  },
};

export default config;
