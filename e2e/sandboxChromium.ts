/**
 * The cloud sandbox ships a pre-installed Chromium that need not match the
 * revision this repo's @playwright/test expects to download. This path is a
 * symlink the sandbox keeps pointing at whichever revision it has installed,
 * so it survives image updates. The revision directories behind it
 * (`chromium-1194`, `chromium-1243`, …) do not: pinning one of those broke
 * every local e2e run as soon as the image moved on.
 */
export const STABLE_SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';

/**
 * The Chromium binary to launch instead of Playwright's own download, or
 * `undefined` to let Playwright use the browser it installed.
 *
 * - On CI: always `undefined`. CI runs `playwright install`, so its browser
 *   matches the Playwright version exactly.
 * - `PLAYWRIGHT_CHROMIUM_EXECUTABLE`, if set: that path, for a machine whose
 *   browser lives somewhere else. A path that does not exist throws here,
 *   where the cause is obvious, rather than at launch in every test.
 * - Otherwise: the sandbox's stable symlink, if there is one.
 */
export function sandboxChromium(
  env: Record<string, string | undefined>,
  exists: (path: string) => boolean,
): string | undefined {
  if (env.CI) return undefined;
  const configured = env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (configured) {
    if (!exists(configured)) {
      throw new Error(`PLAYWRIGHT_CHROMIUM_EXECUTABLE points at ${configured}, which does not exist`);
    }
    return configured;
  }
  return exists(STABLE_SANDBOX_CHROMIUM) ? STABLE_SANDBOX_CHROMIUM : undefined;
}
