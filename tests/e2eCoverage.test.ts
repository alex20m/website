import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PROJECTS, browserModules, normalize, projectsUnderTest, shortfalls, type FileResult } from '../e2e/coverage';

/**
 * The end-to-end coverage gate runs after every test, so nothing would notice
 * if it stopped failing. These tests fail it on purpose.
 */

const metrics = (covered: number, total: number) => ({ pct: 0, covered, total });
const file = (sourcePath: string, over: Partial<FileResult['summary']> = {}): FileResult => ({
  sourcePath,
  summary: {
    statements: metrics(10, 10),
    branches: metrics(4, 4),
    functions: metrics(2, 2),
    lines: metrics(10, 10),
    ...over,
  },
});

describe('shortfalls', () => {
  it('passes when every required file is fully covered', () => {
    expect(shortfalls([file('components/A.tsx')], ['components/A.tsx'])).toEqual([]);
  });

  it('fails a file that is one branch short, naming the metric', () => {
    const problems = shortfalls([file('components/A.tsx', { branches: metrics(3, 4) })], ['components/A.tsx']);
    expect(problems).toEqual(['components/A.tsx: branches 3/4']);
  });

  it('fails a required file no test ever loaded, instead of treating it as nothing to cover', () => {
    expect(shortfalls([file('components/A.tsx')], ['components/A.tsx', 'components/B.tsx'])).toEqual([
      'components/B.tsx: never loaded by any end-to-end test',
    ]);
  });

  it('points at the line and column of a branch that was never taken', () => {
    const short: FileResult = {
      ...file('components/A.tsx', { branches: metrics(1, 2) }),
      source: 'const a = 1;\nconst b = x ?? y;\n',
      data: { branches: [{ start: 24, end: 25, count: 0 }] },
    };
    expect(shortfalls([short], ['components/A.tsx'])).toEqual([
      'components/A.tsx: branches 1/2 — branch not taken at 2:12',
    ]);
  });

  it('lists the lines that never ran and the ones that ran only partly', () => {
    const short: FileResult = {
      ...file('components/A.tsx', { lines: metrics(7, 10) }),
      data: { lines: { '1': 1, '2': 0, '3': 0, '4': 'partly', '7': 0 } },
    };
    expect(shortfalls([short], ['components/A.tsx'])).toEqual([
      'components/A.tsx: lines 7/10 — lines 2-3, 7; partly: 4',
    ]);
  });

  it('ignores a file that is covered but not required', () => {
    expect(shortfalls([file('components/A.tsx', { branches: metrics(0, 4) })], [])).toEqual([]);
  });
});

describe('normalize', () => {
  it.each([
    ['turbopack:///[project]/components/Navbar.tsx', 'components/Navbar.tsx'],
    ['webpack://_N_E/./components/sections/Chat.tsx', 'components/sections/Chat.tsx'],
    ['webpack://_N_E/./lib/chatStream.ts', 'lib/chatStream.ts'],
    ['turbopack:///[project]/hooks/useIsMobile.ts', 'hooks/useIsMobile.ts'],
  ])('reduces %s to a repo-relative path', (raw, expected) => {
    expect(normalize(raw)).toBe(expected);
  });
});

describe('browserModules', () => {
  const tree = (files: Record<string, string>) => {
    const root = mkdtempSync(join(tmpdir(), 'cov-'));
    for (const [path, text] of Object.entries(files)) {
      mkdirSync(join(root, path, '..'), { recursive: true });
      writeFileSync(join(root, path), text);
    }
    return root;
  };

  it('finds use-client files and the local modules they import, and leaves server files out', () => {
    const root = tree({
      'components/Client.tsx': "'use client';\nimport { x } from '@/lib/helper';\nimport y from './Sibling';\nexport default () => x + y;\n",
      'components/Sibling.tsx': 'export default 1;\n',
      'components/ServerOnly.tsx': 'export default 2;\n',
      'lib/helper.ts': "import { z } from './deeper';\nexport const x = z;\n",
      'lib/deeper.ts': 'export const z = 3;\n',
      'lib/unrelated.ts': 'export const u = 4;\n',
      'app/page.tsx': 'export default function Page() { return null; }\n',
    });
    expect(browserModules(root)).toEqual([
      'components/Client.tsx',
      'components/Sibling.tsx',
      'lib/deeper.ts',
      'lib/helper.ts',
    ]);
  });

  it('does not follow type-only imports, which the compiler erases', () => {
    const root = tree({
      'components/Client.tsx': "'use client';\nimport type { T } from '@/lib/types';\nexport default (t: T) => t;\n",
      'lib/types.ts': 'export type T = string;\n',
    });
    expect(browserModules(root)).toEqual(['components/Client.tsx']);
  });

  it('finds the real browser modules of this app', () => {
    const modules = browserModules();
    expect(modules).toContain('components/Navbar.tsx');
    expect(modules).toContain('hooks/useIsMobile.ts');
    expect(modules).toContain('lib/chatStream.ts');
    // Parsed on the server and passed down as data, so it must not be demanded of the browser.
    expect(modules).not.toContain('lib/parseLatexExperience.ts');
    expect(modules).not.toContain('lib/systemPrompt.ts');
  });
});

describe('projectsUnderTest', () => {
  it('gates both viewports by default', () => {
    expect(projectsUnderTest({} as unknown as NodeJS.ProcessEnv)).toEqual([...PROJECTS]);
  });

  it('gates only the viewport a CI job runs', () => {
    expect(projectsUnderTest({ E2E_PROJECTS: 'mobile' } as unknown as NodeJS.ProcessEnv)).toEqual(['mobile']);
  });
});
