import { test, expect } from './fixtures/test';
import { DESKTOP, PHONE, isMobileProject, NAV_ITEMS } from './fixtures/helpers';

const SECTION_HEADING: Record<string, { name: string; level: number }> = {
  about: { name: 'Alex Mecklin', level: 2 },
  chat: { name: 'Ask AI', level: 2 },
  experience: { name: 'Experience', level: 2 },
  projects: { name: 'Projects', level: 2 },
  cv: { name: 'CV', level: 2 },
  contact: { name: 'Contact', level: 2 },
};

test.describe('Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('the wordmark links back to the top of the page', async ({ page }) => {
    // Scroll down first so the click has somewhere to go back from.
    await page.getByRole('heading', { name: 'Contact', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { level: 6, name: 'Alex Mecklin' })).toBeInViewport();

    await page.getByRole('heading', { level: 6, name: 'Alex Mecklin' }).click();

    await expect
      .poll(async () => page.evaluate(() => window.scrollY), { timeout: 5000 })
      .toBeLessThan(50);
  });

  test('every nav item is present and points at its section', async ({ page }, testInfo) => {
    if (isMobileProject(testInfo)) {
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
    }

    for (const item of NAV_ITEMS) {
      await expect(page.getByRole('button', { name: item.label, exact: true })).toBeVisible();
    }
  });

  test.describe('on desktop', () => {
    test.use(DESKTOP);

    test('shows the full nav bar and no hamburger button', async ({ page }) => {
      for (const item of NAV_ITEMS) {
        await expect(page.getByRole('button', { name: item.label, exact: true })).toBeVisible();
      }
      await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeHidden();
    });

    test('does nothing when the section a nav item points at is not on the page', async ({ page }) => {
      // Renamed rather than removed: React owns the node, and pulling it out of the DOM would break its next render.
      await page.evaluate(() => document.getElementById('projects')!.setAttribute('id', 'elsewhere'));
      const before = await page.evaluate(() => window.scrollY);

      await page.getByRole('button', { name: 'Projects', exact: true }).click();
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));

      expect(await page.evaluate(() => window.scrollY)).toBe(before);
    });

    for (const item of NAV_ITEMS) {
      test(`clicking "${item.label}" scrolls the ${item.id} section into view`, async ({ page }) => {
        const heading = SECTION_HEADING[item.id];
        if (!heading) throw new Error(`missing heading fixture for ${item.id}`);

        await page.getByRole('button', { name: item.label, exact: true }).click();

        await expect(
          page.getByRole('heading', { level: heading.level, name: heading.name, exact: true }),
        ).toBeInViewport({ timeout: 5000 });
      });
    }
  });

  test.describe('on a phone', () => {
    test.use(PHONE);

    test('hides the full nav bar and shows a hamburger button', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
      for (const item of NAV_ITEMS) {
        await expect(page.getByRole('button', { name: item.label, exact: true })).toBeHidden();
      }
    });

    test('opens a drawer with every nav link when the hamburger is tapped', async ({ page }) => {
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      for (const item of NAV_ITEMS) {
        await expect(page.getByRole('button', { name: item.label, exact: true })).toBeVisible();
      }
    });

    test('closes the drawer on Escape and leaves the page where it was', async ({ page }) => {
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      await expect(page.getByRole('button', { name: 'About', exact: true })).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(page.getByRole('button', { name: 'About', exact: true })).toBeHidden();
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('closes the drawer when the page behind it is tapped', async ({ page }) => {
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      await expect(page.getByRole('button', { name: 'About', exact: true })).toBeVisible();

      await page.mouse.click(20, 400);

      await expect(page.getByRole('button', { name: 'About', exact: true })).toBeHidden();
    });

    for (const item of NAV_ITEMS) {
      test(`selecting "${item.label}" in the drawer scrolls to ${item.id} and closes the drawer`, async ({ page }) => {
        const heading = SECTION_HEADING[item.id];
        if (!heading) throw new Error(`missing heading fixture for ${item.id}`);

        await page.getByRole('button', { name: 'Open navigation menu' }).click();
        await page.getByRole('button', { name: item.label, exact: true }).click();

        // The drawer link itself must disappear (drawer closed) and the
        // section must have actually scrolled into view.
        await expect(page.getByRole('button', { name: item.label, exact: true })).toBeHidden();
        await expect(
          page.getByRole('heading', { level: heading.level, name: heading.name, exact: true }),
        ).toBeInViewport({ timeout: 5000 });
      });
    }
  });
});
