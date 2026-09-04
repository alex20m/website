import { test, expect, type Page } from '@playwright/test';
import {
  mockChatSuccess,
  mockChatSuccessDelayed,
  mockChatHttpError,
  mockChatNetworkFailure,
  mockChatEmptyStream,
} from './fixtures/chatMock';

const SUGGESTIONS = ['What is Alex working on?', 'What are his skills?', 'Tell me about his experience'];

const chat = (page: Page) => page.locator('#chat');
const textbox = (page: Page) => chat(page).getByRole('textbox');
const sendButton = (page: Page) => chat(page).getByRole('button', { name: 'Send message' });

test.describe('Chat / Ask AI section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await chat(page).scrollIntoViewIfNeeded();
  });

  test('shows the empty state with every suggestion chip', async ({ page }) => {
    await expect(chat(page).getByText('Ask me anything about Alex')).toBeVisible();
    for (const suggestion of SUGGESTIONS) {
      await expect(chat(page).getByText(suggestion, { exact: true })).toBeVisible();
    }
  });

  test('the send button is disabled until there is input, and disabled while sending', async ({ page }) => {
    await expect(sendButton(page)).toBeDisabled();

    await textbox(page).fill('Hello there');
    await expect(sendButton(page)).toBeEnabled();

    await mockChatSuccessDelayed(page, ['Hi!'], 500);
    await sendButton(page).click();
    await expect(sendButton(page)).toBeDisabled();
  });

  test('clicking a suggestion chip sends it as a message', async ({ page }) => {
    await mockChatSuccess(page, ['Alex is building agentic AI tools.']);

    await chat(page).getByText(SUGGESTIONS[0]!, { exact: true }).click();

    await expect(chat(page).getByText(SUGGESTIONS[0]!, { exact: true })).toBeVisible();
    await expect(chat(page).getByText('Alex is building agentic AI tools.')).toBeVisible();
    // Empty-state suggestions disappear once a conversation has started.
    await expect(chat(page).getByText('Ask me anything about Alex')).toBeHidden();
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
    // Nothing was sent: the empty-state suggestions are still showing.
    await expect(chat(page).getByText('Ask me anything about Alex')).toBeVisible();
  });

  test('shows a "Thinking..." indicator while the reply streams in', async ({ page }) => {
    await mockChatSuccessDelayed(page, ['Delayed reply.'], 800);

    await textbox(page).fill('Take your time');
    await sendButton(page).click();

    await expect(chat(page).getByText('Thinking...')).toBeVisible();
    await expect(chat(page).getByText('Delayed reply.')).toBeVisible({ timeout: 5000 });
    await expect(chat(page).getByText('Thinking...')).toBeHidden();
  });

  test('shows a fallback message when the worker responds with an HTTP error', async ({ page }) => {
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

    await expect(chat(page).getByText('Ask me anything about Alex')).toBeVisible();
  });
});
