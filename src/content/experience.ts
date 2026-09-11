import type { Experience } from './schemas';

/**
 * Career timeline, newest first.
 *
 * A `null` end month means the role is ongoing; the UI renders it as "present"
 * in the active locale rather than storing that word in the data.
 */
export const experience: Experience[] = [
  {
    id: 'dessa-tech',
    organization: 'DESSA Tech',
    role: {
      es: 'Desarrollador Full Stack',
      en: 'Full Stack Developer',
    },
    kind: 'employment',
    period: { start: '2025-10', end: null },
    location: {
      es: 'Argentina · Remoto',
      en: 'Argentina · Remote',
    },
    summary: {
      es: 'Desarrollo de producto end to end: aplicaciones multiplataforma web y mobile.',
      en: 'End-to-end product work: cross-platform web and mobile applications.',
    },
    achievements: [
      {
        es: 'Desarrollo multiplataforma con Expo, centralizando el código web y mobile para sostener su mantenimiento en el tiempo.',
        en: 'Cross-platform development with Expo, centralising the web and mobile code so it stays maintainable over time.',
      },
      {
        es: 'Diseño e implementación de APIs REST con FastAPI, con contratos documentados y seguridad por JWT.',
        en: 'Designed and implemented REST APIs with FastAPI, with documented contracts and JWT-based security.',
      },
      {
        es: 'Modelado de bases de datos PostgreSQL e implementación de Row Level Security, policies y triggers en Supabase.',
        en: 'Modelled PostgreSQL databases and implemented Row Level Security, policies and triggers in Supabase.',
      },
      {
        es: 'Integración con los Web Services de Facturación Electrónica de ARCA (WSAA y WSFE) para la emisión y validación de comprobantes fiscales.',
        en: 'Integrated the ARCA electronic invoicing web services (WSAA and WSFE) to issue and validate fiscal receipts.',
      },
      {
        es: 'Integración de cobros con la API de Mercado Pago Checkout Pro dentro del circuito de venta.',
        en: 'Integrated payments through the Mercado Pago Checkout Pro API inside the sales flow.',
      },
      {
        es: 'Bot de WhatsApp construido sobre la API de Meta, como canal del producto.',
        en: 'Built a WhatsApp bot on Meta’s API, as a channel of the product.',
      },
      {
        es: 'Landing institucional del producto construida con Astro.',
        en: 'Built the product’s marketing site with Astro.',
      },
      {
        es: 'Integración de servicios de inteligencia artificial dentro del producto.',
        en: 'Integrated AI services into the product.',
      },
    ],
    stack: [
      'python',
      'fastapi',
      'typescript',
      'expo',
      'react-native',
      'astro',
      'postgresql',
      'supabase',
      'openai-api',
      'row-level-security',
      'arca',
      'mercado-pago',
      'whatsapp-api',
    ],
  },
  {
    id: 'utn-teaching-assistant',
    organization: 'Universidad Tecnológica Nacional de Mar del Plata',
    role: {
      es: 'Ayudante de Cátedra',
      en: 'Teaching Assistant',
    },
    kind: 'teaching',
    period: { start: '2025-03', end: null },
    location: {
      es: 'Mar del Plata, Argentina · Presencial',
      en: 'Mar del Plata, Argentina · On-site',
    },
    summary: {
      es: 'Acompañamiento a estudiantes en seis materias que cubren desde punteros en C hasta arquitectura de aplicaciones con Spring Boot.',
      en: 'Supporting students across six courses spanning everything from pointers in C to application architecture with Spring Boot.',
    },
    achievements: [
      {
        es: 'Programación III: arquitectura de aplicaciones y APIs REST con Spring Boot.',
        en: 'Programming III: application architecture and REST APIs with Spring Boot.',
      },
      {
        es: 'Programación I: fundamentos, memoria y punteros en C.',
        en: 'Programming I: fundamentals, memory and pointers in C.',
      },
      {
        es: 'Bases de Datos I y II: modelado relacional, normalización y SQL sobre MySQL.',
        en: 'Databases I and II: relational modelling, normalisation and SQL on MySQL.',
      },
      {
        es: 'Metodologías en Sistemas II: patrones de diseño aplicados a problemas reales.',
        en: 'Systems Methodologies II: design patterns applied to real problems.',
      },
      {
        es: 'Arquitectura y Sistemas Operativos: fundamentos de sistemas y concurrencia.',
        en: 'Computer Architecture and Operating Systems: systems fundamentals and concurrency.',
      },
    ],
    stack: ['java', 'spring-boot', 'c', 'mysql', 'sql', 'design-patterns', 'uml', 'data-modeling'],
  },
  {
    id: 'freelance',
    organization: 'Freelance',
    role: {
      es: 'Desarrollador Full Stack Freelance',
      en: 'Freelance Full Stack Developer',
    },
    kind: 'freelance',
    period: { start: '2024-06', end: null },
    location: {
      es: 'Mar del Plata, Argentina',
      en: 'Mar del Plata, Argentina',
    },
    summary: {
      es: 'Sistemas a medida que resuelven un problema concreto: puntos de venta como el POS, automatizaciones y gestores contables. Software que se usa todos los días y no puede fallar en el mostrador.',
      en: 'Custom systems built to solve a concrete problem: points of sale such as the POS, automations and accounting tools. Software used every single day that cannot fail at the counter.',
    },
    achievements: [
      {
        es: 'Sistema de punto de venta en producción en el buffet de la UTN FRMDP, operando a diario sobre caja, stock y comprobantes.',
        en: 'Point-of-sale system running in production at the UTN FRMDP buffet, handling checkout, stock and receipts every day.',
      },
      {
        es: 'Integración de pagos con Mercado Pago Checkout Pro, incluyendo el manejo de webhooks y la conciliación de estados de pago.',
        en: 'Payment integration with Mercado Pago Checkout Pro, including webhook handling and payment state reconciliation.',
      },
      {
        es: 'Relevamiento directo con el cliente y despliegue de las entregas sin interrumpir la operación del comercio.',
        en: 'Gathered requirements directly with the client and shipped releases without interrupting day-to-day trading.',
      },
    ],
    stack: [
      'typescript',
      'react',
      'tauri',
      'rust',
      'angular',
      'java',
      'spring-boot',
      'postgresql',
      'supabase',
      'mercado-pago',
      'rest-api',
    ],
  },
];
