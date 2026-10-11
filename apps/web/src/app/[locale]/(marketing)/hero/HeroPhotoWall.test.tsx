import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HeroPhotoWall from './HeroPhotoWall';
import { heroPhotos } from './photos';

vi.mock('@/i18n/routing', () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(() => cleanup());

describe('HeroPhotoWall', () => {
  it('renders the club name as the h1', () => {
    render(<HeroPhotoWall />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toContain('NEO CULTURE');
    expect(h1.textContent).toContain('TECH');
  });

  it('renders the positioning sub-headline', () => {
    render(<HeroPhotoWall />);
    expect(
      screen.queryByText(/tech community for SSET students at RMIT/i)
    ).toBeTruthy();
  });

  it('renders the club logo', () => {
    render(<HeroPhotoWall />);
    expect(screen.queryByAltText('Neo Culture Tech logo')).toBeTruthy();
  });

  it('renders the Gen 8 recruiting badge', () => {
    render(<HeroPhotoWall />);
    expect(screen.queryByText(/Gen 8 · Recruiting Now/i)).toBeTruthy();
  });

  it('links Join Us to recruitment and Learn more to /about', () => {
    render(<HeroPhotoWall />);
    expect(
      screen.getByRole('link', { name: /join us/i }).getAttribute('href')
    ).toBe('https://rmitnct.site/recruitment');
    expect(
      screen.getByRole('link', { name: /learn more/i }).getAttribute('href')
    ).toBe('/about');
  });

  it('renders the club photos across the rows', () => {
    render(<HeroPhotoWall />);
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(
      heroPhotos.length
    );
  });
});
