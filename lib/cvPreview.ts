import { pdf } from 'pdf-to-img';

/** Pixel width of the preview: about 2× the largest size the page shows it at, so it stays sharp on high-DPI screens. */
export const PREVIEW_WIDTH = 900;

/** Renders page 1 of a PDF at the given scale (1 = one pixel per PDF point). */
async function renderFirstPage(pdfBytes: Uint8Array, scale: number): Promise<Buffer> {
  // pdf.js detaches the bytes it is handed, so give it a copy and leave the
  // caller's buffer usable for the next pass.
  const doc = await pdf(new Uint8Array(pdfBytes), { scale });
  try {
    return await doc.getPage(1);
  } finally {
    await doc.destroy();
  }
}

/**
 * Renders the first page of a PDF to a PNG PREVIEW_WIDTH pixels wide, keeping
 * the page's aspect ratio.
 *
 * Server-only: pdf.js and its native canvas run at build time, never in the
 * browser.
 */
export async function renderCvPreview(pdfBytes: Uint8Array): Promise<Buffer> {
  // pdf-to-img only takes a scale, so measure the page at scale 1 first (a
  // PNG's width sits at byte 16 of its IHDR chunk) to know which scale lands
  // on PREVIEW_WIDTH.
  const atScale1 = await renderFirstPage(pdfBytes, 1);
  const pageWidth = atScale1.readUInt32BE(16);
  // The canvas truncates fractional sizes, so aim a hair past the target width.
  return renderFirstPage(pdfBytes, (PREVIEW_WIDTH + 0.5) / pageWidth);
}
