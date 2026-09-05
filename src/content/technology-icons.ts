import {
  siAngular,
  siC,
  siClaude,
  siDocker,
  siExpo,
  siFastapi,
  siFirebase,
  siGit,
  siJavascript,
  siJira,
  siMercadopago,
  siMiro,
  siMysql,
  siNextdotjs,
  siOpenjdk,
  siPostgresql,
  siPostman,
  siPython,
  siRailway,
  siReact,
  siSpringboot,
  siSqlite,
  siSupabase,
  siSwagger,
  siTailwindcss,
  siTypescript,
  siVercel,
} from 'simple-icons';

import type { TechnologyId } from './technologies';

/**
 * Brand marks for the technology registry.
 *
 * Only the SVG path is stored, not the whole icon object, and every icon is
 * imported by name so the bundler can drop the other three thousand.
 *
 * The map is deliberately partial. Practices such as "REST APIs" have no logo,
 * and a few brands are absent from the icon set for trademark reasons — Java
 * is represented by the OpenJDK mark, which is the implementation actually
 * used. Anything without an entry falls back to a monogram, so the interface
 * never renders a gap where an icon should be.
 *
 * Brand marks belong to their respective owners and are used here only to
 * identify the technology they name.
 */
export const TECHNOLOGY_ICON_PATHS: Partial<Record<TechnologyId, string>> = {
  java: siOpenjdk.path,
  typescript: siTypescript.path,
  javascript: siJavascript.path,
  python: siPython.path,
  c: siC.path,

  'spring-boot': siSpringboot.path,
  fastapi: siFastapi.path,
  react: siReact.path,
  'react-native': siReact.path,
  angular: siAngular.path,
  nextjs: siNextdotjs.path,
  expo: siExpo.path,
  tailwindcss: siTailwindcss.path,

  postgresql: siPostgresql.path,
  mysql: siMysql.path,
  sqlite: siSqlite.path,

  supabase: siSupabase.path,
  firebase: siFirebase.path,
  vercel: siVercel.path,
  railway: siRailway.path,
  'mercado-pago': siMercadopago.path,

  git: siGit.path,
  docker: siDocker.path,
  postman: siPostman.path,
  swagger: siSwagger.path,
  jira: siJira.path,
  miro: siMiro.path,
  'claude-code': siClaude.path,
};
