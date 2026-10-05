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

/**
 * Answers `/api/chat` with a reply that arrives as separate network chunks,
 * `delayMs` apart — what a real streamed answer looks like, and the only way
 * the Chat section sees more than one read. `route.fulfill` hands the browser
 * the whole body at once, so the page's `fetch` itself is replaced for this
 * one URL. Call it before `page.goto`: an init script only applies to the
 * navigations that follow it.
 *
 * Pass the chunks as raw SSE text, so a test can send a malformed frame, a
 * frame without a token, or a stream that simply ends without `[DONE]`.
 */
export async function mockChatChunked(page: Page, chunks: string[], delayMs = 40): Promise<void> {
  await page.addInitScript(
    ({ chunks, delayMs }) => {
      const realFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (!url.endsWith('/api/chat')) return realFetch(input, init);
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          async start(controller) {
            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(chunk));
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
            controller.close();
            (window as unknown as { chatStreamClosed: boolean }).chatStreamClosed = true;
          },
        });
        return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
      };
    },
    { chunks, delayMs },
  );
}

/** One SSE frame carrying a token, as OpenRouter sends it. */
export function sseToken(token: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content: token } }] })}\n\n`;
}

/**
 * Resolves once a stream from `mockChatChunked` has closed *and* the page has
 * had a turn to notice. A stream ending changes nothing on screen, so without
 * waiting the test can finish — and its coverage be read — before the page's
 * own end-of-stream handling has run.
 */
export async function chatStreamEnded(page: Page): Promise<void> {
  await page.waitForFunction(() => (window as unknown as { chatStreamClosed?: boolean }).chatStreamClosed === true);
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 0)));
}
