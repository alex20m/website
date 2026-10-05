import { describe, expect, it } from 'vitest';
import { loadExperiences, MOBILE_CHAR_LIMIT } from '@/lib/experiences';

const entry = (title: string, items: string[]) => String.raw`
  \resumeSubheading
  {${title}}{2020 -- 2021}
  {Acme}{Espoo}
  \resumeItemListStart
${items.map((item) => `    \\resumeItem{${item}}`).join('\n')}
  \resumeItemListEnd
`;

describe('loadExperiences', () => {
  it('cuts a long description down to a preview and marks the entry as truncatable', () => {
    const long = 'word '.repeat(40).trim(); // 199 characters, well over the limit
    const [exp] = loadExperiences(entry('Engineer', [long]));

    expect(exp?.description).toEqual([long]);
    expect(exp?.truncatable).toBe(true);
    expect(exp?.preview).toHaveLength(1);
    expect(exp?.preview[0]).toMatch(/^(word )*word\.\.\.$/);
    expect(exp?.preview[0]?.length).toBeLessThanOrEqual(MOBILE_CHAR_LIMIT + 3);
  });

  it('keeps a short description whole and not truncatable', () => {
    const [exp] = loadExperiences(entry('Engineer', ['Built things.']));

    expect(exp?.preview).toEqual(['Built things.']);
    expect(exp?.truncatable).toBe(false);
  });

  it('keeps entries in document order', () => {
    const resume = entry('First', ['a']) + entry('Second', ['b']);
    expect(loadExperiences(resume).map((e) => e.title)).toEqual(['First', 'Second']);
  });

  it('reads the real resume when none is given', () => {
    const entries = loadExperiences();
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) expect(e.title).not.toBe('');
  });
});
