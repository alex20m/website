import { test, expect } from './fixtures/test';
import { type Page } from '@playwright/test';
import { contacts, cv } from '@/data/personal';

const cvSection = (page: Page) => page.locator('#cv');
const contactSection = (page: Page) => page.locator('#contact');

test.describe('CV section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await cvSection(page).scrollIntoViewIfNeeded();
  });

  test('shows the CV heading and a loaded preview of the CV\'s first page', async ({ page }) => {
    await expect(cvSection(page).getByRole('heading', { level: 2, name: 'CV', exact: true })).toBeVisible();
    const preview = cvSection(page).getByRole('img', { name: 'First page of my CV' });
    await expect(preview).toBeVisible();
    await expect(preview).toHaveAttribute('src', cv.preview.src);
    // naturalWidth is 0 for a broken image, so this proves the PNG really loaded.
    await expect.poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(cv.preview.width);
  });

  test('the preview image is served as a PNG', async ({ request }) => {
    const response = await request.get(cv.preview.src);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/png');
  });

  test('clicking the preview opens the PDF in a new tab', async ({ page }) => {
    const link = cvSection(page).getByRole('link', { name: 'First page of my CV' });
    await expect(link).toHaveAttribute('href', cv.file);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('the View in browser button opens the PDF in a new tab instead of downloading it', async ({ page }) => {
    const button = cvSection(page).getByRole('link', { name: 'View in browser' });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', cv.file);
    await expect(button).toHaveAttribute('target', '_blank');
    await expect(button).toHaveAttribute('rel', /noopener/);
    await expect(button).not.toHaveAttribute('download');
  });

  test('shows only the preview and the two buttons, with no upload-style blurb', async ({ page }) => {
    await expect(cvSection(page).getByRole('link')).toHaveCount(3);
    await expect(cvSection(page).getByText(/detailed overview of my education/)).toHaveCount(0);
  });

  test('the Download CV button links to the CV\'s download URL for download', async ({ page }) => {
    const button = cvSection(page).getByRole('link', { name: 'Download CV' });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', cv.downloadUrl);
    await expect(button).toHaveAttribute('download', cv.filename);
  });

  // iPhone Chrome ignores the `download` attribute on a PDF the server marks
  // as viewable: the tap shows activity but nothing lands in Downloads. A
  // response sent as an attachment is a download in every browser.
  test('the Download CV button\'s URL is served as a file attachment, so mobile browsers save it', async ({ page, request }) => {
    const href = await cvSection(page).getByRole('link', { name: 'Download CV' }).getAttribute('href');
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');
    expect(response.headers()['content-disposition']).toBe(`attachment; filename="${cv.filename}"`);
  });

  test('the View in browser button\'s URL is not served as an attachment, so it opens instead of downloading', async ({ page, request }) => {
    const href = await cvSection(page).getByRole('link', { name: 'View in browser' }).getAttribute('href');
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');
    expect(response.headers()['content-disposition'] ?? '').not.toContain('attachment');
  });

  test('the CV file the button links to actually exists and is a PDF', async ({ page, request }) => {
    const href = await cvSection(page).getByRole('link', { name: 'Download CV' }).getAttribute('href');
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');
  });
});

test.describe('Contact section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await contactSection(page).scrollIntoViewIfNeeded();
  });

  test('shows the Contact heading', async ({ page }) => {
    await expect(contactSection(page).getByRole('heading', { level: 2, name: 'Contact', exact: true })).toBeVisible();
  });

  for (const contact of contacts) {
    test(`shows a ${contact.label} card with its label and value`, async ({ page }) => {
      const link = contactSection(page).locator(`a[href="${contact.href}"]`);
      await expect(link).toBeVisible();
      await expect(link.getByText(contact.label, { exact: true })).toBeVisible();
      await expect(link.getByText(contact.value, { exact: true })).toBeVisible();
    });

    test(`the ${contact.label} card has the correct target/rel for its link type`, async ({ page }) => {
      const link = contactSection(page).locator(`a[href="${contact.href}"]`);
      if (contact.external) {
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener/);
        await expect(link).toHaveAttribute('rel', /noreferrer/);
      } else {
        await expect(link).not.toHaveAttribute('target', '_blank');
      }
    });
  }

  test('every contact method appears exactly once in this section', async ({ page }) => {
    for (const contact of contacts) {
      await expect(contactSection(page).locator(`a[href="${contact.href}"]`)).toHaveCount(1);
    }
  });
});
