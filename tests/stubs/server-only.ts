/**
 * Stub for the `server-only` package.
 *
 * That package exists to make a build fail when server code is imported from a
 * client bundle, and it does so by resolving to a module that throws. The test
 * runner is neither, so importing a server module there would trip a guard
 * aimed at a problem the runner does not have.
 *
 * The guard still holds where it matters: `next build` resolves the real
 * package and would reject the same import.
 */
export {};
