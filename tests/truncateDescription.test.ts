import { describe, expect, it } from 'vitest';
import { truncateDescription } from '@/lib/truncateDescription';

describe('truncateDescription', () => {
  it('returns the items unchanged when the joined text already fits the limit', () => {
    const items = ['Short bullet.'];
    expect(truncateDescription(items, 100)).toEqual(items);
  });

  it('drops items entirely once the character budget is spent', () => {
    const items = ['12345', '67890', 'abcdefghij'];
    // Budget of 10 exactly consumes the first two items; the third is dropped.
    expect(truncateDescription(items, 10)).toEqual(['12345', '67890']);
  });

  it('truncates the overflowing item at the last complete word', () => {
    const items = ['one two three four five'];
    const result = truncateDescription(items, 10);
    expect(result).toEqual(['one two...']);
  });

  it('cuts mid-word when the limit falls before the first space', () => {
    const items = ['supercalifragilisticexpialidocious'];
    const result = truncateDescription(items, 5);
    expect(result).toEqual(['super...']);
  });
});
