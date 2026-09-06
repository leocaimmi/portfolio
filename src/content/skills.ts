import type { Constellation } from './schemas';

/**
 * Technical skills, grouped by what they are.
 *
 * `magnitude` follows the astronomical convention where a lower number is a
 * brighter star, and the interface reads it out in plain words:
 *
 *   1 — daily: in production, most days
 *   2 — regular: reached for often and comfortably
 *   3 — basic: working familiarity
 *
 * It is a measure of use rather than of mastery. How often something is picked
 * up is a claim the work either supports or does not; how well it is known is a
 * claim about the person making it, and nobody grades their own.
 *
 * Order within a group is deliberate, not alphabetical: it runs from what the
 * group is really built on down to what is merely known.
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
    skills: [
      { technology: 'java', magnitude: 1 },
      { technology: 'typescript', magnitude: 1 },
      { technology: 'python', magnitude: 1 },
      { technology: 'javascript', magnitude: 2 },
      { technology: 'c', magnitude: 2 },
    ],
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
    skills: [
      { technology: 'fastapi', magnitude: 1 },
      { technology: 'rest-api', magnitude: 1 },
      { technology: 'spring-boot', magnitude: 2 },
      { technology: 'design-patterns', magnitude: 2 },
      { technology: 'uml', magnitude: 2 },
    ],
  },
  {
    id: 'frontend',
    name: {
      es: 'Frontend',
      en: 'Frontend',
    },
    description: {
      es: 'La superficie que la gente toca, en web y en móvil, desde una única base de código cuando se puede.',
      en: 'The surface people touch, on web and mobile, from a single codebase wherever possible.',
    },
    skills: [
      { technology: 'react', magnitude: 1 },
      { technology: 'expo', magnitude: 1 },
      { technology: 'html', magnitude: 1 },
      { technology: 'css', magnitude: 2 },
      { technology: 'react-native', magnitude: 2 },
      { technology: 'nextjs', magnitude: 2 },
      { technology: 'angular', magnitude: 2 },
    ],
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
    skills: [
      { technology: 'sql', magnitude: 1 },
      { technology: 'postgresql', magnitude: 1 },
      { technology: 'mysql', magnitude: 2 },
      { technology: 'sqlite', magnitude: 3 },
      { technology: 'data-modeling', magnitude: 1 },
      { technology: 'row-level-security', magnitude: 1 },
    ],
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
      { technology: 'git', magnitude: 1 },
      { technology: 'supabase', magnitude: 1 },
      { technology: 'postman', magnitude: 1 },
      { technology: 'claude-code', magnitude: 1 },
      { technology: 'docker', magnitude: 2 },
      { technology: 'swagger', magnitude: 2 },
      { technology: 'vercel', magnitude: 2 },
      { technology: 'railway', magnitude: 2 },
      { technology: 'scrum', magnitude: 2 },
      { technology: 'kanban', magnitude: 2 },
      { technology: 'jira', magnitude: 2 },
      { technology: 'firebase', magnitude: 3 },
    ],
  },
];
