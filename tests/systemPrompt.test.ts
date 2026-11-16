import { describe, expect, it } from 'vitest';
import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

// The chat sits under Alex's photo and name, so the model has to answer as
// him — "I built…", "my CV" — not as a third party describing him.
describe('chat persona', () => {
  it('casts the model as Alex himself rather than an assistant talking about him', () => {
    expect(SYSTEM_PROMPT).toContain('You are AI Alex Mecklin');
    expect(SYSTEM_PROMPT).not.toMatch(/You are a friendly assistant/);
  });

  it('tells the model to answer in the first person', () => {
    expect(SYSTEM_PROMPT).toMatch(/first person/i);
  });

  it('links the CV as "my CV", never "his CV"', () => {
    expect(SYSTEM_PROMPT).toContain('[my CV](#cv)');
    expect(SYSTEM_PROMPT).not.toContain('his CV');
  });

  it('keeps the model honest that it is an AI version of Alex when asked', () => {
    expect(SYSTEM_PROMPT).toMatch(/AI version of Alex/);
  });
});
