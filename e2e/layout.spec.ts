import { test, expect } from './fixtures/test';
import { DESKTOP, PHONE } from './fixtures/helpers';
import { mockChatSuccess, mockChatSuccessDelayed } from './fixtures/chatMock';

/**
 * The site has two layouts and every section adapts to the narrow one: type
 * sizes, spacing, direction of the About block, the size of the chat. Each
 * layout is exercised here with an explicit viewport, so the same assertions
 * run under both Playwright projects and neither layout is only ever seen by
 * the project that happens to default to it.
 */

const LAYOUTS = [
  {
    name: 'a phone',
    context: PHONE,
    sectionHeading: '25.6px',
    sectionPadding: '48px',
    aboutDirection: 'column',
    avatar: '120px',
    projectCardPadding: '16px',
    contactTilePadding: '16px',
    cvPadding: '20px',
    experienceListFont: '13.6px',
    chatHeight: '400px',
    chatInputFont: '16px',
    chatMessageFont: '12.8px',
  },
  {
    name: 'a desktop',
    context: DESKTOP,
    sectionHeading: '35.2px',
    sectionPadding: '64px',
    aboutDirection: 'row',
    avatar: '180px',
    projectCardPadding: '24px',
    contactTilePadding: '20px',
    cvPadding: '32px',
    experienceListFont: '15.2px',
    chatHeight: '480px',
    chatInputFont: '14.4px',
    chatMessageFont: '14.4px',
  },
] as const;

for (const layout of LAYOUTS) {
  test.describe(`on ${layout.name}`, () => {
    test.use(layout.context);

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('sizes section headings and spaces sections for the layout', async ({ page }) => {
      await expect(page.locator('#projects').getByRole('heading', { level: 2 })).toHaveCSS(
        'font-size',
        layout.sectionHeading,
      );
      await expect(page.locator('#projects')).toHaveCSS('padding-top', layout.sectionPadding);
    });

    test('lays out the About block and its photo for the layout', async ({ page }) => {
      await expect(page.locator('#about .MuiAvatar-root')).toHaveCSS('width', layout.avatar);
      await expect(page.locator('#about .MuiContainer-root > div')).toHaveCSS('flex-direction', layout.aboutDirection);
    });

    test('pads project cards, contact tiles and the CV box for the layout', async ({ page }) => {
      await expect(page.getByTestId('project-card-Elixia Booker')).toHaveCSS('padding-top', layout.projectCardPadding);
      await expect(page.locator('#contact').getByRole('link').first()).toHaveCSS(
        'padding-top',
        layout.contactTilePadding,
      );
      await expect(page.locator('#cv .MuiContainer-root > div')).toHaveCSS('padding-top', layout.cvPadding);
    });

    test('sets the work experience text at the size of the layout', async ({ page }) => {
      await expect(page.locator('#experience ul:visible').first()).toHaveCSS('font-size', layout.experienceListFont);
    });

    test('sizes the chat window, its input and its messages for the layout', async ({ page }) => {
      await mockChatSuccessDelayed(page, ['Hi there.'], 600);
      const chat = page.locator('#chat');
      await expect(chat.locator('.MuiPaper-root')).toHaveCSS('height', layout.chatHeight);
      await expect(chat.getByRole('textbox')).toHaveCSS('font-size', layout.chatInputFont);

      await chat.getByRole('textbox').fill('Hello');
      await chat.getByRole('button', { name: 'Send message' }).click();
      await expect(chat.getByText('Thinking...')).toHaveCSS('font-size', layout.chatMessageFont);
      await expect(chat.getByText('Hi there.')).toHaveCSS('font-size', layout.chatMessageFont);
    });

    test('keeps the chat usable: a reply appears under the question', async ({ page }) => {
      await mockChatSuccess(page, ['Happy to help.']);
      const chat = page.locator('#chat');
      await chat.getByRole('textbox').fill('Can you help?');
      await chat.getByRole('button', { name: 'Send message' }).click();
      await expect(chat.getByText('Can you help?', { exact: true })).toBeVisible();
      await expect(chat.getByText('Happy to help.')).toBeVisible();
    });
  });
}
