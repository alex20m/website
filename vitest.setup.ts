import '@testing-library/jest-dom/vitest';

// jsdom has no layout engine, so it never implements matchMedia. MUI's
// useMediaQuery calls it unconditionally (even with `noSsr: true`, which only
// skips the *initial guess* — it still queries on mount), so every component
// test that renders anything wrapped in a theme needs this polyfill or it
// throws "matchMedia is not a function" before a single assertion runs.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
