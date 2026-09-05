/**
 * Staged-file gate. Runs before every commit via the Husky `pre-commit` hook.
 *
 * ESLint is invoked with `--max-warnings=0` so warnings cannot silently
 * accumulate, and `--no-warn-ignored` keeps ignored files from failing the run.
 */

/** @type {import('lint-staged').Configuration} */
const config = {
  '*.{js,mjs,cjs,ts,tsx}': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  '*.{json,md,css,yml,yaml}': ['prettier --write'],
};

export default config;
