import type { Constellation } from './schemas';

/**
 * Technical skills, grouped by what they are.
 *
 * No level is attached to any of them. Every wording of that scale — advanced,
 * daily, comfortable — ends up being a claim about the person making it, and
 * nobody grades their own; the timeline says where each of these was actually
 * used, which is the evidence a reader can weigh for themselves.
 *
 * Order inside a group is the only signal here, and it is deliberate: it runs
 * from what the group is really built on down to what is merely known.
 */
export const constellations: Constellation[] = [
  {
    id: 'languages',
    name: {
      es: 'Lenguajes',
      en: 'Languages',
    },
    description: {
      es: 'Lo que efectivamente se escribe. Todo lo demás son herramientas alrededor de estos.',
      en: 'What the code is actually written in. Everything else is tooling around these.',
    },
    skills: ['java', 'typescript', 'python', 'javascript', 'c'],
  },
  {
    id: 'backend',
    name: {
      es: 'Backend',
      en: 'Backend',
    },
    description: {
      es: 'Donde vive la lógica del negocio: servicios, contratos y las reglas que sostienen el producto.',
      en: 'Where the business logic lives: services, contracts and the rules that hold the product together.',
    },
    skills: ['fastapi', 'rest-api', 'spring-boot', 'design-patterns', 'uml'],
  },
  {
    id: 'frontend',
    name: {
      es: 'Frontend',
      en: 'Frontend',
    },
    description: {
      es: 'La superficie que la gente toca: web, móvil y escritorio, desde una única base de código cuando se puede.',
      en: 'The surface people touch: web, mobile and desktop, from a single codebase wherever possible.',
    },
    skills: ['react', 'expo', 'html', 'css', 'nextjs', 'astro', 'tauri', 'react-native', 'angular'],
  },
  {
    id: 'databases',
    name: {
      es: 'Bases de datos',
      en: 'Databases',
    },
    description: {
      es: 'El esquema es la primera decisión de arquitectura. Modelado relacional y autorización resuelta en el motor.',
      en: 'The schema is the first architectural decision. Relational modelling with authorisation resolved in the engine.',
    },
    skills: ['sql', 'postgresql', 'mysql', 'sqlite', 'data-modeling', 'row-level-security'],
  },
  {
    id: 'tools',
    name: {
      es: 'Herramientas',
      en: 'Tooling',
    },
    description: {
      es: 'Todo lo que rodea al código: plataformas, despliegue, documentación de contratos y forma de trabajo.',
      en: 'Everything around the code: platforms, deployment, contract documentation and ways of working.',
    },
    skills: [
      'git',
      'github',
      'supabase',
      'firebase',
      'vercel',
      'railway',
      'docker',
      'postman',
      'swagger',
      'claude-code',
      'codex',
      'jira',
      'kanban',
      'scrum',
    ],
  },
];
