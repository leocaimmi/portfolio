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
      es: 'Técnico Universitario en Programación recibido de la Universidad Tecnológica Nacional de Mar del Plata (UTN FRMDP). Actualmente trabajo como Full Stack Developer.',
      en: 'University Technician in Programming, graduated from Universidad Tecnológica Nacional de Mar del Plata (UTN FRMDP). I currently work as a Full Stack Developer.',
    },
    {
      es: 'En DESSA Tech desarrollo aplicaciones multiplataforma web y mobile con Expo, FastAPI y Supabase, con integraciones a la API de ARCA para facturación electrónica, un bot de WhatsApp directo con Meta y automatizaciones de cobros con Mercado Pago Checkout Pro.',
      en: 'At DESSA Tech I build cross-platform web and mobile applications with Expo, FastAPI and Supabase, with integrations to the ARCA API for electronic invoicing, a WhatsApp bot straight through Meta, and payment automation with Mercado Pago Checkout Pro.',
    },
    {
      es: 'En paralelo soy Ayudante de Cátedra en la UTN, actualmente en Arquitectura y Sistemas Operativos. Entre 2025 y 2026 pasé por el resto de las materias de la carrera, acompañando a los estudiantes en la resolución de problemas y en lo que hiciera falta.',
      en: 'Alongside that I am a Teaching Assistant at UTN, currently on Computer Architecture and Operating Systems. Across 2025 and 2026 I worked through the rest of the courses on the programme, helping students reason problems out and with whatever else they needed.',
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
