/**
 * Parses one buffered chunk of an OpenRouter-style SSE stream (as forwarded
 * by the chat worker) into the plain-text tokens it carries, and reports how
 * much of the chunk was consumed.
 *
 * SSE frames arrive newline-delimited, and a chunk boundary can land mid
 * frame, so the last, possibly-incomplete line is always returned as
 * `remainder` for the caller to prepend to the next chunk rather than dropped.
 */
export interface ParsedChunk {
  /** Concatenated `delta.content` tokens found in this chunk, in order. */
  text: string;
  /** The trailing partial line, to prepend to the next chunk. */
  remainder: string;
  /** Whether a `data: [DONE]` frame was seen in this chunk. */
  done: boolean;
}

export function parseSseChunk(buffer: string): ParsedChunk {
  const lines = buffer.split('\n');
  const remainder = lines.pop() ?? '';

  let text = '';
  let done = false;

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6).trim();
    if (data === '[DONE]') {
      done = true;
      break;
    }
    try {
      const json = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
      const token = json.choices?.[0]?.delta?.content;
      if (token) text += token;
    } catch {
      // Malformed SSE lines (a split JSON object, a comment frame) are ignored.
    }
  }

  return { text, remainder, done };
}
