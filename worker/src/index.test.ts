import { describe, expect, it, vi } from 'vitest';
import worker from './index';

describe('chat worker CORS allowlist', () => {
  it('allows the www subdomain the production site is actually served from', async () => {
    const request = new Request('https://worker.example', {
      method: 'OPTIONS',
      headers: { Origin: 'https://www.alexmecklin.com' },
    });

    const response = await worker.fetch(request, { OPENROUTER_API_KEY: 'test-key' });

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://www.alexmecklin.com');
  });

  it('still refuses an origin outside the allowlist', async () => {
    const request = new Request('https://worker.example', {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.example' },
    });

    const response = await worker.fetch(request, { OPENROUTER_API_KEY: 'test-key' });

    expect(response.status).toBe(403);
  });
});

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
