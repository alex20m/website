import { test, expect } from './fixtures/test';
import { type Page } from '@playwright/test';
import {
  mockChatSuccess,
  mockChatSuccessDelayed,
  mockChatHttpError,
  mockChatNetworkFailure,
  mockChatEmptyStream,
  mockChatChunked,
  chatStreamEnded,
  sseToken,
} from './fixtures/chatMock';

const SUGGESTIONS = ['What is Alex working on?', 'What are his skills?', 'Tell me about his experience'];

const GREETING = /I'm Alex's AI assistant/;

const chat = (page: Page) => page.locator('#chat');
const quickReply = (page: Page, text: string) => chat(page).getByRole('button', { name: text, exact: true });
const typing = (page: Page) => chat(page).getByRole('status', { name: 'Alex is typing' });
const textbox = (page: Page) => chat(page).getByRole('textbox');
const sendButton = (page: Page) => chat(page).getByRole('button', { name: 'Send message' });

test.describe('Chat / Ask AI section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await chat(page).scrollIntoViewIfNeeded();
  });

  test('opens with a greeting and every suggestion as a quick reply', async ({ page }) => {
    await expect(chat(page).getByText(GREETING)).toBeVisible();
    for (const suggestion of SUGGESTIONS) {
      await expect(quickReply(page, suggestion)).toBeVisible();
    }
  });

  test("shows Alex's photo, actually loaded, in the chat header", async ({ page }) => {
    const headerPhoto = chat(page).getByRole('img', { name: 'Alex Mecklin' }).first();
    await expect(headerPhoto).toBeVisible();
    await expect(headerPhoto).toHaveAttribute('src', '/profile.png');
    // A broken path still renders an <img>; only a decoded image has a width.
    await expect.poll(() => headerPhoto.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  });

  test('the send button is disabled until there is input, and disabled while sending', async ({ page }) => {
    await expect(sendButton(page)).toBeDisabled();

    await textbox(page).fill('Hello there');
    await expect(sendButton(page)).toBeEnabled();

    await mockChatSuccessDelayed(page, ['Hi!'], 500);
    await sendButton(page).click();
    await expect(sendButton(page)).toBeDisabled();
  });

  test("sets Alex's name in the header in white on the dark bar, so it is legible", async ({ page }) => {
    await expect(chat(page).getByText(/^Alex Mecklin/)).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('clicking a suggestion chip sends it as a message', async ({ page }) => {
    await mockChatSuccess(page, ['Alex is building agentic AI tools.']);

    await quickReply(page, SUGGESTIONS[0]!).click();

    await expect(chat(page).getByText(SUGGESTIONS[0]!, { exact: true })).toBeVisible();
    await expect(chat(page).getByText('Alex is building agentic AI tools.')).toBeVisible();
    // Quick replies disappear once a conversation has started; the greeting stays.
    for (const suggestion of SUGGESTIONS) {
      await expect(quickReply(page, suggestion)).toBeHidden();
    }
    await expect(chat(page).getByText(GREETING)).toBeVisible();
  });

  test('typing a message and pressing the send button shows both sides of the exchange', async ({ page }) => {
    await mockChatSuccess(page, ['Nice to meet you too!']);

    await textbox(page).fill('Hi Alex');
    await sendButton(page).click();

    await expect(chat(page).getByText('Hi Alex', { exact: true })).toBeVisible();
    await expect(chat(page).getByText('Nice to meet you too!')).toBeVisible();
    await expect(textbox(page)).toHaveValue('');
  });

  test('pressing Enter sends the message', async ({ page }) => {
    await mockChatSuccess(page, ['Sure, ask away.']);

    await textbox(page).fill('Quick question');
    await textbox(page).press('Enter');

    await expect(chat(page).getByText('Quick question', { exact: true })).toBeVisible();
    await expect(chat(page).getByText('Sure, ask away.')).toBeVisible();
  });

  test('Shift+Enter inserts a newline instead of sending', async ({ page }) => {
    await textbox(page).fill('Line one');
    await textbox(page).press('Shift+Enter');
    await textbox(page).type('Line two');

    await expect(textbox(page)).toHaveValue('Line one\nLine two');
    // Nothing was sent: the quick replies are still showing.
    await expect(quickReply(page, SUGGESTIONS[0]!)).toBeVisible();
  });

  test('shows a typing indicator while the reply streams in', async ({ page }) => {
    await mockChatSuccessDelayed(page, ['Delayed reply.'], 800);

    await textbox(page).fill('Take your time');
    await sendButton(page).click();

    await expect(typing(page)).toBeVisible();
    await expect(chat(page).getByText('Delayed reply.')).toBeVisible({ timeout: 5000 });
    await expect(typing(page)).toBeHidden();
  });

  test('shows a fallback message when the API responds with an HTTP error', async ({ page }) => {
    await mockChatHttpError(page, 502);

    await textbox(page).fill('This will fail');
    await sendButton(page).click();

    await expect(chat(page).getByText('Sorry, something went wrong. Please try again.')).toBeVisible();
  });

  test('shows a fallback message when the request fails outright', async ({ page }) => {
    await mockChatNetworkFailure(page);

    await textbox(page).fill('No network');
    await sendButton(page).click();

    await expect(chat(page).getByText('Sorry, something went wrong. Please try again.')).toBeVisible();
  });

  test('shows a fallback message when the stream ends with no tokens', async ({ page }) => {
    await mockChatEmptyStream(page);

    await textbox(page).fill('Say nothing');
    await sendButton(page).click();

    await expect(chat(page).getByText('Sorry, I could not generate a response.')).toBeVisible();
  });

  test('renders a hash link in a reply that scrolls to the referenced section', async ({ page }) => {
    await mockChatSuccess(page, ['Check out the #projects section for more.']);

    await textbox(page).fill('What has he built?');
    await sendButton(page).click();

    const hashLink = chat(page).getByRole('link', { name: '#projects' });
    await expect(hashLink).toBeVisible();

    await hashLink.click();
    await expect(page.getByRole('heading', { level: 2, name: 'Projects', exact: true })).toBeInViewport({
      timeout: 5000,
    });
  });

  test('renders a plain URL in a reply as a clickable external link', async ({ page }) => {
    await mockChatSuccess(page, ['You can read more at https://alexmecklin.com/blog.']);

    await textbox(page).fill('Any links?');
    await sendButton(page).click();

    const link = chat(page).getByRole('link', { name: 'https://alexmecklin.com/blog' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('supports a back-and-forth conversation with multiple turns', async ({ page }) => {
    await mockChatSuccess(page, ['First answer.']);
    await textbox(page).fill('First question');
    await sendButton(page).click();
    await expect(chat(page).getByText('First answer.')).toBeVisible();

    await mockChatSuccess(page, ['Second answer.']);
    await textbox(page).fill('Second question');
    await sendButton(page).click();
    await expect(chat(page).getByText('Second answer.')).toBeVisible();

    await expect(chat(page).getByText('First question', { exact: true })).toBeVisible();
    await expect(chat(page).getByText('Second question', { exact: true })).toBeVisible();
  });

  test('does not send an empty or whitespace-only message', async ({ page }) => {
    await textbox(page).fill('   ');
    await expect(sendButton(page)).toBeDisabled();
    await textbox(page).press('Enter');

    await expect(quickReply(page, SUGGESTIONS[0]!)).toBeVisible();
  });
});

const DONE = 'data: [DONE]\n\n';

test.describe('Chat streaming', () => {
  // Each test arms its stream before the first navigation (see mockChatChunked).
  async function ask(page: Page, question: string) {
    await page.goto('/');
    await chat(page).scrollIntoViewIfNeeded();
    await textbox(page).fill(question);
    await sendButton(page).click();
  }

  test('builds the reply up from tokens that arrive in separate chunks', async ({ page }) => {
    await mockChatChunked(page, [sseToken('Hello'), sseToken(', '), sseToken('world!'), DONE]);
    await ask(page, 'Greet me');

    await expect(chat(page).getByText('Hello, world!', { exact: true })).toBeVisible();
    await expect(typing(page)).toBeHidden();
  });

  test('keeps what has streamed when the connection ends without a [DONE] marker', async ({ page }) => {
    await mockChatChunked(page, [sseToken('Partial '), sseToken('answer')]);
    await ask(page, 'Cut me off');

    await expect(chat(page).getByText('Partial answer', { exact: true })).toBeVisible();
    await chatStreamEnded(page);
    await expect(chat(page).getByText('Partial answer', { exact: true })).toBeVisible();
  });

  test('puts a token back together when a frame is split across two chunks', async ({ page }) => {
    await mockChatChunked(page, ['data: {"choices":[{"delta":{"con', 'tent":"Joined"}}]}\n\n', DONE]);
    await ask(page, 'Split it');

    await expect(chat(page).getByText('Joined', { exact: true })).toBeVisible();
  });

  test('skips comment, malformed and tokenless frames and still shows the real tokens', async ({ page }) => {
    await mockChatChunked(page, [
      ': keep-alive\n\n',
      'data: {not json\n\n',
      'data: {}\n\n',
      'data: {"choices":[]}\n\n',
      'data: {"choices":[{"delta":{}}]}\n\n',
      sseToken('Clean.'),
      DONE,
    ]);
    await ask(page, 'Be noisy');

    await expect(chat(page).getByText('Clean.', { exact: true })).toBeVisible();
    await expect(chat(page).getByText('Sorry', { exact: false })).toHaveCount(0);
  });
});

test.describe('Chat replies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await chat(page).scrollIntoViewIfNeeded();
  });

  test('renders bulleted and numbered lists in a reply as lists', async ({ page }) => {
    await mockChatSuccess(page, ['Skills:\n\n- Python\n- TypeScript\n\n1. First step\n2. Second step']);
    await textbox(page).fill('List things');
    await sendButton(page).click();

    await expect(chat(page).getByRole('list')).toHaveCount(2);
    await expect(chat(page).getByRole('listitem')).toHaveText(['Python', 'TypeScript', 'First step', 'Second step']);
  });

  test('leaves the page where it is when a reply links to a section that does not exist', async ({ page }) => {
    await mockChatSuccess(page, ['Look under #nowhere for that.']);
    await textbox(page).fill('Where?');
    await sendButton(page).click();

    const link = chat(page).getByRole('link', { name: '#nowhere' });
    await expect(link).toBeVisible();
    const before = await page.evaluate(() => window.scrollY);
    // Dispatched rather than clicked: Playwright's own click scrolls to chase a
    // reply that is still animating into place, which would move the page
    // whatever the app does.
    await link.dispatchEvent('click');
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));

    expect(await page.evaluate(() => window.scrollY)).toBe(before);
    // The link is handled in the page, so the address does not gain a #nowhere.
    expect(new URL(page.url()).hash).toBe('');
  });
});
