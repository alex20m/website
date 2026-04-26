import { SYSTEM_PROMPT } from './systemPrompt.js';

const ALLOWED_ORIGINS = ['https://alexmecklin.com', 'http://localhost:5173'];

function getCorsOrigin(request) {
  const origin = request.headers.get('Origin');
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}

export default {
  async fetch(request, env) {
    const corsOrigin = getCorsOrigin(request);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      if (!corsOrigin) return new Response('Forbidden', { status: 403 });
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (!corsOrigin) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'No messages provided' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin,
          },
        });
      }

      if (!env.OPENROUTER_API_KEY) {
        return new Response(JSON.stringify({ error: 'Server misconfiguration: API key not set' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin,
          },
        });
      }

      // Limit conversation history to last 20 messages to control token usage
      const trimmedMessages = messages.slice(-20);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://alexmecklin.com',
          'X-Title': 'Alex Mecklin Portfolio Chat',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          stream: true,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...trimmedMessages,
          ],
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'LLM request failed' }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin,
          },
        });
      }

      // Pass the SSE stream directly to the client
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    }
  },
};
