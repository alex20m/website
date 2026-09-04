import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const PORT = process.env.PLAYWRIGHT_PORT ? Number(process.env.PLAYWRIGHT_PORT) : 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

// This sandbox ships a pre-fetched Chromium at a revision that doesn't match
// every @playwright/test version's expected download, so local runs point at
// it directly instead of triggering (and failing) a network download. CI
// always installs its own matching browser via `playwright install`, so this
// never applies there.
const sandboxChromium = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const executablePath = !process.env.CI && existsSync(sandboxChromium) ? sandboxChromium : undefined;

// Chromium refuses to run its own sandbox as root (common for containerized
// dev sandboxes, not for CI runners, which run unprivileged) — detect that
// rather than disabling the sandbox unconditionally.
const runningAsRoot = process.platform !== 'win32' && typeof process.getuid === 'function' && process.getuid() === 0;
const launchOptions = {
  ...(executablePath ? { executablePath } : {}),
  ...(runningAsRoot ? { args: ['--no-sandbox'] } : {}),
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // GitHub's standard ubuntu-latest runners have 2 vCPUs; a higher worker
  // count there oversubscribes and trades flakiness for a small speedup.
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: Object.keys(launchOptions).length ? launchOptions : undefined,
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        // devices['iPhone 13'] defaults to WebKit (real Safari uses it) — CI
        // only installs Chromium (see the pull-request workflow), so pin the
        // engine explicitly and keep just the device's viewport/UA/touch
        // emulation. Both projects then exercise the same rendering engine,
        // which is the point of running "mobile" at all: catching layout
        // bugs from the narrow viewport and isMobile branch, not from a
        // different browser.
        browserName: 'chromium',
        launchOptions: Object.keys(launchOptions).length ? launchOptions : undefined,
      },
    },
  ],
});
