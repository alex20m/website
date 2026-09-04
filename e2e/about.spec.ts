import { test, expect } from '@playwright/test';
import { contacts, cv } from '@/data/personal';

const SKILLS = [
  'Agentic AI',
  'Cloud Technologies',
  'Software Development',
  'CI/CD',
  'Data Science',
  'Machine Learning',
  'Test Automation',
];

test.describe('About section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const about = (page: import('@playwright/test').Page) => page.locator('#about');

  test('shows a profile photo with the correct alt text', async ({ page }) => {
    const avatar = about(page).getByRole('img', { name: 'Alex Mecklin' });
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute('src', /profile\.png/);
  });

  test('shows the name and title', async ({ page }) => {
    await expect(about(page).getByRole('heading', { level: 2, name: 'Alex Mecklin' })).toBeVisible();
    await expect(
      about(page).getByRole('heading', { level: 5, name: 'M.Sc. Student · Aalto University' }),
    ).toBeVisible();
  });

  test('shows the bio paragraph', async ({ page }) => {
    await expect(about(page).getByText(/AI-focused developer/)).toBeVisible();
  });

  test('lists every skill chip', async ({ page }) => {
    for (const skill of SKILLS) {
      await expect(about(page).getByText(skill, { exact: true })).toBeVisible();
    }
  });

  test('the Download CV button links to the CV file', async ({ page }) => {
    const button = about(page).getByRole('link', { name: 'Download CV' });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', cv.file);
    await expect(button).toHaveAttribute('download', cv.filename);
  });

  for (const contact of contacts) {
    test(`the ${contact.label} icon links to ${contact.href}`, async ({ page }) => {
      const link = about(page).locator(`a[href="${contact.href}"]`);
      await expect(link).toBeVisible();
      if (contact.external) {
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener/);
        await expect(link).toHaveAttribute('rel', /noreferrer/);
      } else {
        await expect(link).not.toHaveAttribute('target', '_blank');
      }
    });

    test(`the ${contact.label} icon has an accessible name with its value`, async ({ page }) => {
      // MUI's Tooltip gives a string `title` as a permanent `aria-label` on
      // the trigger (not `aria-describedby`, and not conditioned on the
      // tooltip being open) — this is the icon-only button's only accessible
      // name, so it must be correct independent of hover/pointer support.
      const link = about(page).locator(`a[href="${contact.href}"]`);
      await expect(link).toHaveAttribute('aria-label', contact.value);
    });

    test(`the ${contact.label} icon shows its value in a floating tooltip on hover`, async ({ page }, testInfo) => {
      // Tooltips are hover-driven; skip on the mobile project where there is
      // no pointer to hover with.
      test.skip(testInfo.project.name === 'mobile', 'no hover on touch devices');

      const link = about(page).locator(`a[href="${contact.href}"]`);
      await link.hover();

      const tooltip = page.locator('.MuiTooltip-tooltip');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toHaveText(contact.value);
    });
  }
});
