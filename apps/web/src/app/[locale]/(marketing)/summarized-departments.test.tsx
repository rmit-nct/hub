import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The component uses the i18n-aware Link, which needs an intl provider at
// runtime; mock it to a plain anchor for unit rendering.
vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import SummarizedDepartments from './summarized-departments';

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SummarizedDepartments', () => {
  it('renders the Our Departments heading', () => {
    render(<SummarizedDepartments />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.textContent).toContain('Our Departments');
  });

  it('renders all three department names', () => {
    render(<SummarizedDepartments />);
    expect(screen.getAllByText('Technology').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Human Resources').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Marketing').length).toBeGreaterThan(0);
  });

  it('renders a What we do label and a known activity', () => {
    render(<SummarizedDepartments />);
    expect(screen.getAllByText('What we do').length).toBe(3);
    expect(screen.queryByText('Project Development')).toBeTruthy();
  });

  it('renders an Explore CTA linking to each department page', () => {
    render(<SummarizedDepartments />);
    const links = screen.getAllByRole('link');
    const deptLinks = links.filter((l) =>
      l.getAttribute('href')?.includes('/about?department=')
    );
    expect(deptLinks.length).toBeGreaterThanOrEqual(3);
  });

  it('renders department images', () => {
    render(<SummarizedDepartments />);
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(3);
  });
});
