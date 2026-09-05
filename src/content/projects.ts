import type { Project } from './schemas';

/**
 * Project catalogue.
 *
 * Order here is authorial, not visual: the projects section derives orbital
 * placement from `featured` and from each entry's index, so reordering this
 * array is enough to restage the whole system.
 *
 * Client work lives in closed repositories. Those entries are marked
 * `visibility: 'private'`, which the UI surfaces explicitly instead of leaving
 * a missing source link to look like an oversight.
 */
export const projects: Project[] = [
  {
    id: 'arca-invoicing',
    name: 'ARCA Electronic Invoicing',
    tagline: {
      es: 'Emisión y validación de comprobantes fiscales contra los Web Services de ARCA.',
      en: 'Issuing and validating fiscal receipts against the ARCA web services.',
    },
    description: {
      es: 'Integración con los Web Services de Facturación Electrónica del organismo fiscal argentino. Resuelve la autenticación por ticket firmado (WSAA) y la emisión de comprobantes (WSFE), dos servicios SOAP con reglas estrictas donde un campo mal formado se traduce en un comprobante rechazado.',
      en: 'Integration with the Argentine tax authority electronic invoicing web services. It handles signed-ticket authentication (WSAA) and receipt issuing (WSFE), two SOAP services with strict rules where a single malformed field means a rejected receipt.',
    },
    contribution: {
      es: 'Diseñé e implementé la integración completa, desde la firma del ticket de acceso hasta la validación de los comprobantes emitidos.',
      en: 'Designed and implemented the whole integration, from signing the access ticket through to validating issued receipts.',
    },
    year: 2025,
    status: 'production',
    visibility: 'private',
    featured: true,
    stack: ['python', 'fastapi', 'postgresql', 'arca', 'rest-api'],
    highlights: [
      {
        es: 'Autenticación WSAA con firma criptográfica del ticket de acceso y renovación automática antes del vencimiento.',
        en: 'WSAA authentication with a cryptographically signed access ticket and automatic renewal before expiry.',
      },
      {
        es: 'Emisión de comprobantes por WSFE con validación previa de los datos fiscales, para fallar antes de llegar al organismo.',
        en: 'Receipt issuing through WSFE with fiscal data validated up front, so failures happen before reaching the tax authority.',
      },
      {
        es: 'Trazabilidad de cada comprobante emitido, con el número de autorización almacenado junto a la operación que lo originó.',
        en: 'Traceability for every issued receipt, storing the authorisation number alongside the operation that produced it.',
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
    id: 'dessa-mobile-platform',
    name: 'DESSA Mobile Platform',
    tagline: {
      es: 'Aplicación móvil multiplataforma sobre una API propia y una base gobernada por políticas.',
      en: 'Cross-platform mobile application on an in-house API and a policy-governed database.',
    },
    description: {
      es: 'Plataforma móvil construida con Expo sobre APIs en FastAPI y una base PostgreSQL en Supabase. Las reglas de acceso viven en el motor mediante Row Level Security, policies y triggers, de modo que ningún cliente puede leer datos que no le corresponden aunque intente hacerlo.',
      en: 'A mobile platform built with Expo on top of FastAPI services and a PostgreSQL database on Supabase. Access rules live in the engine through Row Level Security, policies and triggers, so no client can read data it does not own, even if it tries.',
    },
    contribution: {
      es: 'Desarrollo de la aplicación móvil, diseño de las APIs y modelado de la base de datos junto a sus políticas de seguridad.',
      en: 'Built the mobile application, designed the APIs, and modelled the database together with its security policies.',
    },
    year: 2025,
    status: 'production',
    visibility: 'private',
    featured: false,
    stack: [
      'typescript',
      'expo',
      'react-native',
      'python',
      'fastapi',
      'postgresql',
      'supabase',
      'row-level-security',
      'openai-api',
    ],
    highlights: [
      {
        es: 'Una sola base de código Expo para iOS y Android, con la lógica de dominio compartida entre ambas plataformas.',
        en: 'A single Expo codebase for iOS and Android, with domain logic shared across both platforms.',
      },
      {
        es: 'Row Level Security, policies y triggers en Supabase: la autorización se resuelve en la base y no en el cliente.',
        en: 'Row Level Security, policies and triggers in Supabase: authorisation is resolved in the database, not in the client.',
      },
      {
        es: 'Integración de servicios de inteligencia artificial dentro de los flujos del producto.',
        en: 'AI services integrated into the product flows.',
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
        es: 'Content Security Policy estricta por nonce, cabeceras de seguridad y validación de variables de entorno.',
        en: 'A strict nonce-based Content Security Policy, hardened headers and validated environment variables.',
      },
    ],
    links: {
      repository: 'https://github.com/leocaimmi/portfolio',
    },
  },
];
