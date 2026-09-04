// @vitest-environment jsdom
//
// The real bug lived in an inline `style` attribute (isMobile ? 'flex' :
// 'none'), not in text content — and React's hydration mismatch handling
// treats those very differently in production. A text-content mismatch
// still throws and forces a corrective re-render in production (matching
// dev, just without the console warning), but an attribute mismatch like
// `style`/`class` is silently kept as the server rendered it — production
// skips the dev-only diffing that would otherwise patch it. So the probe
// here renders a style attribute, exactly like Navbar's `sx={{ display }}`,
// and this test forces react-dom's production build via NODE_ENV so it
// actually exercises that code path.
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { createElement as CreateElement } from 'react';
import type { renderToString as RenderToString } from 'react-dom/server';
import type { hydrateRoot as HydrateRoot, Root } from 'react-dom/client';

// `act` isn't exported from React's production bundle (it's a testing-only
// helper), so — deliberately, since this test needs the production hydration
// behavior — effects are flushed with a plain microtask/macrotask wait below
// instead.
let createElement: typeof CreateElement;
let renderToString: typeof RenderToString;
let hydrateRoot: typeof HydrateRoot;
let useIsMobile: typeof import('@/hooks/useIsMobile').default;

function Probe() {
  const isMobile = useIsMobile();
  return createElement('div', {
    'data-testid': 'probe',
    style: { display: isMobile ? 'flex' : 'none' },
  });
}

function mockMatchMedia(matches: boolean) {
  return (query: string): MediaQueryList =>
    ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

describe('useIsMobile across a real server-render + hydrate cycle', () => {
  let root: Root | undefined;
  let container: HTMLElement | undefined;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    ({ createElement } = await import('react'));
    ({ renderToString } = await import('react-dom/server'));
    ({ hydrateRoot } = await import('react-dom/client'));
    ({ default: useIsMobile } = await import('@/hooks/useIsMobile'));
  });

  afterEach(() => {
    root?.unmount();
    container?.remove();
    root = undefined;
    container = undefined;
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('adopts a real mobile viewport once mounted, instead of getting stuck on the server-guessed desktop layout', async () => {
    // The server has no window, so it always renders the desktop guess —
    // exactly like a real Next.js SSR pass.
    const realWindow = globalThis.window;
    // @ts-expect-error -- deliberately simulating an environment with no window
    delete globalThis.window;
    const html = renderToString(createElement(Probe));
    expect(html).toContain('display:none');
    globalThis.window = realWindow;

    // The browser hydrating that markup has a real mobile viewport.
    window.matchMedia = mockMatchMedia(true);

    container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    root = hydrateRoot(container, createElement(Probe));
    // Let hydration and any post-mount store-sync effects flush.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const probe = container.querySelector<HTMLElement>('[data-testid="probe"]');
    expect(probe?.style.display).toBe('flex');
  });
});
