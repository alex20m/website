import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request): Promise<Response> {
  let messages: ChatMessage[] | undefined;

  try {
    ({ messages } = await request.json());
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return jsonError('No messages provided', 400);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return jsonError('Server misconfiguration: API key not set', 500);
    }

    // Limit conversation history to last 20 messages to control token usage
    const trimmedMessages = messages.slice(-20);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      const upstreamBody = await response.text().catch(() => '<unreadable body>');
      console.error('OpenRouter request failed', response.status, upstreamBody);
      return jsonError('LLM request failed', 502);
    }

    // Pass the SSE stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return jsonError('Internal server error', 500);
  }
}
