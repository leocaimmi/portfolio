import type { Project } from './schemas';

/**
 * Project catalogue.
 *
 * Order here is authorial, not visual. Client work lives in closed
 * repositories; those entries are marked `visibility: 'private'`, which the UI
 * states outright instead of leaving a missing source link to look like an
 * oversight.
 */
export const projects: Project[] = [
  {
    id: 'dessa-tech',
    name: 'DESSA Tech',
    tagline: {
      es: 'Plataforma multiplataforma web y móvil con facturación electrónica fiscal integrada de punta a punta.',
      en: 'Cross-platform web and mobile platform with end-to-end fiscal electronic invoicing built in.',
    },
    description: {
      es: 'El producto en el que trabajo a diario: una aplicación multiplataforma web y móvil con Expo sobre APIs en FastAPI y una base PostgreSQL en Supabase. El desafío central fue la facturación electrónica contra ARCA (ex AFIP): dos servicios SOAP con reglas fiscales estrictas, donde un campo mal formado significa un comprobante rechazado y una venta que no se puede cerrar.',
      en: 'The product I work on daily: a cross-platform web and mobile application built with Expo on top of FastAPI services and a PostgreSQL database on Supabase. The central challenge was electronic invoicing against ARCA, Argentina’s tax authority: two SOAP services with strict fiscal rules, where a single malformed field means a rejected receipt and a sale that cannot be closed.',
    },
    contribution: {
      es: 'Desarrollo de la aplicación en web y móvil, diseño de las APIs, modelado de la base con sus políticas de seguridad, y la integración completa con los Web Services de facturación electrónica de ARCA.',
      en: 'Built the application for web and mobile, designed the APIs, modelled the database together with its security policies, and delivered the complete integration with the ARCA electronic invoicing web services.',
    },
    year: 2025,
    status: 'production',
    visibility: 'private',
    featured: true,
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
    highlights: [
      {
        es: 'Facturación electrónica ARCA: autenticación WSAA con firma criptográfica del ticket de acceso y renovación automática antes del vencimiento.',
        en: 'ARCA electronic invoicing: WSAA authentication with a cryptographically signed access ticket, renewed automatically before it expires.',
      },
      {
        es: 'Emisión de comprobantes por WSFE con los datos fiscales validados antes de salir, para fallar en casa y no contra el organismo.',
        en: 'Receipt issuing through WSFE with fiscal data validated before it leaves, so failures happen at home rather than against the tax authority.',
      },
      {
        es: 'Trazabilidad de cada comprobante: el número de autorización queda guardado junto a la operación que lo originó.',
        en: 'Traceability for every receipt: the authorisation number is stored alongside the operation that produced it.',
      },
      {
        es: 'Row Level Security, policies y triggers en Supabase: la autorización se resuelve en el motor y no en el cliente.',
        en: 'Row Level Security, policies and triggers in Supabase: authorisation is resolved in the engine, not in the client.',
      },
      {
        es: 'Una sola base de código Expo para web, iOS y Android, con servicios de inteligencia artificial integrados en los flujos del producto.',
        en: 'A single Expo codebase for web, iOS and Android, with AI services integrated into the product flows.',
      },
    ],
    links: {},
  },
  {
    id: 'utn-point-of-sale',
    name: 'UTN Point of Sale',
    tagline: {
      es: 'Sistema de punto de venta en uso diario en la cafetería de la UTN FRMDP.',
      en: 'Point-of-sale system in daily use at the UTN FRMDP coffee shop.',
    },
    description: {
      es: 'Sistema de caja construido para un comercio real y operado todos los días por personas que no son técnicas. Cubre el circuito completo de venta, cobro y stock, con pagos digitales integrados. La restricción de diseño fue el mostrador: la operación no puede detenerse a esperar una pantalla.',
      en: 'A checkout system built for a real business and operated every day by non-technical staff. It covers the full sale, payment and stock cycle with digital payments integrated. The design constraint was the counter itself: service cannot stop to wait for a screen.',
    },
    contribution: {
      es: 'Desarrollo completo del sistema, relevamiento con el cliente y despliegue de cada entrega sin cortar la operación.',
      en: 'Built the system end to end, gathered requirements with the client, and shipped every release without interrupting trading.',
    },
    year: 2025,
    status: 'production',
    visibility: 'private',
    featured: true,
    stack: ['typescript', 'react', 'postgresql', 'supabase', 'mercado-pago', 'rest-api'],
    highlights: [
      {
        es: 'Circuito de venta pensado para el mostrador: pocas pantallas, teclado primero y estados visibles de un vistazo.',
        en: 'A counter-first sales flow: few screens, keyboard driven, with state readable at a glance.',
      },
      {
        es: 'Integración de pagos con Mercado Pago Checkout Pro, con webhooks y conciliación de estados de pago.',
        en: 'Payment integration with Mercado Pago Checkout Pro, including webhooks and payment state reconciliation.',
      },
      {
        es: 'Control de stock acoplado a la venta, de modo que la caja y el inventario nunca divergen.',
        en: 'Stock control coupled to the sale, so checkout and inventory never drift apart.',
      },
    ],
    links: {},
  },
  {
    id: 'cosmos-portfolio',
    name: 'Cosmos Portfolio',
    tagline: {
      es: 'Este sitio: contenido tipado, dos idiomas y una política de seguridad estricta.',
      en: 'This very site: typed content, two languages and a strict security policy.',
    },
    description: {
      es: 'Portfolio construido con Next.js y TypeScript en modo estricto. El contenido vive como datos validados con Zod en lugar de estar incrustado en los componentes, así que sumar un proyecto es editar un objeto y no tocar una sola línea de JSX.',
      en: 'A portfolio built with Next.js and TypeScript in strict mode. Content lives as Zod-validated data instead of being embedded in components, so adding a project means editing one object and touching no JSX at all.',
    },
    contribution: {
      es: 'Diseño, arquitectura e implementación completa, incluido el sistema de diseño y la infraestructura de calidad.',
      en: 'Design, architecture and full implementation, including the design system and the quality tooling.',
    },
    year: 2026,
    status: 'production',
    visibility: 'public',
    featured: false,
    stack: ['typescript', 'nextjs', 'react', 'tailwindcss', 'vercel'],
    highlights: [
      {
        es: 'Capa de contenido validada en tiempo de build: un dato mal formado rompe el build en lugar de llegar a producción.',
        en: 'A content layer validated at build time: malformed data breaks the build instead of reaching production.',
      },
      {
        es: 'Español e inglés con rutas propias y claves de traducción verificadas por el compilador.',
        en: 'Spanish and English on their own routes, with translation keys checked by the compiler.',
      },
      {
        es: 'Content Security Policy y cabeceras de seguridad en cada respuesta, con las variables de entorno validadas en tiempo de build.',
        en: 'A Content Security Policy and hardened headers on every response, with environment variables validated at build time.',
      },
    ],
    links: {
      repository: 'https://github.com/leocaimmi/portfolio',
    },
  },
];
