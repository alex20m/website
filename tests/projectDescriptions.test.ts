import { describe, expect, it } from 'vitest';
import projects from '@/data/projects';
import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

describe('Rental Tracker description', () => {
  const rental = projects.find((p) => p.title === 'Rental Tracker');

  it('contains no dashes on the project card', () => {
    expect(rental).toBeDefined();
    expect(rental!.description).not.toMatch(/[—–]/);
  });

  it('is described without dashes in the chat system prompt', () => {
    const section = SYSTEM_PROMPT.split('### Rental Tracker')[1]?.split('###')[0] ?? '';
    expect(section).not.toBe('');
    expect(section).not.toMatch(/[—–]/);
  });
});
