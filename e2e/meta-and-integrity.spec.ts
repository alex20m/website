import { test, expect } from '@playwright/test';
import { mockChatSuccess } from './fixtures/chatMock';
import { NAV_ITEMS, isMobileProject } from './fixtures/helpers';

test.describe('Page metadata', () => {
  test('has the correct document title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Alex Mecklin');
  });

  test('declares a responsive viewport', async ({ page }) => {
    await page.goto('/');
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('declares favicons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="icon"]')).not.toHaveCount(0);
  });

  test('declares the document language', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('loads the Vercel Web Analytics script', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('script[src*="_vercel/insights/script.js"]')).toHaveCount(1);
  });
});

test.describe('Accessibility basics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('every image has non-empty alt text', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `image #${i} (src=${await images.nth(i).getAttribute('src')}) has empty alt text`).toBeTruthy();
    }
  });

  test('every link has an accessible name', async ({ page }) => {
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const name = (await links.nth(i).innerText().catch(() => '')).trim();
      const ariaLabel = await links.nth(i).getAttribute('aria-label');
      const hasAccessibleImg = await links.nth(i).locator('img[alt]:not([alt=""])').count();
      const href = await links.nth(i).getAttribute('href');
      expect(
        Boolean(name || ariaLabel || hasAccessibleImg),
        `link with href="${href}" has no accessible name`,
      ).toBe(true);
    }
  });

  test('every button has an accessible name', async ({ page }) => {
    const buttons = page.locator('button, [role="button"]');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const name = (await buttons.nth(i).innerText().catch(() => '')).trim();
      const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
      expect(Boolean(name || ariaLabel), `button #${i} has no accessible name`).toBe(true);
    }
  });

  test('there are no duplicate element ids', async ({ page }) => {
    const duplicates = await page.evaluate(() => {
      const seen = new Map<string, number>();
      document.querySelectorAll('[id]').forEach((el) => {
        seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
      });
      return [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    });
    expect(duplicates).toEqual([]);
  });

  test('every section is reachable by its id', async ({ page }) => {
    for (const item of NAV_ITEMS) {
      await expect(page.locator(`#${item.id}`)).toHaveCount(1);
    }
  });

  test('the page has no horizontal overflow', async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('External links point out, internal assets resolve', () => {
  test('every external link opens in a new tab with rel=noopener noreferrer', async ({ page }) => {
    await page.goto('/');
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const rel = await externalLinks.nth(i).getAttribute('rel');
      const href = await externalLinks.nth(i).getAttribute('href');
      expect(rel, `external link to ${href} is missing rel=noopener noreferrer`).toContain('noopener');
      expect(rel, `external link to ${href} is missing rel=noopener noreferrer`).toContain('noreferrer');
    }
  });

  test('every same-origin asset the page requests loads successfully', async ({ page }) => {
    const failures: string[] = [];
    page.on('response', (response) => {
      const url = new URL(response.url());
      const isSameOrigin = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      // Vercel's edge network rewrites this path to the Web Analytics script
      // only for a real deployment with Web Analytics enabled; `next start`
      // has nothing to serve it, so it 404s in every local/CI run by design.
      if (isSameOrigin && url.pathname === '/_vercel/insights/script.js') return;
      if (isSameOrigin && !response.ok()) failures.push(`${response.status()} ${response.url()}`);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failures).toEqual([]);
  });

  test('the profile photo and every referenced company logo resolve', async ({ page, request }) => {
    await page.goto('/');
    for (const path of ['/profile.png', '/logos/kone.png', '/logos/danfoss_drives.png', '/logos/wartsila.png', '/logos/aalto_university.png']) {
      const response = await request.get(path);
      expect(response.status(), `${path} should resolve`).toBe(200);
    }
  });
});

test.describe('No console or page errors during a full user journey', () => {
  test('navigating every section, opening chat, and sending a message produces no console errors', async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      // Same 404 as above: the Web Analytics script only resolves on a real
      // Vercel deployment, not under `next start`.
      if (msg.location().url.includes('_vercel/insights/script.js')) return;
      errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await mockChatSuccess(page, ['All good, thanks for asking!']);
    await page.goto('/');

    const mobile = isMobileProject(testInfo);
    for (const item of NAV_ITEMS) {
      if (mobile) {
        await page.getByRole('button', { name: 'Open navigation menu' }).click();
      }
      await page.getByRole('button', { name: item.label, exact: true }).click();
    }

    const textbox = page.locator('#chat').getByRole('textbox');
    await textbox.fill('Hello!');
    await page.locator('#chat').getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('#chat').getByText('All good, thanks for asking!')).toBeVisible();

    expect(errors, `console/page errors during navigation: ${errors.join('\n')}`).toEqual([]);
  });
});
