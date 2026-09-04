import { SYSTEM_PROMPT } from './systemPrompt';

export interface Env {
  OPENROUTER_API_KEY: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ALLOWED_ORIGINS = ['https://alexmecklin.com', 'http://localhost:3000'];

function getCorsOrigin(request: Request): string | null {
  const origin = request.headers.get('Origin');
  return origin && ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

function jsonError(message: string, status: number, corsOrigin: string | null): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(corsOrigin ? { 'Access-Control-Allow-Origin': corsOrigin, Vary: 'Origin' } : {}),
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsOrigin = getCorsOrigin(request);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      if (!corsOrigin) return new Response('Forbidden', { status: 403 });
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          Vary: 'Origin',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsOrigin ? { 'Access-Control-Allow-Origin': corsOrigin, Vary: 'Origin' } : undefined,
      });
    }

    if (!corsOrigin) {
      return new Response('Forbidden', { status: 403 });
    }

    let messages: ChatMessage[] | undefined;

    try {
      ({ messages } = await request.json<{ messages?: ChatMessage[] }>());
    } catch {
      return jsonError('Invalid JSON body', 400, corsOrigin);
    }

    try {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return jsonError('No messages provided', 400, corsOrigin);
      }

      if (!env.OPENROUTER_API_KEY) {
        return jsonError('Server misconfiguration: API key not set', 500, corsOrigin);
      }

      // Limit conversation history to last 20 messages to control token usage
      const trimmedMessages = messages.slice(-20);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://alexmecklin.com',
          'X-Title': 'Alex Mecklin Portfolio Chat',
        },
        body: JSON.stringify({
          model: 'thinkingmachines/inkling-small:free',
          stream: true,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmedMessages],
        }),
      });

      if (!response.ok) {
        return jsonError('LLM request failed', 502, corsOrigin);
      }

      // Pass the SSE stream directly to the client
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': corsOrigin,
          Vary: 'Origin',
        },
      });
    } catch {
      return jsonError('Internal server error', 500, corsOrigin);
    }
  },
};
