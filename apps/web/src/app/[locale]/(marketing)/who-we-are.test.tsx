import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WhoWeAre from './who-we-are';

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

describe('WhoWeAre', () => {
  it('renders the section heading', () => {
    render(<WhoWeAre />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.textContent).toContain('Who We Are');
  });

  it('renders the NEO identity wordmark', () => {
    render(<WhoWeAre />);
    expect(screen.queryByText('NEO CULTURE')).toBeTruthy();
    expect(screen.getAllByText('TECH').length).toBeGreaterThan(0);
  });

  it('renders both divisions', () => {
    render(<WhoWeAre />);
    expect(screen.queryByText('Culture')).toBeTruthy();
    expect(screen.getAllByText('Tech').length).toBeGreaterThan(0);
  });

  it('renders club photos for both divisions', () => {
    render(<WhoWeAre />);
    // 2 culture polaroids + 2 tech polaroids + 1 logo
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4);
  });
});
