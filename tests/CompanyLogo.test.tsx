// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CompanyLogo from '@/components/sections/CompanyLogo';

// Nothing in this project's vitest config enables RTL's framework-detected
// auto-cleanup (that needs `test.globals: true`), so each render() here
// leaves its DOM in place for the next test unless cleaned up explicitly —
// which silently turns every `not.toBeInTheDocument()` below into a false
// pass (or a "multiple elements" error) once more than one test has rendered.
afterEach(cleanup);

describe('CompanyLogo', () => {
  it('renders the logo image with the expected src and alt text', () => {
    render(<CompanyLogo company="KONE" />);
    const img = screen.getByRole('img', { name: 'KONE' });
    expect(img).toHaveAttribute('src', '/logos/kone.png');
  });

  it('hides itself when the image errors after mount', () => {
    render(<CompanyLogo company="KONE" />);
    const img = screen.getByRole('img', { name: 'KONE' });

    // fireEvent (not a raw dispatchEvent) wraps the dispatch in act(), so the
    // resulting setState is flushed before the assertion below runs.
    fireEvent.error(img);

    expect(screen.queryByRole('img', { name: 'KONE' })).not.toBeInTheDocument();
  });

  it('hides itself when the image already failed before hydration attached the error listener', () => {
    // The <img> is present in server-rendered HTML, so on a real page the
    // browser can start — and finish — loading it before React hydrates and
    // wires up `onError`. Because a resource `error` event doesn't bubble
    // and never replays, that race silently loses the event. This simulates
    // the browser having already settled the image as failed (complete,
    // zero natural width) by the time CompanyLogo's own mount effect runs,
    // matching what a fast 404 racing hydration looks like.
    const original = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete');
    Object.defineProperty(HTMLImageElement.prototype, 'complete', { configurable: true, get: () => true });

    try {
      render(<CompanyLogo company="KONE" />);
      expect(screen.queryByRole('img', { name: 'KONE' })).not.toBeInTheDocument();
    } finally {
      if (original) Object.defineProperty(HTMLImageElement.prototype, 'complete', original);
    }
  });
});
