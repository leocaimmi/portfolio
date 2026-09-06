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
      es: 'Graduado como Técnico Universitario en Programación en la Universidad Tecnológica Nacional de Mar del Plata. Trabajo como Full Stack Developer: diseño APIs REST y modelo las bases de datos que las sostienen.',
      en: 'Graduated as a University Technician in Programming at Universidad Tecnológica Nacional de Mar del Plata. I work as a Full Stack Developer: I design REST APIs and model the databases underneath them.',
    },
    {
      es: 'En DESSA Tech desarrollo aplicaciones multiplataforma web y móviles con Expo sobre APIs en FastAPI y Supabase, donde implementé Row Level Security, policies y triggers, integré los cobros con la API de Mercado Pago Checkout Pro y construí la integración con los Web Services de facturación electrónica de ARCA.',
      en: 'At DESSA Tech I build cross-platform web and mobile apps with Expo on top of FastAPI and Supabase, where I implemented Row Level Security, policies and triggers, integrated payments through the Mercado Pago Checkout Pro API, and built the integration with the ARCA electronic invoicing web services.',
    },
    {
      es: 'En paralelo soy Ayudante de Cátedra en la UTN, actualmente en Arquitectura y Sistemas Operativos. Entre 2025 y 2026 pasé por el resto de las materias de la carrera, acompañando a los estudiantes en la resolución de problemas y en lo que hiciera falta. Responder la misma duda de tres maneras distintas es lo que más me hizo crecer como desarrollador.',
      en: 'Alongside that I am a Teaching Assistant at UTN, currently on Computer Architecture and Operating Systems. Across 2025 and 2026 I worked through the rest of the courses on the programme, helping students reason problems out and with whatever else they needed. Answering the same question three different ways is what pushed my own engineering the furthest.',
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
