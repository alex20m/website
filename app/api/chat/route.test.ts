import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function chatRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat', () => {
  it('rejects an empty message list without calling OpenRouter', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(chatRequest({ messages: [] }));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails with a clear 500 when OPENROUTER_API_KEY is not set, rather than calling OpenRouter without one', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(chatRequest({ messages: [{ role: 'user', content: 'hi' }] }));

    expect(response.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requests a real, plausibly-shaped OpenRouter model id, not the nonexistent "openrouter/free" placeholder', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    let capturedBody: { model?: string } = {};
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        capturedBody = JSON.parse((init?.body as string) ?? '{}');
        return new Response(new ReadableStream(), { status: 200 });
      }),
    );

    await POST(chatRequest({ messages: [{ role: 'user', content: 'hi' }] }));

    // OpenRouter model ids are always "vendor/model[:variant]" — this only
    // guards the shape (catching a placeholder like the old "openrouter/free"
    // or a typo'd slug), not whether the specific model is free or exists.
    expect(capturedBody.model).not.toBe('openrouter/free');
    expect(capturedBody.model).toMatch(/^[\w.-]+\/[\w.-]+(?::[\w.-]+)?$/);
  });

  it('logs the upstream status and body when OpenRouter rejects the request, but returns a generic 502', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"error":{"message":"model not found"}}', { status: 400 })),
    );
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(chatRequest({ messages: [{ role: 'user', content: 'hi' }] }));

    expect(response.status).toBe(502);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('OpenRouter'),
      400,
      expect.stringContaining('model not found'),
    );
  });

  it('streams the OpenRouter response body straight through on success', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
    const upstreamBody = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n'));
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(upstreamBody, { status: 200 })));

    const response = await POST(chatRequest({ messages: [{ role: 'user', content: 'hi' }] }));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    const text = await response.text();
    expect(text).toContain('"content":"Hi"');
  });
});
