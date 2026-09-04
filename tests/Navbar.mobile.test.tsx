// @vitest-environment jsdom
//
// vi.mock is hoisted to the top of the module by vitest's transform, so it
// applies to every test in this file (not just one describe block) — that's
// exactly why this is a separate file from Navbar.test.tsx rather than a
// nested describe: the two can't share a module-level mock of the same hook
// with different return values.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Navbar from '@/components/Navbar';

vi.mock('@/hooks/useIsMobile', () => ({ default: () => true }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Navbar on mobile', () => {
  it('shows a hamburger button and no nav buttons up front', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();
    for (const label of ['About', 'Ask AI', 'Experience', 'Projects', 'CV', 'Contact']) {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    }
  });

  it('opens a drawer listing every section when the hamburger is clicked', () => {
    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));

    for (const label of ['About', 'Ask AI', 'Experience', 'Projects', 'CV', 'Contact']) {
      expect(screen.getByRole('button', { name: label })).toBeVisible();
    }
  });

  it('scrolls to the selected section and closes the drawer when a drawer link is clicked', () => {
    const target = document.createElement('div');
    target.id = 'cv';
    document.body.appendChild(target);
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    render(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    fireEvent.click(screen.getByRole('button', { name: 'CV' }));

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
    // Not asserted here: MUI's Drawer keeps its content mounted through an
    // exit transition, which jsdom never actually runs/completes, so a
    // "closed" check would either be vacuous or hang. e2e/navbar.spec.ts's
    // "on mobile" suite covers the real close-on-select behavior in a real
    // browser, which is the level that can actually observe it.

    target.remove();
  });
});
