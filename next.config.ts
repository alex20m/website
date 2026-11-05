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
  // The CV preview route renders the PDF with pdf.js on a native canvas.
  // Bundling pdf.js breaks its own module loading at build time, so Node loads
  // these from node_modules as they are.
  serverExternalPackages: ['pdf-to-img', 'pdfjs-dist', '@napi-rs/canvas'],
  // The CV's download URL (`cv.downloadUrl`, the PDF with `?download=1`) is
  // sent as an attachment. The `download` attribute alone is a hint some
  // browsers drop for a PDF they can display — iPhone Chrome showed activity
  // and saved nothing — whereas an attachment is a download everywhere. The
  // plain URL keeps the default so "View in browser" still opens it.
  async headers() {
    return [
      {
        source: '/Alex_Mecklin_CV.pdf',
        has: [{ type: 'query', key: 'download' }],
        headers: [{ key: 'Content-Disposition', value: 'attachment; filename="Alex_Mecklin_CV.pdf"' }],
      },
    ];
  },
};

export default nextConfig;
