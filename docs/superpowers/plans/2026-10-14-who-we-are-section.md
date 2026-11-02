# "Who We Are" About Section — Implementation Plan (inline, minimal-footprint)

> **For agentic workers:** Execute inline (NO subagents) with superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build a scroll-driven "Who We Are" About section that tells a visual story: NEO identity at the center → branches into Culture and Tech → shows real club photos → unifies under one identity.

**Architecture:** One self-contained client component (`who-we-are.tsx`) rendered as a distinct tinted full-width band after the Hero. framer-motion drives scroll-reveal + an animated SVG "branch". Theme-aware logo via `next-themes`. Mobile stacks vertically.

**Tech Stack:** Next.js App Router, React, TS, `framer-motion`, `next/image`, `next-themes`, Vitest + `@testing-library/react`.

## Global Constraints (from memory + spec — binding)

- **Scoped Biome only.** NEVER run `bun format-and-lint:fix`/`bun format-and-lint`. Use `bunx @biomejs/biome check --write "<path>"` then `bunx @biomejs/biome check "<path>"` on the exact files only.
- **Owner commits.** No `git commit`/`add`/`push`. Leave changes unstaged; surface a commit message.
- **Footprint guard.** Only create `who-we-are.tsx` (+ its test) and edit `page.tsx` one line. Do NOT modify any other/unrelated section. End with `git status --short` and confirm only these changed.
- **Design constraints:** the section is a **distinct tinted band** (alternating-band rhythm) and **image-rich**; respects `prefers-reduced-motion`; responsive (two divisions stack on mobile).
- Heading text: **"Who We Are"**. Closing line: **"Different passions. One NEO."** (placeholder). Division headings: **Culture** (warm) and **Tech** (cool). All copy is placeholder.
- Biome style: 2-space, single quotes (JSX double), semicolons, 80-col.

---

## Task 1: Build the `WhoWeAre` section component

**Files:**
- Create: `apps/web/src/app/[locale]/(marketing)/who-we-are.tsx`
- Test: `apps/web/src/app/[locale]/(marketing)/who-we-are.test.tsx`

**Interfaces:**
- Produces: `export default function WhoWeAre(): JSX.Element` — self-contained, no props.

- [ ] **Step 1: Write the failing test.** Create `who-we-are.test.tsx`:

```tsx
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
    expect(screen.queryByText('Who We Are')).toBeTruthy();
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

  it('renders the unifying statement', () => {
    render(<WhoWeAre />);
    expect(screen.queryByText(/Different passions\. One NEO\./i)).toBeTruthy();
  });

  it('renders club photos for both divisions', () => {
    render(<WhoWeAre />);
    // 3 culture + 3 tech + 1 logo
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Run, expect FAIL** (module missing):
```bash
bunx vitest run "src/app/[locale]/(marketing)/who-we-are.test.tsx"
```

- [ ] **Step 3: Implement.** Create `who-we-are.tsx`:

```tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Photo {
  src: string;
  alt: string;
}

// Placeholder photos — swap to /media/marketing/landing-page/about/* later.
const cultureImages: Photo[] = [
  { src: '/club-day/sem-a-2026.jpg', alt: 'NCT Club Day' },
  {
    src: '/media/marketing/events/netcompany-talk-show.jpg',
    alt: 'Neo Connect talk show',
  },
  {
    src: '/media/marketing/events/netcompany-tour.jpg',
    alt: 'Company tour',
  },
];

const techImages: Photo[] = [
  {
    src: '/media/marketing/workshops/cv-workshop.jpg',
    alt: 'CV workshop',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2025.png',
    alt: 'NEO League',
  },
  {
    src: '/media/marketing/neo-league/neo-league-2026.png',
    alt: 'NEO League',
  },
];

export default function WhoWeAre() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme?.includes('dark');
  const logoSrc = isDark
    ? '/media/logos/transparent/dark-logo-only-transparent.png'
    : '/media/logos/transparent/light-logo-only-transparent.png';

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
          viewport: { once: true },
        };

  return (
    <section className="w-full bg-muted/40 py-20 sm:py-28">
      <div className="container mx-auto px-8">
        {/* Heading */}
        <motion.p
          {...reveal()}
          className="text-center font-semibold text-base text-brand-light-blue uppercase tracking-[0.25em]"
        >
          Who We Are
        </motion.p>

        {/* Stage 1 — Identity */}
        <motion.div
          {...reveal(0.05)}
          className="mt-6 flex items-center justify-center gap-3 sm:gap-4 md:gap-6"
        >
          <div className="relative h-16 w-16 flex-none sm:h-20 sm:w-20 md:h-24 md:w-24">
            <Image
              src={logoSrc}
              alt="Neo Culture Tech logo"
              fill
              sizes="96px"
              className="object-contain"
            />
          </div>
          <div className="whitespace-nowrap text-left font-black text-2xl leading-none tracking-tight sm:text-3xl md:text-5xl">
            <span className="text-brand-dark-blue underline decoration-4 decoration-brand-light-yellow underline-offset-8 dark:text-brand-white">
              NEO CULTURE
            </span>{' '}
            <span className="text-brand-light-blue">TECH</span>
          </div>
        </motion.div>

        {/* Stage 2 — Branch (SVG), desktop only */}
        <div className="relative mx-auto mt-4 hidden h-24 w-full max-w-2xl md:block">
          <svg
            aria-hidden="true"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <title>Branches into Culture and Tech</title>
            <motion.path
              d="M200 0 C200 55, 90 45, 70 100"
              fill="none"
              stroke="hsl(var(--brand-light-yellow, 41.5 96.6% 54.5%))"
              strokeWidth="2"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              viewport={{ once: true }}
            />
            <motion.path
              d="M200 0 C200 55, 310 45, 330 100"
              fill="none"
              stroke="hsl(var(--brand-light-blue, 193.2 41% 47.8%))"
              strokeWidth="2"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              viewport={{ once: true }}
            />
          </svg>
        </div>

        {/* Stage 3 — Culture (warm cluster) + Tech (clean grid) */}
        <div className="mt-6 grid gap-10 md:mt-2 md:grid-cols-2 md:gap-14">
          {/* Culture */}
          <motion.div {...reveal(0.1)}>
            <h3 className="font-black text-3xl text-amber-500">Culture</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              The people, events, and shared moments that make NEO a community —
              club days, socials, and the friendships built along the way.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="group relative col-span-2 aspect-video -rotate-1 overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={cultureImages[0]?.src ?? ''}
                  alt={cultureImages[0]?.alt ?? ''}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="group relative aspect-square rotate-1 overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={cultureImages[1]?.src ?? ''}
                  alt={cultureImages[1]?.alt ?? ''}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="group relative aspect-square -rotate-1 overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={cultureImages[2]?.src ?? ''}
                  alt={cultureImages[2]?.alt ?? ''}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </motion.div>

          {/* Tech */}
          <motion.div {...reveal(0.2)}>
            <h3 className="font-black text-3xl text-brand-light-blue">Tech</h3>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Software projects, workshops, and engineering — where members build
              real things, sharpen their craft, and push what they can make.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {techImages.map((photo, i) => (
                <div
                  key={photo.src}
                  className={`group relative aspect-square overflow-hidden rounded-lg ring-1 ring-border ${
                    i === 2 ? 'col-span-2 aspect-video' : ''
                  }`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stage 4 — Unify */}
        <motion.p
          {...reveal(0.1)}
          className="mt-16 text-center font-black text-2xl text-foreground sm:text-3xl"
        >
          Different passions.{' '}
          <span className="text-brand-light-blue">One NEO.</span>
        </motion.p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run, expect PASS (5):**
```bash
bunx vitest run "src/app/[locale]/(marketing)/who-we-are.test.tsx"
```

- [ ] **Step 5: Scoped format + lint:**
```bash
bunx @biomejs/biome check --write "src/app/[locale]/(marketing)/who-we-are.tsx" "src/app/[locale]/(marketing)/who-we-are.test.tsx"
bunx @biomejs/biome check "src/app/[locale]/(marketing)/who-we-are.tsx" "src/app/[locale]/(marketing)/who-we-are.test.tsx"
```

---

## Task 2: Mount on the landing page

**Files:**
- Modify: `apps/web/src/app/[locale]/(marketing)/page.tsx`

- [ ] **Step 1: Add import + render after the Hero, before the container.** Result:

```tsx
import Events from './events';
import HeroSection from './hero-section';
import LandingIntro from './intro/LandingIntro';
import SummarizedDepartments from './summarized-departments';
import WhoWeAre from './who-we-are';
import WhyUs from './why-us';

export default function MarketingPage() {
  return (
    <>
      <LandingIntro />
      <HeroSection />
      <WhoWeAre />
      <div className="container mx-auto flex flex-col items-center gap-6 px-8 py-16">
        <Events />
        <WhyUs />
        <SummarizedDepartments />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Scoped format + lint `page.tsx`:**
```bash
bunx @biomejs/biome check --write "src/app/[locale]/(marketing)/page.tsx"
bunx @biomejs/biome check "src/app/[locale]/(marketing)/page.tsx"
```

- [ ] **Step 3: Full section test run:**
```bash
bunx vitest run "src/app/[locale]/(marketing)/who-we-are.test.tsx"
```
Expect 5 passed.

- [ ] **Step 4: Footprint guard:**
```bash
git status --short
```
Expect only: new `who-we-are.tsx` + `who-we-are.test.tsx`, modified `page.tsx` (plus the earlier-created `.../about/.gitkeep` and any pre-existing untracked). Nothing else.

- [ ] **Step 5: Manual check (owner):**
```bash
bun dev --filter @ncthub/web
```
Open `/`, scroll past the hero: tinted band → "Who We Are" → NEO logo+wordmark → branch lines draw in → Culture (warm, tilted cluster) + Tech (clean ringed grid) reveal → "Different passions. One NEO." Toggle dark/light (logo swaps); test reduced-motion (no draw/movement); resize to mobile (divisions stack, SVG branch hidden).

## Suggested commit (owner runs)

```
feat(landing): add "Who We Are" about section — NEO identity branching into Culture & Tech
```

## Self-Review

- **Spec coverage:** Stage 1 identity (logo+wordmark); Stage 2 branch (animated SVG paths, desktop, reduced-motion aware); Stage 3 Culture (warm tilted cluster, ≥1 image — has 3) + Tech (clean ringed grid, 3 images) with headings + descriptions; Stage 4 unify line. Tinted band (`bg-muted/40`), imagery throughout, responsive (md:grid-cols-2 stacks), reduced-motion (`reveal()`/path `initial` gated), theme-aware logo. All covered.
- **Placeholders:** copy is intentionally placeholder per owner; no code placeholders.
- **Type consistency:** `Photo`, `cultureImages`/`techImages`, `WhoWeAre` default export consumed by `page.tsx`; test strings match rendered text.
