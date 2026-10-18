import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Events from './events';

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

describe('Events', () => {
  it('renders the Upcoming Events heading', () => {
    render(<Events />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2.textContent).toContain('Upcoming Events');
  });

  it('renders Coming Soon CTA and TBA meta for upcoming events', () => {
    render(<Events />);
    expect(screen.getAllByText('Coming Soon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TBA').length).toBeGreaterThan(0);
  });

  it('renders color-coded event type badges', () => {
    render(<Events />);
    expect(screen.getAllByText('Competition').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Networking').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Workshop').length).toBeGreaterThan(0);
  });

  it('renders the scrolling type ticker with extra categories', () => {
    render(<Events />);
    // Only exists in the ticker, not on any card.
    expect(screen.getAllByText('Social').length).toBeGreaterThan(0);
  });

  it('renders the Past Highlights section', () => {
    render(<Events />);
    expect(screen.queryByText('Past Highlights')).toBeTruthy();
  });

  it('renders a link to the club Facebook page', () => {
    render(<Events />);
    const links = screen.getAllByRole('link');
    const fb = links.some((l) =>
      l.getAttribute('href')?.includes('facebook.com/rmit.nct')
    );
    expect(fb).toBe(true);
  });

  it('renders event images', () => {
    render(<Events />);
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4);
  });
});
