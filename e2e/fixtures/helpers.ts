import type { Page, TestInfo } from '@playwright/test';
import { expect } from './test';

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

/**
 * The two layouts the site has, as context options. The Playwright projects
 * start each test in one of them; a test about a layout other than its
 * project's default says so with `test.use(PHONE)` or `test.use(DESKTOP)`, so
 * every layout-specific behaviour is exercised under both projects instead of
 * being skipped under one.
 */
export const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } as const;
export const DESKTOP = { viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false } as const;

/**
 * Waits until the page shows the layout its viewport calls for, before a test
 * taps something.
 *
 * The server renders the desktop layout, and `useIsMobile()` only switches a
 * phone to its own layout once the page has hydrated, so on a phone every
 * control jumps shortly after load. A tap that lands during that jump hits
 * where the control used to be and does nothing, which shows up as an
 * intermittently failing test. The About block's flex direction is the
 * marker: a row on desktop, a column once the phone layout is applied.
 * The thresholds are the ones `useIsMobile()` uses.
 */
export async function waitForFinalLayout(page: Page): Promise<void> {
  const { width, height } = page.viewportSize()!;
  const phone = width < 768 || height < 500;
  await expect(page.locator('#about .MuiContainer-root > div')).toHaveCSS('flex-direction', phone ? 'column' : 'row');
}
