import type { TestInfo } from '@playwright/test';

/**
 * Whether the current test is running under the `mobile` Playwright project
 * (see playwright.config.ts). Section components branch their rendering on
 * `useIsMobile()`, which itself is viewport-driven, so several assertions
 * (hamburger vs. full nav, truncated vs. full experience bullets) legitimately
 * differ by project rather than being a bug in one of them.
 */
export function isMobileProject(testInfo: TestInfo): boolean {
  return testInfo.project.name === 'mobile';
}

/** Section ids in document order, matching PortfolioApp.tsx. */
export const SECTION_IDS = ['about', 'chat', 'experience', 'projects', 'cv', 'contact'] as const;

/** Nav label -> section id, matching Navbar.tsx's `navItems`. */
export const NAV_ITEMS: { label: string; id: (typeof SECTION_IDS)[number] }[] = [
  { label: 'About', id: 'about' },
  { label: 'Ask AI', id: 'chat' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'CV', id: 'cv' },
  { label: 'Contact', id: 'contact' },
];
