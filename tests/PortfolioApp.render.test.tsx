// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortfolioApp from '@/components/PortfolioApp';

describe('PortfolioApp', () => {
  it('renders every section of the single-page layout', () => {
    render(<PortfolioApp />);

    // Level 2: the About section's headline, not the navbar's h6 wordmark.
    expect(screen.getByRole('heading', { level: 2, name: 'Alex Mecklin' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ask AI' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Experience' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CV' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
  });

  it('lists the navbar links for every section', () => {
    render(<PortfolioApp />);

    for (const label of ['About', 'Ask AI', 'Experience', 'Projects', 'CV', 'Contact']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });
});
