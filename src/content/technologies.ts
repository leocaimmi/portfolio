/**
 * Registry of every technology the portfolio can reference.
 *
 * Entities elsewhere refer to technologies by key rather than by free-form
 * string, so a typo in a project's stack fails `typecheck` instead of quietly
 * rendering an unknown tag. Adding a technology here is the only step needed
 * before it can be used anywhere in the content layer.
 */

export const TECHNOLOGY_CATEGORIES = [
  'language',
  'framework',
  'database',
  'platform',
  'tool',
  'practice',
] as const;

export type TechnologyCategory = (typeof TECHNOLOGY_CATEGORIES)[number];

interface TechnologyEntry {
  readonly name: string;
  readonly category: TechnologyCategory;
}

export const technologies = {
  // Languages
  java: { name: 'Java', category: 'language' },
  typescript: { name: 'TypeScript', category: 'language' },
  javascript: { name: 'JavaScript', category: 'language' },
  python: { name: 'Python', category: 'language' },
  c: { name: 'C', category: 'language' },
  sql: { name: 'SQL', category: 'language' },
  html: { name: 'HTML', category: 'language' },
  css: { name: 'CSS', category: 'language' },

  // Frameworks and runtimes
  'spring-boot': { name: 'Spring Boot', category: 'framework' },
  fastapi: { name: 'FastAPI', category: 'framework' },
  react: { name: 'React', category: 'framework' },
  angular: { name: 'Angular', category: 'framework' },
  nextjs: { name: 'Next.js', category: 'framework' },
  astro: { name: 'Astro', category: 'framework' },
  tauri: { name: 'Tauri', category: 'framework' },
  expo: { name: 'Expo', category: 'framework' },
  'react-native': { name: 'React Native', category: 'framework' },
  tailwindcss: { name: 'Tailwind CSS', category: 'framework' },

  // Databases
  postgresql: { name: 'PostgreSQL', category: 'database' },
  mysql: { name: 'MySQL', category: 'database' },
  sqlite: { name: 'SQLite', category: 'database' },

  // Platforms and services
  supabase: { name: 'Supabase', category: 'platform' },
  firebase: { name: 'Firebase', category: 'platform' },
  vercel: { name: 'Vercel', category: 'platform' },
  railway: { name: 'Railway', category: 'platform' },
  'mercado-pago': { name: 'Mercado Pago Checkout Pro', category: 'platform' },
  'whatsapp-api': { name: 'WhatsApp Business API', category: 'platform' },
  arca: { name: 'ARCA (AFIP)', category: 'platform' },
  'openai-api': { name: 'OpenAI API', category: 'platform' },

  // Tooling
  git: { name: 'Git', category: 'tool' },
  github: { name: 'GitHub', category: 'tool' },
  docker: { name: 'Docker', category: 'tool' },
  postman: { name: 'Postman', category: 'tool' },
  swagger: { name: 'Swagger', category: 'tool' },
  jira: { name: 'Jira', category: 'tool' },
  miro: { name: 'Miro', category: 'tool' },
  'claude-code': { name: 'Claude Code', category: 'tool' },
  codex: { name: 'Codex', category: 'tool' },

  // Engineering practices
  'rest-api': { name: 'REST APIs', category: 'practice' },
  'row-level-security': { name: 'Row Level Security', category: 'practice' },
  'design-patterns': { name: 'Design Patterns', category: 'practice' },
  uml: { name: 'UML', category: 'practice' },
  'data-modeling': { name: 'Data Modeling', category: 'practice' },
  scrum: { name: 'Scrum', category: 'practice' },
  kanban: { name: 'Kanban', category: 'practice' },
} as const satisfies Record<string, TechnologyEntry>;

export type TechnologyId = keyof typeof technologies;

export const TECHNOLOGY_IDS = Object.keys(technologies) as [TechnologyId, ...TechnologyId[]];

/** Resolves a technology key to its display name. */
export function technologyName(id: TechnologyId): string {
  return technologies[id].name;
}
