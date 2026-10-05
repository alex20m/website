/**
 * Coverage for the end-to-end suite: V8 coverage collected from the real
 * browser, mapped back through the build's source maps to our own files.
 *
 * The gate is on every module that runs in the browser: each file that starts
 * with 'use client' under `app/`, `components/` or `hooks/`, and every local
 * module those files import (followed transitively). Each one must appear in
 * the report — a file the suite never loaded is absent from V8's data, and an
 * absent file would otherwise read as nothing to cover — and be at 100 % of
 * statements, branches, functions and lines.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import type { CoverageReportOptions } from 'monocart-coverage-reports';

export const ROOT = join(__dirname, '..');
const BROWSER_DIRS = ['app', 'components', 'hooks'];
const SOURCE = /\.(tsx?|jsx?)$/;

/** The Playwright projects (viewports) the gate holds to 100 % separately. */
export const PROJECTS = ['desktop', 'mobile'] as const;

/**
 * The projects this run is gating. The CI jobs run one project each, so the
 * npm scripts say which one through E2E_PROJECTS; with nothing set, both.
 */
export function projectsUnderTest(env: NodeJS.ProcessEnv = process.env): string[] {
  return (env.E2E_PROJECTS || PROJECTS.join(',')).split(',').map((p) => p.trim());
}

/** One report per project, so what one viewport leaves unrun cannot be filled in by the other. */
export function coverageOptions(project: string): CoverageReportOptions {
  return {
    name: `End-to-end UI coverage (${project})`,
    outputDir: join(ROOT, 'coverage-e2e', project),
    reports: ['v8', 'console-details', 'json-summary'],
    // Only our app's chunks; never the framework's runtime or third parties.
    entryFilter: (entry) => entry.url.includes('/_next/static/'),
    sourceFilter: (sourcePath) => browserModules().includes(normalize(sourcePath)),
    sourcePath: (filePath) => normalize(filePath),
    // `v8 ignore` comments would let a gap be declared covered. They do nothing here.
    v8Ignore: false,
  };
}

/** Source map paths arrive in bundler-specific shapes; reduce them to repo-relative paths. */
export function normalize(sourcePath: string): string {
  const cleaned = sourcePath.replace(/^(webpack|turbopack):\/\/[^/]*\//, '').replace(/^\[project\]\//, '');
  const dirs = [...BROWSER_DIRS, 'lib', 'data'];
  const at = dirs.map((d) => cleaned.indexOf(`${d}/`)).filter((i) => i >= 0);
  return at.length ? cleaned.slice(Math.min(...at)) : cleaned;
}

const cached = new Map<string, string[]>();

/**
 * Every source file that runs in the browser: the files the gate holds to
 * 100 %. Found from disk rather than from the coverage data, because a file
 * no test loaded is missing from that data entirely.
 */
export function browserModules(root = ROOT): string[] {
  if (!cached.has(root)) {
    const roots = BROWSER_DIRS.flatMap((dir) => walk(join(root, dir)))
      .filter((file) => SOURCE.test(file))
      .filter((file) => /^\s*['"]use client['"]/.test(readFileSync(file, 'utf8')));
    const reached = new Set<string>();
    const queue = [...roots];
    while (queue.length) {
      const file = queue.pop()!;
      if (reached.has(file)) continue;
      reached.add(file);
      queue.push(...localImports(file, root));
    }
    cached.set(root, [...reached].map((file) => relative(root, file)).sort());
  }
  return cached.get(root)!;
}

/** The repo's own modules a file imports at run time (`import type` is erased by the compiler). */
function localImports(file: string, root: string): string[] {
  const text = readFileSync(file, 'utf8');
  const specifiers = [...text.matchAll(/^\s*(?:import|export)\s+(?!type\b)[^'"]*?from\s+['"]([^'"]+)['"]/gm)].map(
    (m) => m[1]!,
  );
  return specifiers.flatMap((spec) => {
    const base = spec.startsWith('@/') ? join(root, spec.slice(2)) : spec.startsWith('.') ? resolve(dirname(file), spec) : null;
    if (!base) return [];
    const found = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'].map((ext) => base + ext).find((p) => existsSync(p) && statSync(p).isFile());
    return found ? [found] : [];
  });
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

type Metrics = { pct: number | ''; covered: number; total: number };
export type FileResult = {
  sourcePath: string;
  summary: Record<'statements' | 'branches' | 'functions' | 'lines', Metrics>;
  /** The original source, which branch offsets point into. */
  source?: string;
  data?: {
    /** Per line: hits, 0 when never run, or a string when only partly run. */
    lines?: Record<string, number | string>;
    /** Offsets into `source`; `count: 0` is a branch never taken. */
    branches?: { start: number; end: number; count: number }[];
  };
};

/** Where each untaken branch starts, as line:column — a branch can be untaken on a line that otherwise ran. */
function untakenBranches(file: FileResult): string[] {
  const source = file.source ?? '';
  return (file.data?.branches ?? [])
    .filter((b) => b.count === 0)
    .map((b) => {
      const before = source.slice(0, b.start).split('\n');
      return `${before.length}:${before[before.length - 1]!.length + 1}`;
    });
}

/** The lines of a file that were not run, or not run down every branch: "12, 40-42 (partly: 17)". */
function gaps(file: FileResult): string {
  const lines = Object.entries(file.data?.lines ?? {});
  const never = lines.filter(([, hits]) => hits === 0).map(([n]) => Number(n));
  const partly = lines.filter(([, hits]) => typeof hits === 'string').map(([n]) => Number(n));
  const ranges = (ns: number[]) =>
    ns
      .sort((x, y) => x - y)
      .reduce<[number, number][]>((acc, n) => {
        const last = acc[acc.length - 1];
        if (last && n === last[1] + 1) last[1] = n;
        else acc.push([n, n]);
        return acc;
      }, [])
      .map(([x, y]) => (x === y ? `${x}` : `${x}-${y}`))
      .join(', ');
  const branches = untakenBranches(file);
  return [
    never.length ? `lines ${ranges(never)}` : '',
    partly.length ? `partly: ${ranges(partly)}` : '',
    branches.length ? `branch not taken at ${branches.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('; ');
}

/** What falls short of 100 %, as lines a person can act on. Empty means the gate passes. */
export function shortfalls(files: FileResult[], required: string[]): string[] {
  const problems: string[] = [];
  const seen = new Map(files.map((f) => [f.sourcePath, f]));
  for (const path of required) {
    const file = seen.get(path);
    if (!file) {
      problems.push(`${path}: never loaded by any end-to-end test`);
      continue;
    }
    const short = (['statements', 'branches', 'functions', 'lines'] as const)
      .filter((metric) => file.summary[metric].covered !== file.summary[metric].total)
      .map((metric) => `${metric} ${file.summary[metric].covered}/${file.summary[metric].total}`);
    if (short.length) {
      const where = gaps(file);
      problems.push(`${path}: ${short.join(', ')}${where ? ` — ${where}` : ''}`);
    }
  }
  return problems;
}
