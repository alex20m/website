import { describe, expect, it, vi } from 'vitest';
import worker from './index';

describe('chat worker upstream model', () => {
  it('requests a real OpenRouter model id ending in ":free", not the nonexistent "openrouter/free" placeholder', async () => {
    let capturedBody: { model?: string } = {};

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        capturedBody = JSON.parse((init?.body as string) ?? '{}');
        return new Response(new ReadableStream(), { status: 200 });
      })
    );

    const request = new Request('https://worker.example', {
      method: 'POST',
      headers: { Origin: 'https://alexmecklin.com', 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    });

    await worker.fetch(request, { OPENROUTER_API_KEY: 'test-key' });

    expect(capturedBody.model).not.toBe('openrouter/free');
    expect(capturedBody.model).toMatch(/^[\w.-]+\/[\w.-]+:free$/);
  });
});
