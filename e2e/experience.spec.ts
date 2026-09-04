import { test, expect, type Page } from '@playwright/test';
import { parseLatexExperience } from '@/lib/parseLatexExperience';
import { truncateDescription } from '@/lib/truncateDescription';
import { companyLogoName } from '@/lib/companyLogo';
import latexResume from '@/data/latexResume';
import { isMobileProject } from './fixtures/helpers';

const experiences = parseLatexExperience(latexResume);
// Mirrors components/sections/Experience.tsx's own constant.
const MOBILE_CHAR_LIMIT = 100;

const experienceSection = (page: Page) => page.locator('#experience');

async function gotoExperience(page: Page): Promise<void> {
  await page.goto('/');
  await experienceSection(page).scrollIntoViewIfNeeded();
}

test.describe('Experience section', () => {
  test('renders a timeline entry for every job with its period and company', async ({ page }) => {
    await gotoExperience(page);
    await expect(experienceSection(page).getByRole('heading', { level: 5 })).toHaveCount(experiences.length);

    for (const exp of experiences) {
      await expect(experienceSection(page).getByText(exp.period, { exact: true })).toBeVisible();
    }

    const companyLocationCounts = new Map<string, number>();
    for (const exp of experiences) {
      const key = `${exp.company} · ${exp.location}`;
      companyLocationCounts.set(key, (companyLocationCounts.get(key) ?? 0) + 1);
    }
    for (const [text, count] of companyLocationCounts) {
      await expect(experienceSection(page).getByText(text, { exact: true })).toHaveCount(count);
    }
  });

  test('shows the description list currently appropriate for the viewport', async ({ page }, testInfo) => {
    await gotoExperience(page);
    const mobile = isMobileProject(testInfo);
    const visibleLists = experienceSection(page).locator('ul:visible');
    await expect(visibleLists).toHaveCount(experiences.length);

    for (const [i, exp] of experiences.entries()) {
      const items = visibleLists.nth(i).getByRole('listitem');
      const expected = mobile ? truncateDescription(exp.description, MOBILE_CHAR_LIMIT) : exp.description;
      // truncateDescription can shorten an item's *text* (appending "...")
      // without dropping it from the array, so the count alone doesn't prove
      // truncation happened — compare the actual rendered text of every item.
      await expect(items).toHaveText(expected);
    }
  });

  test('renders a logo for a company that has one in public/logos', async ({ page }) => {
    await gotoExperience(page);
    const kone = experiences.find((exp) => exp.company === 'KONE');
    if (!kone) throw new Error('fixture assumes a KONE entry exists');

    const logo = experienceSection(page).getByRole('img', { name: 'KONE' }).first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', new RegExp(`/logos/${companyLogoName(kone.company)}\\.png$`));
  });

  test('hides a company logo gracefully when its image fails to load', async ({ page }) => {
    // The route must be registered before the *first* navigation: once the
    // browser has already cached a successful response for this URL, a
    // same-context reload can be served from cache without ever reaching
    // the router, and the 404 below would never be exercised.
    await page.route('**/logos/kone.png', (route) => route.fulfill({ status: 404, body: 'not found' }));
    await gotoExperience(page);

    await expect(experienceSection(page).getByRole('img', { name: 'KONE' })).toHaveCount(0);
    // The rest of that entry still renders even though its logo didn't.
    await expect(experienceSection(page).getByText('KONE · Espoo, Finland', { exact: true }).first()).toBeVisible();
  });

  test.describe('on mobile', () => {
    test('expands a truncated entry on "Show more" and collapses it again on "Show less", independently of others', async ({
      page,
    }, testInfo) => {
      test.skip(!isMobileProject(testInfo), 'mobile-only truncation UI');
      await gotoExperience(page);

      const exp0 = experiences[0]!;
      const full0 = exp0.description;
      const truncated0 = truncateDescription(full0, MOBILE_CHAR_LIMIT);
      // truncateDescription can shorten the last item's text (appending
      // "...") without changing the array length, so comparing the actual
      // text — not just the count — is what proves truncation happened.
      if (JSON.stringify(truncated0) === JSON.stringify(full0)) {
        throw new Error('fixture assumes the first experience entry is actually truncated on mobile');
      }

      const showMoreButtons = experienceSection(page).getByRole('button', { name: 'Show more' });
      await expect(showMoreButtons).toHaveCount(experiences.length);

      const firstList = experienceSection(page).locator('ul:visible').nth(0);
      await expect(firstList.getByRole('listitem')).toHaveText(truncated0);

      await showMoreButtons.nth(0).click();

      await expect(firstList.getByRole('listitem')).toHaveText(full0);
      await expect(experienceSection(page).getByRole('button', { name: 'Show less' }).first()).toBeVisible();

      // A second entry's toggle is untouched.
      const secondList = experienceSection(page).locator('ul:visible').nth(1);
      const exp1 = experiences[1]!;
      const truncated1 = truncateDescription(exp1.description, MOBILE_CHAR_LIMIT);
      await expect(secondList.getByRole('listitem')).toHaveText(truncated1);

      await experienceSection(page).getByRole('button', { name: 'Show less' }).first().click();
      await expect(firstList.getByRole('listitem')).toHaveText(truncated0);
    });
  });

  test.describe('on desktop', () => {
    test('the mobile "Show more" toggle is not visible', async ({ page }, testInfo) => {
      test.skip(isMobileProject(testInfo), 'desktop-only assertion');
      await gotoExperience(page);
      await expect(experienceSection(page).getByRole('button', { name: 'Show more' }).first()).toBeHidden();
    });
  });
});
