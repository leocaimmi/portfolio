import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // See tests/stubs/server-only.ts for why this is redirected.
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        // next-intl's ESM build imports `next/navigation` without an extension,
        // which Node's resolver refuses outside a bundler. Inlining it hands the
        // import to Vite, which resolves it the way Next.js does.
        inline: ['next-intl'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // The interesting logic is the content contract, the endpoint's guards
      // and the formatters. Rendering is covered by the end-to-end pass.
      include: ['src/content/**', 'src/lib/**', 'src/components/ui/**'],
    },
  },
});
