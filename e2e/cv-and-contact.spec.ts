import { test, expect } from './fixtures/test';
import { type Page } from '@playwright/test';
import { contacts, cv } from '@/data/personal';
import { waitForFinalLayout } from './fixtures/helpers';

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

  // The section offers one way in: open the PDF. Every device can open one,
  // and every PDF viewer has its own save button, whereas a separate Download
  // button behaved differently from browser to browser (iPhone Chrome ignored
  // it). Both controls are checked as links and by tapping them, in the
  // desktop and the mobile project alike.
  const openControls = ['Open CV', 'First page of my CV'];

  for (const name of openControls) {
    test(`"${name}" links to the CV in a new tab, with no download attribute`, async ({ page }) => {
      const link = cvSection(page).getByRole('link', { name, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', cv.file);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(link).not.toHaveAttribute('download');
    });

    test(`tapping "${name}" opens the CV in a new tab instead of downloading it`, async ({ page }) => {
      const downloads: string[] = [];
      page.on('download', (d) => downloads.push(d.suggestedFilename()));
      page.context().on('page', (tab) => tab.on('download', (d) => downloads.push(d.suggestedFilename())));

      await waitForFinalLayout(page);
      const newTab = page.waitForEvent('popup');
      await cvSection(page).getByRole('link', { name, exact: true }).click();
      const tab = await newTab;

      // A link that downloads instead closes its new tab before it ever shows
      // the PDF's address, so this fails for a download as well as a wrong URL.
      await expect(tab).toHaveURL(new RegExp(`${cv.file.replace(/\./g, '\\.')}$`));
      await tab.waitForLoadState('load');
      expect(tab.isClosed()).toBe(false);
      expect(downloads).toEqual([]);
    });
  }

  test('shows only the preview and the Open CV button: no Download button, no blurb', async ({ page }) => {
    await expect(cvSection(page).getByRole('link')).toHaveCount(2);
    await expect(cvSection(page).getByRole('link', { name: /download/i })).toHaveCount(0);
    await expect(cvSection(page).getByText(/detailed overview of my education/)).toHaveCount(0);
  });

  test('the CV the button opens exists and is served to be displayed, not as an attachment', async ({ page, request }) => {
    const href = await cvSection(page).getByRole('link', { name: 'Open CV', exact: true }).getAttribute('href');
    const response = await request.get(href!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');
    expect(response.headers()['content-disposition'] ?? '').not.toContain('attachment');
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
