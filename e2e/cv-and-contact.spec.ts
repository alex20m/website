import { test, expect, type Page } from '@playwright/test';
import { contacts, cv } from '@/data/personal';

const cvSection = (page: Page) => page.locator('#cv');
const contactSection = (page: Page) => page.locator('#contact');

test.describe('CV section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await cvSection(page).scrollIntoViewIfNeeded();
  });

  test('shows the CV heading and blurb', async ({ page }) => {
    await expect(cvSection(page).getByRole('heading', { level: 2, name: 'CV', exact: true })).toBeVisible();
    await expect(cvSection(page).getByText(/detailed overview of my education/)).toBeVisible();
  });

  test('the Download CV button links to the CV file for download', async ({ page }) => {
    const button = cvSection(page).getByRole('link', { name: 'Download CV' });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', cv.file);
    await expect(button).toHaveAttribute('download', cv.filename);
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
