# Hero Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rebuild the hero as one brand-blue gradient panel: oversized centered "NEO CULTURE TECH" wordmark, bright N logo centered below, tagline flanking left, blinking recruitment + CTAs flanking right. Hero only; no nav, no photo gallery.

**Architecture:** Full rewrite of `hero-section.tsx` (drop gallery/rotating-image code + photo data). Keep `BLINK_CSS`. Bright fixed logo (no theme hook). Sibling `hero-section.test.tsx`.

**Tech Stack:** Next.js App Router, React client component, Tailwind v4, framer-motion, next/image, next-intl `Link`, `@ncthub/ui/*`, Vitest.

## Global Constraints

- Only `hero-section.tsx` + `hero-section.test.tsx` change.
- Club brand tokens only (theme-aware panel); reuse current copy.
- N logo = `/media/logos/transparent/light-logo-only-transparent.png` (bright, fixed).
- Join Now → `https://rmitnct.site/recruitment` (external); Learn More → `/about` (i18n Link).
- Lint scoped only. Commits are the owner's.

---

### Task 1: Rewrite `hero-section.tsx`

**Files:** Modify (full rewrite): `apps/web/src/app/[locale]/(marketing)/hero-section.tsx`

- [ ] **Step 1: Replace file contents** with:

```tsx
'use client';

import { Button } from '@ncthub/ui/button';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

// Hard on/off "machine" blink for the recruitment status.
const BLINK_CSS = `
@keyframes nct-blink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}
.nct-blink { animation: nct-blink 1s steps(1, end) infinite; }
@media (prefers-reduced-motion: reduce) {
  .nct-blink { animation: none; }
}
`;

const LOGO = '/media/logos/transparent/light-logo-only-transparent.png';
const RECRUITMENT_URL = 'https://rmitnct.site/recruitment';

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
          viewport: { once: true },
        };

  return (
    <section className="container mx-auto px-6 py-8 sm:px-8">
      <style>{BLINK_CSS}</style>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative flex min-h-[calc(100svh-6rem)] flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-brand-light-blue via-brand-light-blue to-brand-dark-blue px-6 py-14 shadow-2xl sm:px-10 sm:py-16 md:px-16 md:py-20"
      >
        {/* Wordmark — centerpiece, ~80% width */}
        <motion.h1
          {...reveal(0.05)}
          className="text-center font-black text-5xl text-white uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
        >
          <span className="border-brand-light-yellow border-b-4 pb-1">
            Neo Culture
          </span>{' '}
          <span className="text-brand-light-blue">Tech</span>
        </motion.h1>

        {/* Row under the wordmark: tagline | N logo | status + CTAs */}
        <div className="mt-10 grid items-center gap-8 md:mt-14 md:grid-cols-[1fr_auto_1fr] md:gap-6">
          {/* Left — tagline */}
          <motion.p
            {...reveal(0.15)}
            className="max-w-sm text-center text-base text-white/80 leading-relaxed md:justify-self-end md:text-right"
          >
            Founded in 2020, the best club for{' '}
            <span className="border-brand-light-yellow border-b-2 font-semibold text-white">
              SSET students
            </span>{' '}
            to explore technology at RMIT University.
          </motion.p>

          {/* Center — N logo */}
          <motion.div
            {...reveal(0.1)}
            className="relative mx-auto h-40 w-40 flex-none sm:h-52 sm:w-52 md:h-60 md:w-60"
          >
            <Image
              src={LOGO}
              alt="Neo Culture Tech logo"
              fill
              priority
              sizes="240px"
              className="object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* Right — recruitment status + CTAs */}
          <motion.div
            {...reveal(0.2)}
            className="flex flex-col items-center gap-4 md:items-start"
          >
            <div className="flex items-center gap-2 font-semibold text-sm text-white">
              <span className="nct-blink inline-block h-2 w-2 rounded-full bg-green-400" />
              <span className="nct-blink">
                Recruitment now for Semester C - 2026
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Button
                size="lg"
                asChild
                className="bg-brand-light-yellow font-semibold text-brand-dark-blue hover:bg-brand-light-yellow/90"
              >
                <Link
                  href={RECRUITMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Now
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white hover:text-brand-dark-blue"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2:** `cd /home/khoai/Khoai/Real_world_projects/hub && bunx @biomejs/biome check --write "apps/web/src/app/[locale]/(marketing)/hero-section.tsx"` → no errors.

---

### Task 2: Create `hero-section.test.tsx`

**Files:** Create: `apps/web/src/app/[locale]/(marketing)/hero-section.test.tsx`

- [ ] **Step 1: Write the test** (mock matchMedia + IntersectionObserver; mock i18n Link to a plain anchor):

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    expect(screen.getByRole('img')).toBeTruthy();
  });
});
```

- [ ] **Step 2:** `bunx vitest run "apps/web/src/app/[locale]/(marketing)/hero-section.test.tsx"` → 5 passed.
- [ ] **Step 3:** `bunx @biomejs/biome check --write "apps/web/src/app/[locale]/(marketing)/hero-section.test.tsx"` → no errors.

---

### Task 3: Footprint

- [ ] `git status --short` → only `hero-section.tsx`, `hero-section.test.tsx`, docs. Report to owner; do not commit.

## Self-Review

- Covers demo layout (gradient panel, ~80% wordmark, centered N, flanking tagline/status+CTAs), club colors, reused copy, bright fixed logo, no nav/gallery.
- Wordmark uses "Neo Culture / Tech" with `uppercase` so it renders as NEO CULTURE TECH; test checks mixed-case source text.
- No placeholders; all links/strings concrete.
