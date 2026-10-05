import type { NextConfig } from 'next';

// `npm run test:e2e` builds with E2E_COVERAGE=1: browser source maps on, into a
// separate directory, so V8 coverage can be mapped back to our own files. The
// build that deploys never sets it, so its maps are not published.
const e2eCoverage = process.env.E2E_COVERAGE === '1';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: e2eCoverage,
  distDir: e2eCoverage ? '.next-e2e' : '.next',
  // Surfacing type errors at build time is the point of using TypeScript here:
  // a deploy that silently ships a type error would defeat it.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
