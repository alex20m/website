import { describe, expect, it } from 'vitest';
import latexResume from '@/data/latexResume';
import { parseLatexExperience } from '@/lib/parseLatexExperience';
import { SYSTEM_PROMPT } from '@/lib/systemPrompt';

const experiences = parseLatexExperience(latexResume);

describe('experience matches the current CV', () => {
  it('lists the CV roles newest first', () => {
    expect(experiences.map((e) => `${e.title} | ${e.company} | ${e.period}`)).toEqual([
      'Consultant | Netlight | Oct 2026 - Present',
      'AI & Cloud Developer | KONE | Jun 2026 - Sep 2026',
      "Master's Thesis Worker | KONE | Jan 2026 - May 2026",
      'Software Engineer | KONE | May 2025 - Dec 2025',
      'Software Engineer | Danfoss Drives | May 2024 - Aug 2024',
      'Automation Engineer | Wärtsilä | May 2022 - Aug 2023',
      'Teaching Assistant | Aalto University | Sep 2022 - Dec 2022',
    ]);
  });

  it('places Netlight in Helsinki with its single CV bullet', () => {
    expect(experiences[0]).toMatchObject({
      location: 'Helsinki, Finland',
      description: ['Software engineering consulting'],
    });
  });

  it('keeps the CV wording of the KONE AI & Cloud Developer bullets', () => {
    expect(experiences[1]?.description).toEqual([
      'Owned end-to-end design and implementation of an AI assistant for a company-wide internal AI portal',
      'Designed a LangGraph orchestrator agent coordinating specialized subagents on AWS Bedrock AgentCore',
      'Built subagents using RAG and MCP tools to help employees find knowledge and take actions via chat',
      'Designed and built the chat as a full-stack Next.js and React application, streaming agent responses in real time',
      'Owned agent-side DevOps: CI/CD, tests, response quality evals, AWS CDK infrastructure and observability',
    ]);
  });

  it('drops the "Intern" title suffixes the CV no longer uses', () => {
    expect(experiences.some((e) => e.title.includes('Intern'))).toBe(false);
  });
});

describe('AI assistant knowledge matches the current CV', () => {
  it.each([
    'Consultant - Netlight',
    'Oct 2026 - Present, Helsinki, Finland',
    'AI & Cloud Developer - KONE',
    'Jun 2026 - Sep 2026',
    'LangGraph',
    'Strands SDK',
    'Microsoft Foundry',
    'AWS CDK',
    'Open Telemetry',
    'Led test migration from Selenium to Playwright',
    'safety-critical temperature control firmware',
    'Jan 2025 - Present',
    'Sep 2021 - Jan 2025',
    'Teaching Assistant - Aalto University',
  ])('mentions %s', (fact) => {
    expect(SYSTEM_PROMPT).toContain(fact);
  });

  it.each(['Intern - KONE', 'Jun 2026 - Present, Espoo', 'Azure AI Foundry'])(
    'no longer mentions the outdated %s',
    (stale) => {
      expect(SYSTEM_PROMPT).not.toContain(stale);
    },
  );
});
