import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WhyUs from './why-us';

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

describe('WhyUs', () => {
  it('renders the Why Us heading', () => {
    render(<WhyUs />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.textContent).toContain('Why Us?');
  });

  it('renders the three value-prop cards', () => {
    render(<WhyUs />);
    expect(screen.queryByText('HANDS-ON EXPERIENCE')).toBeTruthy();
    expect(screen.queryByText('NETWORKING')).toBeTruthy();
    expect(screen.queryByText('MEMBERSHIP')).toBeTruthy();
  });

  it('no longer renders the redundant Club Departments card', () => {
    render(<WhyUs />);
    expect(screen.queryByText('CLUB DEPARTMENTS')).toBeNull();
  });

  it('renders the climax JD Booklet CTA', () => {
    render(<WhyUs />);
    const links = screen.getAllByRole('link');
    expect(
      links.some((l) =>
        l.getAttribute('href')?.includes('rmitnct.site/jdbooklet')
      )
    ).toBe(true);
  });

  it('renders the recruitment link', () => {
    render(<WhyUs />);
    const links = screen.getAllByRole('link');
    expect(
      links.some((l) =>
        l.getAttribute('href')?.includes('rmitnct.site/recruitment')
      )
    ).toBe(true);
  });
});
