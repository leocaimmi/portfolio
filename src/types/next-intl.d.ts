import type { routing } from '@/i18n/routing';

import type messages from '../../messages/es.json';

/**
 * Augments next-intl with the project's locales and message shape so that
 * translation keys are checked at compile time and a typo fails `typecheck`
 * rather than rendering a raw key in production.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
