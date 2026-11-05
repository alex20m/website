import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cv } from '@/data/personal';
import { renderCvPreview } from '@/lib/cvPreview';
import { GET } from '@/app/cv-preview.png/route';

const cvPdfPath = path.join(process.cwd(), 'public', cv.file);

/** Width and height from a PNG's IHDR chunk, which always starts at byte 16. */
function pngSize(png: Uint8Array) {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/**
 * A valid one-page PDF with the CV's A4 page size and nothing drawn on it, so a
 * render of the real CV can be told apart from a render of an empty page.
 */
function blankA4Pdf(): Buffer {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.276 841.89] >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, 'latin1');
}

describe('CV preview image', () => {
  it('renders the first page of the CV as a PNG at the size the page lays it out at', async () => {
    const png = await renderCvPreview(await readFile(cvPdfPath));

    expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
    expect(pngSize(png)).toEqual({ width: cv.preview.width, height: cv.preview.height });
  });

  it('draws what is on the page rather than an empty sheet', async () => {
    const real = await renderCvPreview(await readFile(cvPdfPath));
    const blank = await renderCvPreview(blankA4Pdf());

    // Same page size, so only the content can make them differ.
    expect(pngSize(blank)).toEqual(pngSize(real));
    expect(Buffer.compare(real, blank)).not.toBe(0);
  });

  it(`serves ${cv.preview.src} as a PNG of the PDF the site links to, so a new CV gets a new preview`, async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    const served = Buffer.from(await response.arrayBuffer());
    const expected = await renderCvPreview(await readFile(cvPdfPath));
    expect(Buffer.compare(served, expected)).toBe(0);
  });
});
