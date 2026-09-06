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

  credential: {
    es: 'Técnico Universitario en Programación',
    en: 'University Technician in Programming',
  },

  headline: {
    es: 'Construyo productos de punta a punta, pensados para escalar: la interfaz que la gente toca, las APIs que la sostienen y el modelo de datos sobre el que todo se apoya.',
    en: 'I build products end to end, built to scale: the interface people touch, the APIs that hold it up, and the data model everything else rests on.',
  },

  biography: [
    {
      es: 'Técnico Universitario en Programación por la UTN FRMDP. Actualmente trabajo como Full Stack Developer: diseño APIs REST, modelo bases de datos PostgreSQL y acompaño los productos de punta a punta, del esquema a producción.',
      en: 'University Technician in Programming from UTN FRMDP. I currently work as a Full Stack Developer: I design REST APIs, model PostgreSQL databases and take products end to end, from the schema through to production.',
    },
    {
      es: 'En DESSA Tech desarrollo aplicaciones multiplataforma web y móviles con Expo sobre APIs en FastAPI y Supabase, donde implementé Row Level Security, policies y triggers, integré los cobros con la API de Mercado Pago Checkout Pro y construí la integración con los Web Services de facturación electrónica de ARCA.',
      en: 'At DESSA Tech I build cross-platform web and mobile apps with Expo on top of FastAPI and Supabase, where I implemented Row Level Security, policies and triggers, integrated payments through the Mercado Pago Checkout Pro API, and built the integration with the ARCA electronic invoicing web services.',
    },
    {
      es: 'En paralelo soy Ayudante de Cátedra en la UTN: atiendo consultas, explico el punto que trabó a alguien y llevo el registro de asistencia y notas en Programación III con Spring Boot, Programación I en C, Bases de Datos y Patrones de Diseño. Responder la misma duda de tres maneras distintas es lo que más me hizo crecer como desarrollador.',
      en: 'Alongside that I am a Teaching Assistant at UTN: I take questions, explain whatever has someone stuck, and keep the attendance and marks for Programming III with Spring Boot, Programming I in C, Databases and Design Patterns. Answering the same question three different ways is what pushed my own engineering the furthest.',
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
