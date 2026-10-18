# Why Us Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make Why Us the climactic finale — de-duplicate the Departments card (→ Hands-on Experience), add a bold JD-Booklet Join band, and wrap it in a distinct dark `brand-dark-blue` panel. No imagery.

**Architecture:** Rewrite `why-us.tsx`; keep the `reasons` data-driven card pattern (3 cards), add a climax band, restyle for the dark panel. Sibling `why-us.test.tsx`.

**Tech Stack:** Next.js App Router, React client component, Tailwind v4, framer-motion, next/link, `@ncthub/ui/*`, Vitest.

## Global Constraints

- Only `why-us.tsx` + `why-us.test.tsx` change.
- Dark panel `bg-brand-dark-blue` + white text (token verified dark in both themes).
- Card 1 is "HANDS-ON EXPERIENCE" (not Club Departments). Climax Join → `https://rmitnct.site/jdbooklet`.
- No imagery. Lint scoped only. Commits are the owner's.

---

### Task 1: Rewrite `why-us.tsx`

**Files:** Modify (full rewrite): `apps/web/src/app/[locale]/(marketing)/why-us.tsx`

- [ ] **Step 1: Replace file contents** with:

```tsx
'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ncthub/ui/card';
import {
  ArrowRight,
  Check,
  ExternalLink,
  Heart,
  Rocket,
  Sparkles,
  Users,
} from '@ncthub/ui/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';

const reasons = [
  {
    title: 'HANDS-ON EXPERIENCE',
    icon: Rocket,
    description:
      'Learn by building. Work on real projects, join technical workshops, and compete in challenges like Neo League that turn curiosity into real capability.',
    gradient: 'from-yellow-400 to-orange-500',
    features: [
      'Real Club Projects',
      'Technical Workshops',
      'Competitions & Hackathons',
      'Portfolio-ready Work',
    ],
    buttonText: 'See What We Do',
    link: '#events',
    isExternal: false,
    badgeText: 'Learn by Building',
  },
  {
    title: 'NETWORKING',
    icon: Users,
    description:
      'Build meaningful connections with industry professionals, experienced alumni, and passionate peers. Our network opens doors to internships, mentorships, and career opportunities.',
    gradient: 'from-blue-400 to-cyan-500',
    features: [
      'Industry Mentor Matching',
      'Peer Study Groups',
      'Professional Development',
      '24/7 Community Support',
    ],
    buttonText: 'Meet Our Team',
    link: '/about',
    isExternal: false,
    badgeText: 'Career Growth',
  },
  {
    title: 'MEMBERSHIP',
    icon: Heart,
    description:
      'Be part of a community that believes in inclusive growth and continuous learning. We welcome all students passionate about technology, regardless of their background or experience level.',
    gradient: 'from-purple-400 to-pink-500',
    features: [
      'Inclusive Learning Environment',
      'Knowledge Sharing Sessions',
      'Fun Tech Challenges',
      'Continuous Skill Development',
    ],
    buttonText: 'Join Neo Culture Tech',
    link: 'https://rmitnct.site/recruitment',
    isExternal: true,
    badgeText: 'Inclusive Community',
  },
];

const JD_BOOKLET = 'https://rmitnct.site/jdbooklet';

export default function WhyUs() {
  return (
    <motion.section
      id="why-us"
      className="container mx-auto flex flex-col p-6 sm:px-8"
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-6 inline-flex items-center gap-2"
        >
          <Sparkles className="h-6 w-6 text-brand-light-yellow" />
          <Badge
            variant="outline"
            className="border-brand-light-blue/50 px-4 py-2 text-base text-brand-light-blue"
          >
            Why Choose Us
          </Badge>
          <Sparkles className="h-6 w-6 text-brand-light-yellow" />
        </motion.div>

        <h2 className="mb-4 pb-4 font-bold text-4xl md:text-6xl lg:text-8xl">
          Why{' '}
          <span className="whitespace-nowrap border-brand-light-yellow border-b-4 text-brand-light-blue">
            Us?
          </span>
        </h2>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Discover what makes NEO Culture Tech the perfect choice for your
          technology journey
        </p>
      </div>

      {/* Dark finale panel */}
      <div className="rounded-3xl bg-brand-dark-blue p-6 shadow-2xl sm:p-10 md:p-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="h-full border border-white/10 bg-white/5 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-xl">
                <CardHeader className="pb-4 text-center">
                  <div
                    className={`mx-auto mb-4 h-16 w-16 rounded-full bg-linear-to-r ${reason.gradient} p-0.5 transition-transform duration-300 group-hover:scale-105`}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-dark-blue">
                      <reason.icon className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>

                  <CardTitle className="mb-2 font-bold text-white text-xl md:text-2xl">
                    {reason.title}
                  </CardTitle>

                  <Badge
                    variant="secondary"
                    className={`bg-linear-to-r ${reason.gradient} mb-4 border-0 text-white shadow-sm`}
                  >
                    {reason.badgeText}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="mb-6 text-base text-white/70 leading-relaxed">
                    {reason.description}
                  </CardDescription>

                  <div className="mb-6 space-y-2">
                    {reason.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-brand-light-blue"
                        />
                        <span className="text-sm text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {reason.isExternal ? (
                    <Link
                      href={reason.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${reason.buttonText} - Opens in new tab`}
                    >
                      <Button
                        variant="outline"
                        className="w-full border-white/30 bg-transparent text-white transition-all duration-300 hover:bg-white hover:text-brand-dark-blue"
                      >
                        {reason.buttonText}
                        <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={reason.link} aria-label={reason.buttonText}>
                      <Button
                        variant="outline"
                        className="w-full border-white/30 bg-transparent text-white transition-all duration-300 hover:bg-white hover:text-brand-dark-blue"
                      >
                        {reason.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Climax Join band */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 border-white/15 border-t pt-10 text-center"
        >
          <span className="font-semibold text-brand-light-yellow text-sm uppercase tracking-[0.2em]">
            Recruitment open — Semester C 2026
          </span>
          <h3 className="mt-3 mb-6 font-bold text-2xl text-white md:text-4xl">
            Ready to find your role?
          </h3>
          <Link
            href={JD_BOOKLET}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View JD Booklet - Opens in new tab"
            className="group/cta inline-block"
          >
            <Button
              size="lg"
              className="bg-brand-light-yellow font-semibold text-brand-dark-blue hover:bg-brand-light-yellow/90"
            >
              View JD Booklet
              <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
```

- [ ] **Step 2:** `cd /home/khoai/Khoai/Real_world_projects/hub && bunx @biomejs/biome check --write "apps/web/src/app/[locale]/(marketing)/why-us.tsx"` → no errors.

---

### Task 2: Create `why-us.test.tsx`

**Files:** Create: `apps/web/src/app/[locale]/(marketing)/why-us.test.tsx`

- [ ] **Step 1: Write the test** (mock matchMedia + IntersectionObserver as in the other section tests):

```tsx
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
      links.some((l) => l.getAttribute('href')?.includes('rmitnct.site/jdbooklet'))
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
```

- [ ] **Step 2:** `bunx vitest run "apps/web/src/app/[locale]/(marketing)/why-us.test.tsx"` → 5 passed.
- [ ] **Step 3:** `bunx @biomejs/biome check --write "apps/web/src/app/[locale]/(marketing)/why-us.test.tsx"` → no errors.

---

### Task 3: Footprint

- [ ] `git status --short` → only `why-us.tsx`, `why-us.test.tsx`, docs. Report to owner; do not commit.

## Self-Review

- Covers #2 (Hands-on replaces Departments), #3 (JD climax band), #4 (dark panel), #5 (Check icons, dark-tuned cards). #1 intentionally skipped.
- `#events` / `/about` internal links via next/link; external links keep target/rel/aria.
- No placeholders.
