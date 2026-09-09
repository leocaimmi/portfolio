'use client';

import { useSyncExternalStore } from 'react';

/** The year cannot change while a page is open, so there is nothing to watch. */
const subscribe = () => () => undefined;

const currentYear = () => new Date().getFullYear();

/**
 * The current year, read from the reader's own clock.
 *
 * Every page here is prerendered, so a year taken from the clock on the server
 * is the year of the last deployment — correct until the first of January and
 * wrong from then until someone happens to redeploy. The build's year is what
 * ships in the HTML, which keeps the server and client markup identical through
 * hydration, and the browser's answer takes over immediately afterwards.
 */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(subscribe, currentYear, () => buildYear);

  return <>{year}</>;
}
