import { test, expect } from './fixtures/test';
import { contacts, cv } from '@/data/personal';
import { DESKTOP, waitForFinalLayout } from './fixtures/helpers';

const SKILLS = [
  'Agentic AI',
  'Cloud Technologies',
  'Full Stack Development',
  'DevOps',
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
      about(page).getByRole('heading', { level: 5, name: 'AI & Cloud Engineer' }),
    ).toBeVisible();
  });

  test('shows the bio paragraph', async ({ page }) => {
    await expect(about(page).getByText(/AI-focused engineer/)).toBeVisible();
  });

  test('lists every skill chip', async ({ page }) => {
    for (const skill of SKILLS) {
      await expect(about(page).getByText(skill, { exact: true })).toBeVisible();
    }
  });

  // Opens rather than downloads, like the CV section: every device can open
  // a PDF and save it from its viewer, while the `download` attribute did
  // nothing visible on iPhone Chrome.
  test('the Open CV button opens the CV in a new tab instead of downloading it', async ({ page }) => {
    const button = about(page).getByRole('link', { name: 'Open CV', exact: true });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('href', cv.file);
    await expect(button).not.toHaveAttribute('download');

    const downloads: string[] = [];
    page.on('download', (d) => downloads.push(d.suggestedFilename()));
    page.context().on('page', (tab) => tab.on('download', (d) => downloads.push(d.suggestedFilename())));
    await waitForFinalLayout(page);
    const newTab = page.waitForEvent('popup');
    await button.click();
    const tab = await newTab;

    await expect(tab).toHaveURL(new RegExp(`${cv.file.replace(/\./g, '\\.')}$`));
    await tab.waitForLoadState('load');
    expect(tab.isClosed()).toBe(false);
    expect(downloads).toEqual([]);
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

    test.describe(`with a pointer to hover with`, () => {
      // Tooltips are hover-driven, so this runs as a desktop with a mouse
      // under both projects rather than being skipped on the touch one.
      test.use(DESKTOP);

      test(`the ${contact.label} icon shows its value in a floating tooltip on hover`, async ({ page }) => {
        const link = about(page).locator(`a[href="${contact.href}"]`);
        await link.hover();

        const tooltip = page.locator('.MuiTooltip-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveText(contact.value);
      });
    });
  }
});
