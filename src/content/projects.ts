import type { Project } from './schemas';

/**
 * Project catalogue.
 *
 * Order here is authorial, not visual. Client work lives in closed
 * repositories; those entries are marked `visibility: 'private'`, which the UI
 * states outright instead of leaving a missing source link to look like an
 * oversight.
 *
 * Each entry is deliberately a card's worth of text. What the work involved
 * belongs in the timeline, where it is told once as a role with its outcomes,
 * rather than twice in two different shapes.
 *
 * For the same reason, what is built in a job is not catalogued here at all.
 * DESSA Tech's product had a card of its own, and it was the timeline's first
 * entry told again with the same thirteen technologies under it.
 */
export const projects: Project[] = [
  {
    id: 'utn-point-of-sale',
    name: 'POS',
    description: {
      es: 'Punto de venta en uso diario en el buffet de la UTN FRMDP: aplicación de escritorio con Tauri y React sobre el mostrador, y un tablero web para seguir la operación en tiempo real.',
      en: 'A point of sale in daily use at the UTN FRMDP buffet: a Tauri and React desktop application at the counter, and a web dashboard that follows the day in real time.',
    },
    year: 2026,
    status: 'production',
    visibility: 'private',
    stack: ['typescript', 'react', 'tauri', 'rust', 'postgresql', 'supabase', 'rest-api'],
    links: {},
  },
  {
    id: 'cosmos-portfolio',
    name: 'Cosmos Portfolio',
    description: {
      es: 'Este sitio. El contenido vive como datos validados en tiempo de build, los dos idiomas tienen rutas propias y cada respuesta sale con cabeceras de seguridad estrictas.',
      en: 'This very site. Content lives as data validated at build time, both languages have routes of their own, and every response ships with hardened security headers.',
    },
    year: 2026,
    status: 'production',
    visibility: 'public',
    stack: ['typescript', 'nextjs', 'react', 'tailwindcss', 'vercel'],
    links: {
      repository: 'https://github.com/leocaimmi/portfolio',
    },
  },
];
