import type { Page, Route } from '@playwright/test';

/**
 * The Chat section calls this app's own `/api/chat` route (see
 * `components/sections/Chat.tsx`'s `CHAT_API_URL`). Every e2e test that
 * exercises the chat widget must intercept it — otherwise it either hits
 * the real, rate-limited OpenRouter backend or hangs waiting on a real LLM
 * response.
 */
export const CHAT_API_URL = '**/api/chat';

/** Builds the SSE body the worker streams through from OpenRouter. */
function buildSseBody(tokens: string[]): string {
  const frames = tokens.map(
    (token) => `data: ${JSON.stringify({ choices: [{ delta: { content: token } }] })}\n\n`,
  );
  frames.push('data: [DONE]\n\n');
  return frames.join('');
}

/** Fulfils the next chat request with a successful streamed reply. */
export async function mockChatSuccess(page: Page, tokens: string[]): Promise<void> {
  await page.route(CHAT_API_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: buildSseBody(tokens),
    });
  });
}

/**
 * Fulfils the next chat request with a successful reply, but only after
 * `delayMs` — used to assert the "Thinking..." indicator is visible while a
 * response is in flight.
 */
export async function mockChatSuccessDelayed(page: Page, tokens: string[], delayMs: number): Promise<void> {
  await page.route(CHAT_API_URL, async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: buildSseBody(tokens),
    });
  });
}

/** Fulfils the next chat request with an HTTP error, matching `!response.ok`. */
export async function mockChatHttpError(page: Page, status = 502): Promise<void> {
  await page.route(CHAT_API_URL, async (route: Route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'LLM request failed' }),
    });
  });
}

/** Aborts the next chat request outright, matching a network/DNS failure. */
export async function mockChatNetworkFailure(page: Page): Promise<void> {
  await page.route(CHAT_API_URL, async (route: Route) => {
    await route.abort('failed');
  });
}

/** Fulfils the next chat request with a 200 but an empty stream (no tokens, no [DONE] content). */
export async function mockChatEmptyStream(page: Page): Promise<void> {
  await page.route(CHAT_API_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: 'data: [DONE]\n\n',
    });
  });
}
