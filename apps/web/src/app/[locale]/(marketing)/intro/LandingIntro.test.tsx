import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LandingIntro from './LandingIntro';

// framer-motion's useReducedMotion reads matchMedia; jsdom lacks it.
beforeEach(() => {
  window.sessionStorage.clear();
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
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('LandingIntro', () => {
  it('renders the brand wordmark on first visit', () => {
    render(<LandingIntro />);
    expect(screen.queryByText('NEO CULTURE')).toBeTruthy();
    expect(screen.queryByText('TECH')).toBeTruthy();
  });

  it('marks the session as played after rendering', () => {
    render(<LandingIntro />);
    expect(window.sessionStorage.getItem('nct_intro_played')).toBe('true');
  });

  it('does not render when the intro already played this session', () => {
    window.sessionStorage.setItem('nct_intro_played', 'true');
    render(<LandingIntro />);
    expect(screen.queryByText('NEO CULTURE')).toBeNull();
  });

  it('renders a skip control on first visit', () => {
    render(<LandingIntro />);
    expect(screen.queryByRole('button', { name: /skip/i })).toBeTruthy();
  });
});
