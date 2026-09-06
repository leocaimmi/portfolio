import type { Constellation } from './schemas';

/**
 * Technical skills, grouped into constellations.
 *
 * `magnitude` follows the astronomical convention where a lower number is a
 * brighter star, and the interface reads it out in plain words:
 *
 *   1 — advanced: daily, production-grade work
 *   2 — intermediate: used regularly and comfortably
 *   3 — basic: working familiarity
 *
 * The scale is intentionally coarse. Finer gradations would suggest a
 * precision that no self-assessment actually has.
 */
export const constellations: Constellation[] = [
  {
    id: 'backend',
    name: {
      es: 'Núcleo',
      en: 'Core',
    },
    description: {
      es: 'Donde vive la lógica del negocio. APIs REST, servicios y las reglas que sostienen el producto.',
      en: 'Where the business logic lives. REST APIs, services, and the rules that hold the product together.',
    },
    skills: [
      { technology: 'java', magnitude: 1 },
      { technology: 'spring-boot', magnitude: 1 },
      { technology: 'python', magnitude: 1 },
      { technology: 'fastapi', magnitude: 1 },
      { technology: 'rest-api', magnitude: 1 },
      { technology: 'design-patterns', magnitude: 2 },
      { technology: 'c', magnitude: 2 },
    ],
  },
  {
    id: 'data',
    name: {
      es: 'Datos',
      en: 'Data',
    },
    description: {
      es: 'El esquema es la primera decisión de arquitectura. Modelado relacional y autorización resuelta en el motor.',
      en: 'The schema is the first architectural decision. Relational modelling with authorisation resolved in the engine.',
    },
    skills: [
      { technology: 'postgresql', magnitude: 1 },
      { technology: 'sql', magnitude: 1 },
      { technology: 'data-modeling', magnitude: 1 },
      { technology: 'supabase', magnitude: 1 },
      { technology: 'row-level-security', magnitude: 1 },
      { technology: 'mysql', magnitude: 2 },
      { technology: 'sqlite', magnitude: 3 },
    ],
  },
  {
    id: 'interface',
    name: {
      es: 'Interfaz',
      en: 'Interface',
    },
    description: {
      es: 'La superficie que la gente realmente toca, en web y en móvil, desde una única base de código cuando se puede.',
      en: 'The surface people actually touch, on web and mobile, from a single codebase wherever possible.',
    },
    skills: [
      { technology: 'typescript', magnitude: 1 },
      { technology: 'javascript', magnitude: 1 },
      { technology: 'react', magnitude: 1 },
      { technology: 'expo', magnitude: 1 },
      { technology: 'react-native', magnitude: 2 },
      { technology: 'nextjs', magnitude: 2 },
      { technology: 'angular', magnitude: 2 },
      { technology: 'tailwindcss', magnitude: 2 },
    ],
  },
  {
    id: 'operations',
    name: {
      es: 'Órbita',
      en: 'Orbit',
    },
    description: {
      es: 'Todo lo que rodea al código: control de versiones, despliegue, documentación de contratos y forma de trabajo.',
      en: 'Everything orbiting the code: version control, deployment, contract documentation and ways of working.',
    },
    skills: [
      { technology: 'git', magnitude: 1 },
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
