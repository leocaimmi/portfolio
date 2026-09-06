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
  siUml,
  siVercel,
} from 'simple-icons';

import type { TechnologyId } from './technologies';

export interface TechnologyIconGlyph {
  path: string;
  /** Defaults to the 24×24 grid every simple-icon is drawn on. */
  viewBox?: string;
}

/**
 * The Java mark, vendored from tandpfun/skill-icons (MIT, © 2022 tandpfun)
 * because the main icon set dropped it over trademark concerns.
 *
 * Both subpaths — the wordmark ripples and the steam — are concatenated into a
 * single definition so the whole glyph paints in one colour, and the original
 * 256-unit grid is kept rather than rescaling the coordinates by hand.
 *
 * The mark is a trademark of its owner and is used here only to identify the
 * language it names.
 */
const JAVA_GLYPH: TechnologyIconGlyph = {
  viewBox: '0 0 256 256',
  path: 'M101.634 182.619C101.634 182.619 93.9548 187.293 106.979 188.63C122.707 190.634 131.023 190.299 148.386 186.962C148.386 186.962 153.06 189.971 159.406 192.306C120.331 209.002 70.9089 191.304 101.634 182.619ZM96.6252 160.914C96.6252 160.914 88.2753 167.26 101.299 168.593C118.327 170.262 131.69 170.597 154.732 165.926C154.732 165.926 157.741 169.267 162.747 170.936C115.664 184.961 62.8975 172.269 96.6252 160.917V160.914ZM188.795 198.984C188.795 198.984 194.471 203.658 182.449 207.334C160.073 214.012 88.6104 216.019 68.5735 207.334C61.564 204.325 74.9197 199.982 79.2587 199.319C83.6012 198.317 85.9366 198.317 85.9366 198.317C78.2569 192.973 34.8424 209.337 63.8959 214.046C143.709 227.073 209.499 208.37 188.792 199.018L188.795 198.984ZM105.307 138.203C105.307 138.203 68.9052 146.888 92.2793 149.89C102.298 151.223 122 150.892 140.368 149.555C155.396 148.221 170.458 145.548 170.458 145.548C170.458 145.548 165.113 147.886 161.441 150.222C124.342 159.915 53.2107 155.573 73.5827 145.554C90.9526 137.204 105.307 138.203 105.307 138.203V138.203ZM170.423 174.604C207.83 155.234 190.46 136.534 178.438 138.873C175.429 139.54 174.096 140.207 174.096 140.207C174.096 140.207 175.097 138.203 177.436 137.54C201.145 129.19 219.849 162.586 169.757 175.61C169.757 175.61 170.092 175.275 170.423 174.608V174.604ZM108.979 227.364C145.046 229.703 200.147 226.03 201.484 208.995C201.484 208.995 198.817 215.673 171.764 220.683C141.042 226.359 102.968 225.692 80.5957 222.016C80.5957 222.016 85.2698 226.023 108.982 227.36L108.979 227.364ZM147.685 28C147.685 28 168.389 49.0388 127.983 80.7594C95.5891 106.472 120.632 121.168 127.983 137.861C108.948 120.833 95.2609 105.802 104.606 91.7762C118.331 71.0828 156.062 61.0644 147.685 28ZM137 123.842C146.683 134.862 134.333 144.881 134.333 144.881C134.333 144.881 159.044 132.195 147.692 116.494C137.338 101.466 129.324 94.1184 172.738 69.0689C172.738 69.0689 104.278 86.0968 137.007 123.835L137 123.842Z',
};

/**
 * Brand marks for the technology registry.
 *
 * Only the SVG path is stored, never the whole icon object, and every icon is
 * imported by name so the bundler can drop the other three thousand.
 *
 * The map is deliberately partial: practices such as "REST APIs" have no logo,
 * and anything without an entry falls back to a monogram, so the interface
 * never renders a gap where an icon should be.
 *
 * Brand marks belong to their respective owners and are used here only to
 * identify the technology they name.
 */
export const TECHNOLOGY_ICONS: Partial<Record<TechnologyId, TechnologyIconGlyph>> = {
  java: JAVA_GLYPH,
  typescript: { path: siTypescript.path },
  javascript: { path: siJavascript.path },
  python: { path: siPython.path },
  c: { path: siC.path },

  'spring-boot': { path: siSpringboot.path },
  fastapi: { path: siFastapi.path },
  react: { path: siReact.path },
  'react-native': { path: siReact.path },
  angular: { path: siAngular.path },
  nextjs: { path: siNextdotjs.path },
  expo: { path: siExpo.path },
  tailwindcss: { path: siTailwindcss.path },

  postgresql: { path: siPostgresql.path },
  mysql: { path: siMysql.path },
  sqlite: { path: siSqlite.path },

  supabase: { path: siSupabase.path },
  firebase: { path: siFirebase.path },
  vercel: { path: siVercel.path },
  railway: { path: siRailway.path },
  'mercado-pago': { path: siMercadopago.path },

  git: { path: siGit.path },
  docker: { path: siDocker.path },
  postman: { path: siPostman.path },
  swagger: { path: siSwagger.path },
  jira: { path: siJira.path },
  miro: { path: siMiro.path },
  'claude-code': { path: siClaude.path },
  uml: { path: siUml.path },
};
