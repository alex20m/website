import { describe, expect, it } from 'vitest';
import { decodeLatex, parseLatexExperience } from '@/lib/parseLatexExperience';

describe('decodeLatex', () => {
  it('unescapes the LaTeX special characters used in the resume', () => {
    expect(decodeLatex('R\\&D at 50\\% \\_speed\\_ \\#1 \\$rate \\~ish \\^high')).toBe(
      'R&D at 50% _speed_ #1 $rate ~ish ^high',
    );
  });
});

describe('parseLatexExperience', () => {
  it('extracts title, company, location, period and bullet items from a subheading', () => {
    const latex = String.raw`
      \resumeSubheading
      {Software Engineer Intern}{May 2024 -- Aug 2024}
      {Danfoss Drives}{Vaasa, Finland}
      \resumeItemListStart
        \resumeItem{Developed automated tests}
        \resumeItem{Built Python scripts}
      \resumeItemListEnd
    `;

    expect(parseLatexExperience(latex)).toEqual([
      {
        title: 'Software Engineer Intern',
        period: 'May 2024 - Aug 2024',
        company: 'Danfoss Drives',
        location: 'Vaasa, Finland',
        description: ['Developed automated tests', 'Built Python scripts'],
      },
    ]);
  });

  it('parses multiple entries in document order', () => {
    const latex = String.raw`
      \resumeSubheading{First Job}{2020 -- 2021}{A Co}{Helsinki}
      \resumeItemListStart\resumeItem{Did a thing}\resumeItemListEnd

      \resumeSubheading{Second Job}{2021 -- 2022}{B Co}{Espoo}
      \resumeItemListStart\resumeItem{Did another thing}\resumeItemListEnd
    `;

    const result = parseLatexExperience(latex);
    expect(result.map((exp) => exp.title)).toEqual(['First Job', 'Second Job']);
  });

  it('ignores commented-out lines', () => {
    const latex = String.raw`
      % \resumeSubheading{Hidden}{2019 -- 2020}{C Co}{Turku}
      % \resumeItemListStart\resumeItem{Should not appear}\resumeItemListEnd
    `;

    expect(parseLatexExperience(latex)).toEqual([]);
  });

  it('returns an empty description list when a subheading has no items', () => {
    const latex = String.raw`\resumeSubheading{No Items}{2018 -- 2019}{D Co}{Oulu}`;

    expect(parseLatexExperience(latex)).toEqual([
      {
        title: 'No Items',
        period: '2018 - 2019',
        company: 'D Co',
        location: 'Oulu',
        description: [],
      },
    ]);
  });
});
