import type { Profile } from './schemas';

/**
 * Identity and contact details.
 *
 * This is the only place the author's personal data is declared; every section
 * and every piece of metadata reads from here.
 */
export const profile: Profile = {
  name: 'Leonardo Caimmi',

  role: {
    es: 'Desarrollador Full Stack',
    en: 'Full Stack Developer',
  },

  headline: {
    es: 'Construyo el backend que sostiene productos en producción: APIs REST, modelos de datos y las integraciones que nadie ve pero de las que todo depende.',
    en: 'I build the backend that keeps products running: REST APIs, data models, and the integrations nobody sees but everything depends on.',
  },

  biography: [
    {
      es: 'Técnico Universitario en Programación por la UTN FRMDP y desarrollador Full Stack con foco en backend. Diseño APIs REST, modelo bases de datos PostgreSQL y acompaño los productos desde el esquema hasta producción.',
      en: 'University Technician in Programming from UTN FRMDP and a Full Stack developer focused on the backend. I design REST APIs, model PostgreSQL databases, and take products from schema to production.',
    },
    {
      es: 'En DESSA Tech desarrollo aplicaciones móviles con Expo sobre APIs en FastAPI y Supabase, donde implementé Row Level Security, policies y triggers, integré servicios de inteligencia artificial y construí la integración con los Web Services de facturación electrónica de ARCA.',
      en: 'At DESSA Tech I build cross-platform mobile apps with Expo on top of FastAPI and Supabase, where I implemented Row Level Security, policies and triggers, integrated AI services, and built the integration with ARCA electronic invoicing web services.',
    },
    {
      es: 'En paralelo soy Ayudante de Cátedra en la UTN, donde acompaño Programación III con Spring Boot, Programación I en C, Bases de Datos y Patrones de Diseño. Explicar arquitectura todas las semanas es lo que más me hizo crecer como desarrollador.',
      en: 'Alongside that I am a Teaching Assistant at UTN, covering Programming III with Spring Boot, Programming I in C, Databases and Design Patterns. Explaining architecture every week is what pushed my own engineering the furthest.',
    },
  ],

  location: {
    es: 'Mar del Plata, Argentina',
    en: 'Mar del Plata, Argentina',
  },

  email: 'leonardocaimmi1@gmail.com',

  socials: [
    {
      platform: 'github',
      handle: 'leocaimmi',
      url: 'https://github.com/leocaimmi',
    },
    {
      platform: 'linkedin',
      handle: 'leonardo-caimmi',
      url: 'https://www.linkedin.com/in/leonardo-caimmi',
    },
    {
      platform: 'email',
      handle: 'leonardocaimmi1@gmail.com',
      url: 'mailto:leonardocaimmi1@gmail.com',
    },
  ],

  availability: 'open',
};
