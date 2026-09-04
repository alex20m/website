import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors the "@/*" path alias from tsconfig so tests import the same way
    // the app does.
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    // Node by default; only the component render test opts into jsdom (via
    // an `// @vitest-environment jsdom` pragma). jsdom's own `URL`
    // implementation shadows Node's globally, and it can't round-trip a
    // `file:` URL through Node's `fileURLToPath` — exactly what the pipeline
    // test's `import.meta.url` resolution needs, so a blanket jsdom
    // environment broke a test that never touches the DOM.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // e2e/** holds Playwright specs (run via `npm run test:e2e`, not vitest)
    // — Playwright's own test files also match vitest's default `*.spec.ts`
    // glob, so without this exclude `npm test` tries to execute them here
    // and fails immediately on `test.describe()` outside a Playwright runner.
    exclude: ['worker/**', 'node_modules/**', 'e2e/**'],
  },
});
