import { describe, expect, it } from 'vitest';
import { sandboxChromium, STABLE_SANDBOX_CHROMIUM } from '@/e2e/sandboxChromium';

const nothingExists = () => false;
const everythingExists = () => true;
/** A sandbox whose pre-installed browser lives only at the given paths. */
const onlyExists =
  (...paths: string[]) =>
  (p: string) =>
    paths.includes(p);

describe('which Chromium the e2e suite launches', () => {
  it('uses the sandbox\'s stable symlink, not a revision directory that disappears when the image updates', () => {
    // The previous config pinned /opt/pw-browsers/chromium-1194/…; once the
    // sandbox shipped chromium-1243 instead, every local e2e run failed with
    // "Executable doesn't exist".
    expect(STABLE_SANDBOX_CHROMIUM).toBe('/opt/pw-browsers/chromium');
    expect(sandboxChromium({}, onlyExists('/opt/pw-browsers/chromium'))).toBe('/opt/pw-browsers/chromium');
  });

  it('prefers an explicitly configured executable over the sandbox default', () => {
    expect(
      sandboxChromium({ PLAYWRIGHT_CHROMIUM_EXECUTABLE: '/custom/chrome' }, onlyExists('/custom/chrome', '/opt/pw-browsers/chromium')),
    ).toBe('/custom/chrome');
  });

  it('refuses a configured executable that does not exist, instead of failing later at launch', () => {
    expect(() => sandboxChromium({ PLAYWRIGHT_CHROMIUM_EXECUTABLE: '/typo/chrome' }, nothingExists)).toThrow(
      'PLAYWRIGHT_CHROMIUM_EXECUTABLE points at /typo/chrome, which does not exist',
    );
  });

  it('falls back to Playwright\'s own download when no sandbox browser is installed', () => {
    expect(sandboxChromium({}, nothingExists)).toBeUndefined();
  });

  it('leaves CI on the browser it installs itself, even where a sandbox browser exists', () => {
    expect(sandboxChromium({ CI: 'true' }, everythingExists)).toBeUndefined();
    expect(sandboxChromium({ CI: 'true', PLAYWRIGHT_CHROMIUM_EXECUTABLE: '/custom/chrome' }, everythingExists)).toBeUndefined();
  });
});
