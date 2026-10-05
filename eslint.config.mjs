import nextConfig from 'eslint-config-next/core-web-vitals';
import typescriptConfig from 'eslint-config-next/typescript';

/**
 * ESLint, invoked directly rather than through `next lint` — Next 16 removed
 * that wrapper. `core-web-vitals` brings the base Next rules; the TypeScript
 * config adds typescript-eslint's recommended set and the build-output ignores.
 */
const config = [
  ...nextConfig,
  ...typescriptConfig,
  {
    ignores: ['worker/**', '.next-e2e/**', 'coverage-e2e/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    // Playwright fixtures hand the test their value through a callback named
    // `use`, which the hooks rule mistakes for React's `use`.
    files: ['e2e/**'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  {
    rules: {
      // A leading underscore marks a parameter the signature requires but the
      // implementation deliberately does not use.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default config;
