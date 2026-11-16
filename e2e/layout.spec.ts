import { test, expect } from './fixtures/test';
import { DESKTOP, PHONE, waitForFinalLayout } from './fixtures/helpers';
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
    sectionHeadingGap: '24px',
    aboutDirection: 'column',
    avatar: '120px',
    projectCardPadding: '16px',
    contactTilePadding: '16px',
    cvPadding: '20px',
    experienceListFont: '13.6px',
    chatHeight: '460px',
    chatInputFont: '16px',
    chatMessageFont: '14px',
  },
  {
    name: 'a desktop',
    context: DESKTOP,
    sectionHeading: '35.2px',
    sectionPadding: '64px',
    sectionHeadingGap: '40px',
    aboutDirection: 'row',
    avatar: '180px',
    projectCardPadding: '24px',
    contactTilePadding: '20px',
    cvPadding: '32px',
    experienceListFont: '15.2px',
    chatHeight: '540px',
    chatInputFont: '15px',
    chatMessageFont: '15px',
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

    test('leaves the same gap under every section heading before its content', async ({ page }) => {
      for (const id of ['chat', 'experience', 'projects', 'cv', 'contact']) {
        const heading = page.locator(`#${id}`).getByRole('heading', { level: 2 });
        // The server renders the desktop layout and the phone one only takes
        // over after hydration; wait for the layout's own heading size first,
        // or a desktop gap that happens to equal the phone one passes early.
        await expect(heading).toHaveCSS('font-size', layout.sectionHeading);
        await expect(heading).toHaveCSS(
          'margin-bottom',
          layout.sectionHeadingGap,
        );
      }
    });

    test('lays out the About block and its photo for the layout', async ({ page }) => {
      await expect(page.locator('#about .MuiAvatar-root')).toHaveCSS('width', layout.avatar);
      await expect(page.locator('#about .MuiContainer-root > div')).toHaveCSS('flex-direction', layout.aboutDirection);
    });

    test('leaves the same space under the About block as every other section does', async ({ page }) => {
      // Space from the bottom of the About block's content (photo or text,
      // whichever reaches lower) to the section's bottom edge. Every other
      // section's gap is just its section padding, so About's must be too.
      // Measured from layout offsets, not getBoundingClientRect: the photo and
      // text animate in with a transform, and a mid-animation reading would
      // be off by however far they still have to travel. A phone also starts
      // in the server-rendered desktop layout, so wait for its own first.
      await waitForFinalLayout(page);
      const gap = await page.locator('#about').evaluate((section) => {
        const el = section as HTMLElement;
        const block = el.querySelector('.MuiContainer-root > div')!;
        const contentBottom = Math.max(
          ...[...block.children].map((child) => {
            const c = child as HTMLElement;
            return c.offsetTop + c.offsetHeight;
          }),
        );
        return `${el.offsetTop + el.offsetHeight - contentBottom}px`;
      });
      expect(gap).toBe(layout.sectionPadding);
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

    test('centres every section divider on the seam between two sections', async ({ page }) => {
      const dividers = page.getByTestId('section-divider');
      await expect(dividers).toHaveCount(5);
      const seams = await dividers.evaluateAll((els) =>
        els.map((el) => {
          const dot = el.querySelector('[data-divider-dot]') as HTMLElement;
          const r = dot.getBoundingClientRect();
          const above = el.previousElementSibling!.getBoundingClientRect();
          const below = el.nextElementSibling!.getBoundingClientRect();
          return { dotCentre: r.top + r.height / 2, aboveBottom: above.bottom, belowTop: below.top };
        }),
      );
      for (const seam of seams) {
        // The sections touch, so the colour change happens on one line ...
        expect(seam.belowTop).toBeCloseTo(seam.aboveBottom, 0);
        // ... and the divider's dots are centred on that line, not beside it.
        expect(seam.dotCentre).toBeCloseTo(seam.aboveBottom, 0);
      }
    });

    test('sizes the chat window, its input and its messages for the layout', async ({ page }) => {
      await mockChatSuccessDelayed(page, ['Hi there.'], 600);
      const chat = page.locator('#chat');
      await expect(chat.locator('.MuiPaper-root')).toHaveCSS('height', layout.chatHeight);
      await expect(chat.getByRole('textbox')).toHaveCSS('font-size', layout.chatInputFont);

      await chat.getByRole('textbox').fill('Hello');
      await chat.getByRole('button', { name: 'Send message' }).click();
      await expect(chat.getByRole('status', { name: 'Alex is typing' })).toBeVisible();
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
