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
 */
export const projects: Project[] = [
  {
    id: 'dessa-tech',
    name: 'DESSA Tech',
    description: {
      es: 'Producto multiplataforma en web y móvil, sobre APIs propias y una base PostgreSQL gobernada por políticas de seguridad. Integra la facturación electrónica de ARCA de punta a punta.',
      en: 'A cross-platform product on web and mobile, over in-house APIs and a PostgreSQL database governed by security policies. ARCA electronic invoicing is integrated end to end.',
    },
    year: 2025,
    status: 'production',
    visibility: 'private',
    stack: [
      'python',
      'fastapi',
      'typescript',
      'expo',
      'react-native',
      'postgresql',
      'supabase',
      'row-level-security',
      'arca',
      'openai-api',
    ],
    links: {},
  },
  {
    id: 'utn-point-of-sale',
    name: 'UTN Point of Sale',
    description: {
      es: 'Sistema de punto de venta en uso diario en la cafetería de la UTN FRMDP: venta, stock y cobro con pagos digitales integrados. La restricción de diseño fue el mostrador.',
      en: 'A point-of-sale system in daily use at the UTN FRMDP coffee shop: sales, stock and payment with digital checkout built in. The design constraint was the counter itself.',
    },
    year: 2025,
    status: 'production',
    visibility: 'private',
    stack: ['typescript', 'react', 'postgresql', 'supabase', 'mercado-pago', 'rest-api'],
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
