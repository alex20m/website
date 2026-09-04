import { describe, expect, it } from 'vitest';
import { parseSseChunk } from '@/lib/chatStream';

describe('parseSseChunk', () => {
  it('extracts the token text from a complete data frame', () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n';
    expect(parseSseChunk(chunk)).toEqual({ text: 'Hello', remainder: '', done: false });
  });

  it('concatenates tokens from multiple frames in one chunk', () => {
    const chunk =
      'data: {"choices":[{"delta":{"content":"Hel"}}]}\n' +
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n';
    expect(parseSseChunk(chunk).text).toBe('Hello');
  });

  it('carries an incomplete trailing line over as the remainder', () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hi"}}]}\ndata: {"choic';
    const result = parseSseChunk(chunk);
    expect(result.text).toBe('Hi');
    expect(result.remainder).toBe('data: {"choic');
  });

  it('reports done on a [DONE] frame and stops before reading further', () => {
    const chunk = 'data: [DONE]\ndata: {"choices":[{"delta":{"content":"ignored"}}]}\n';
    const result = parseSseChunk(chunk);
    expect(result.done).toBe(true);
    expect(result.text).toBe('');
  });

  it('ignores malformed JSON lines instead of throwing', () => {
    const chunk = 'data: not-json\ndata: {"choices":[{"delta":{"content":"ok"}}]}\n';
    expect(() => parseSseChunk(chunk)).not.toThrow();
    expect(parseSseChunk(chunk).text).toBe('ok');
  });

  it('ignores lines that are not SSE data frames', () => {
    const chunk = ': keep-alive comment\ndata: {"choices":[{"delta":{"content":"ok"}}]}\n';
    expect(parseSseChunk(chunk).text).toBe('ok');
  });
});
