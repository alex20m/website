import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

/**
 * The pipeline's shape is behaviour, so it is asserted rather than eyeballed.
 *
 * Nothing here is reviewed by a human, so dropping `npm test` from the checks,
 * or adding a job that deploys the Next.js app itself, produces a pipeline
 * that is green and worthless — and no other test notices, because every
 * other test runs *inside* the job that was bypassed.
 *
 * Keep these when the workflows change. Each one has a one-line edit that
 * turns it red; that is the point.
 */

type Step = { name?: string; run?: string; if?: string; id?: string };
type Job = { steps?: Step[]; needs?: string | string[] };
type Workflow = {
  on?: Record<string, { branches?: string[] } | null>;
  permissions?: Record<string, string>;
  jobs: Record<string, Job>;
};

const PULL_REQUEST = 'pull-request.yml';
const MAIN = 'main.yml';

function read(relative: string): string {
  return readFileSync(fileURLToPath(new URL(`../${relative}`, import.meta.url)), 'utf8');
}

const sources: Record<string, string> = {
  [PULL_REQUEST]: read(`.github/workflows/${PULL_REQUEST}`),
  [MAIN]: read(`.github/workflows/${MAIN}`),
};

const workflows: Record<string, Workflow> = Object.fromEntries(
  Object.entries(sources).map(([file, text]) => [file, parse(text) as Workflow]),
);

/** Fails loudly on a renamed file rather than quietly asserting about nothing. */
function workflowOf(file: string): Workflow {
  const workflow = workflows[file];
  if (workflow === undefined) {
    throw new Error(`no workflow "${file}" (found: ${Object.keys(workflows).join(', ')})`);
  }
  return workflow;
}

/** Looks up a job by id, throwing with the real id list rather than reading as `undefined`. */
function jobOf(workflow: Workflow, jobId: string): Job {
  const job = workflow.jobs[jobId];
  if (job === undefined) {
    throw new Error(`no job "${jobId}" (found: ${Object.keys(workflow.jobs).join(', ')})`);
  }
  return job;
}

function commandsOf(workflow: Workflow, jobId: string): string {
  return (jobOf(workflow, jobId).steps ?? []).map((step) => step.run ?? '').join('\n');
}

/** Jobs that would push a build of the Next.js app to Vercel, found by what they run. */
function deployingJobIds(workflow: Workflow): string[] {
  return Object.keys(workflow.jobs).filter((id) =>
    /\bvercel(?:@\S+)?\s+(?:deploy|build)\b/.test(commandsOf(workflow, id)),
  );
}

describe('workflow triggers', () => {
  it('runs the pull-request workflow only on pull requests', () => {
    // Parsed under YAML 1.2, so `on:` stays a string rather than collapsing to
    // the boolean `true` that YAML 1.1 would give.
    expect(Object.keys(workflowOf(PULL_REQUEST).on ?? {})).toEqual(['pull_request']);
  });

  it('runs the main workflow only on pushes to main and on demand', () => {
    const triggers = workflowOf(MAIN).on ?? {};
    expect(Object.keys(triggers).sort()).toEqual(['push', 'workflow_dispatch']);
    expect(triggers.push?.branches).toEqual(['main']);
  });

  it('grants both workflows read-only access by default', () => {
    for (const [file, workflow] of Object.entries(workflows)) {
      expect(workflow.permissions, `${file} must be read-only by default`).toEqual({
        contents: 'read',
      });
    }
  });
});

describe('the checks', () => {
  it('install from the lockfile rather than resolving fresh versions', () => {
    for (const [file, workflow] of Object.entries(workflows)) {
      const commands = commandsOf(workflow, 'verify');
      expect(commands, `${file} must install from the lockfile`).toContain('npm ci');
      expect(commands, `${file} must not resolve fresh versions`).not.toMatch(/npm install\b/);
    }
  });

  it('lint, typecheck, test and build in both workflows', () => {
    // A pull request and the merge of that same pull request are held to
    // identical checks.
    for (const [file, workflow] of Object.entries(workflows)) {
      const commands = commandsOf(workflow, 'verify');
      expect(commands, `${file} must lint`).toContain('npm run lint');
      expect(commands, `${file} must typecheck`).toContain('npm run typecheck');
      expect(commands, `${file} must test`).toContain('npm test');
      expect(commands, `${file} must build`).toContain('npm run build');
    }
  });

  it('report every failing check in one run instead of stopping at the first', () => {
    for (const [file, workflow] of Object.entries(workflows)) {
      const checks = (jobOf(workflow, 'verify').steps ?? []).filter((step) =>
        /npm (?:test|run (?:lint|typecheck|build))/.test(step.run ?? ''),
      );
      expect(checks.length, `${file} must run four checks`).toBeGreaterThanOrEqual(4);
      for (const step of checks) {
        expect(step.if, `${file}: "${step.name}" must run after an earlier failure`).toBe(
          '${{ !cancelled() }}',
        );
      }
    }
  });
});

describe('deploying', () => {
  it('recognises a job that would deploy the Next.js app to Vercel', () => {
    // Matches nothing by design, so it would pass vacuously if the detector
    // broke — a regex for `vercel deploy` does not match `npx vercel@latest
    // deploy`. This proves the detector still fires.
    const fixture = parse(
      ['jobs:', '  ship:', '    steps:', '      - run: npx --yes vercel@latest deploy --prebuilt --prod'].join('\n'),
    ) as Workflow;

    expect(deployingJobIds(fixture)).toEqual(['ship']);
  });

  it('leaves deploying the website to the platform', () => {
    // Vercel's Git integration is the one route to production; a workflow job
    // that also runs `vercel deploy` would race it and ship everything twice.
    for (const [file, workflow] of Object.entries(workflows)) {
      expect(deployingJobIds(workflow), `${file} must not deploy the Next.js app`).toEqual([]);
    }
  });

  it('keeps Vercel credentials out of the workflows entirely', () => {
    for (const [file, text] of Object.entries(sources)) {
      expect(text, `${file} must not reference Vercel deploy credentials`).not.toMatch(
        /VERCEL_(?:TOKEN|ORG_ID|PROJECT_ID)/,
      );
    }
  });

  it('deploys the chat worker only after the checks pass', () => {
    // The single most valuable assertion for a deploy-adjacent job: it is
    // what stops an untested commit from reaching Cloudflare.
    const needs = jobOf(workflowOf(MAIN), 'deploy-worker').needs;
    expect(needs === 'verify' || (Array.isArray(needs) && needs.includes('verify'))).toBe(true);
  });

  it('degrades the worker deploy to a skip when its credential is missing', () => {
    // Secrets cannot be evaluated in a job-level `if:`, so the pattern is a
    // step that reads the secret and writes an output, with later steps
    // conditioned on that output — never on the secret directly.
    const steps = jobOf(workflowOf(MAIN), 'deploy-worker').steps ?? [];
    const check = steps.find((step) => (step.run ?? '').includes('GITHUB_OUTPUT'));
    expect(check, 'deploy-worker must have a step that reports whether it is configured').toBeDefined();
    expect(check?.run).toMatch(/CLOUDFLARE_API_TOKEN/);

    const deploySteps = steps.filter((step) => /\bwrangler(?:@\S+)?\s+deploy\b/.test(step.run ?? ''));
    expect(deploySteps.length, 'deploy-worker must actually deploy somewhere').toBeGreaterThan(0);
    for (const step of deploySteps) {
      expect(step.if, 'the deploy step must be guarded on the credential-check output').toMatch(
        /steps\.\w+\.outputs\.configured/,
      );
    }
  });
});
