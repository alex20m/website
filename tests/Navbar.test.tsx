// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

afterEach(() => {
  cleanup();
  document.querySelectorAll('[data-test-section]').forEach((el) => el.remove());
  vi.restoreAllMocks();
});

/** A stand-in for one of PortfolioApp's <Section id="..."> targets. */
function addSectionTarget(id: string) {
  const el = document.createElement('div');
  el.id = id;
  el.setAttribute('data-test-section', '');
  document.body.appendChild(el);
  return el;
}

// vitest.setup.ts's matchMedia polyfill always reports `matches: false`, so
// useIsMobile() is false here without any mocking — this file covers the
// desktop nav bar. See Navbar.mobile.test.tsx for the hamburger/drawer.
describe('Navbar on desktop', () => {
  it('renders a clickable nav button for every section', () => {
    render(<Navbar />);
    for (const label of ['About', 'Ask AI', 'Experience', 'Projects', 'CV', 'Contact']) {
      expect(screen.getByRole('button', { name: label })).toBeVisible();
    }
  });

  it('has no "Open navigation menu" hamburger button', () => {
    render(<Navbar />);
    expect(screen.queryByRole('button', { name: 'Open navigation menu' })).not.toBeInTheDocument();
  });

  it('scrolls smoothly to a section, offset for the fixed header, when its nav button is clicked', () => {
    addSectionTarget('experience');
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    render(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Experience' }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });

  it('scrolls to the top of the page when the wordmark is clicked', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    render(<Navbar />);
    fireEvent.click(screen.getByRole('heading', { level: 6, name: 'Alex Mecklin' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('does nothing when a nav button targets a section that is not on the page', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    render(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Contact' }));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});
