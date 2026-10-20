import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Anton: () => ({ className: 'font-anton' }),
}));

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

import HeroSection from './hero-section';

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

describe('HeroSection', () => {
  it('renders the NEO CULTURE TECH wordmark', () => {
    render(<HeroSection />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toContain('Neo Culture');
    expect(h1.textContent).toContain('Tech');
  });

  it('renders the blinking recruitment status', () => {
    render(<HeroSection />);
    expect(
      screen.getByText('Recruitment now for Semester C - 2026')
    ).toBeTruthy();
  });

  it('renders the Join Now link to recruitment', () => {
    render(<HeroSection />);
    const links = screen.getAllByRole('link');
    expect(
      links.some((l) =>
        l.getAttribute('href')?.includes('rmitnct.site/recruitment')
      )
    ).toBe(true);
  });

  it('renders the Learn More link to about', () => {
    render(<HeroSection />);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/about')).toBe(true);
  });

  it('renders the N logo image', () => {
    render(<HeroSection />);
    expect(screen.getByAltText('Neo Culture Tech logo')).toBeTruthy();
  });
});
