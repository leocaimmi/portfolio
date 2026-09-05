import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Locale-aware replacements for the Next.js navigation primitives. Always
 * import from here so links keep the active locale prefix automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
