import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

/**
 * Typefaces are self-hosted by next/font: the files are downloaded at build
 * time and served from our own origin. That removes a third-party request from
 * the critical path, avoids leaking visitor IPs to a font CDN, and keeps the
 * Content Security Policy free of external font sources.
 */

/** Display face. Geometric, slightly technical — headings and the wordmark. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

/** Body face. Optimised for long-form reading at small sizes. */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/** Monospace face. Telemetry labels, dates and technology tags. */
export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const fontVariables = [spaceGrotesk.variable, inter.variable, jetBrainsMono.variable].join(
  ' ',
);
