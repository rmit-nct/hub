# Events Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the marketing `Events` section to lead with upcoming events (teaser, no CTA, TBA meta) and demote past events to a 3-card teaser with per-card Facebook links, with no surrounding panel.

**Architecture:** Single client component `events.tsx` with one shared `EventCard` (featured/compact variants), two data arrays (`upcomingEvents`, `pastEvents`), framer-motion reveal-on-scroll. No panel wrapper — cards float on the page gradient. A sibling `events.test.tsx` covers structure.

**Tech Stack:** Next.js App Router, React client component, Tailwind v4, framer-motion, next/image, `@ncthub/ui/*`, Vitest + @testing-library/react.

## Global Constraints

- Only `apps/web/src/app/[locale]/(marketing)/events.tsx` and `events.test.tsx` change. No `page.tsx` change (it already renders `<Events />`).
- No surrounding `rounded-3xl bg-background/60` panel for this section — panel-less by design.
- Upcoming cards: status `Coming Soon`, date `TBA`, location `TBA`, **no CTA button**.
- Past cards: short description, `MM/YYYY` date, real location, **"See details →"** button → that event's Facebook post. Plus one global **"See all events on Facebook →"** → `https://www.facebook.com/rmit.nct`.
- Header matches Who We Are form: eyebrow badge flanked by `Calendar` icons + giant `Upcoming Events` headline ("Events" in `text-brand-light-blue` + `border-b-4 border-brand-light-yellow`).
- Lint only via `bunx @biomejs/biome check --write "<exact path>"`. Never repo-wide.
- Verify footprint with `git status --short`.
- **All git commits are the owner's — do not run git commit/add/push.**

---

### Task 1: Rewrite `events.tsx` (data + EventCard + layout)

**Files:**
- Modify (full rewrite): `apps/web/src/app/[locale]/(marketing)/events.tsx`

**Interfaces:**
- Produces: default export `Events()`; internal `EventType` (`{ src, title, description, date, location, status, href? }`), `EventCard({ event, variant })` where `variant: 'featured' | 'compact'`.

- [ ] **Step 1: Replace the file contents** with the implementation below.

```tsx
'use client';

import { Badge } from '@ncthub/ui/badge';
import { Button } from '@ncthub/ui/button';
import { ArrowRight, Calendar, MapPin } from '@ncthub/ui/icons';
import { cn } from '@ncthub/utils/format';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

type EventType = {
  src: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: string;
  href?: string; // present => renders a "See details" button (past events)
};

const FACEBOOK_PAGE = 'https://www.facebook.com/rmit.nct';

// Upcoming: teaser only — all meta is TBA, status Coming Soon, no link/button.
const upcomingEvents: EventType[] = [
  {
    src: '/media/marketing/neo-league/neo-league-2026.png',
    title: 'Neo League Season 2',
    description:
      'Our flagship innovation challenge returns — bigger, bolder, and open to new builders.',
    date: 'TBA',
    location: 'TBA',
    status: 'Coming Soon',
  },
  {
    src: '/media/marketing/events/netcompany-talk-show.jpg',
    title: 'Neo Connect',
    description: 'Industry talks and networking with our partners.',
    date: 'TBA',
    location: 'TBA',
    status: 'Coming Soon',
  },
  {
    src: '/media/marketing/workshops/cv-workshop.jpg',
    title: 'Member Workshops',
    description: 'Hands-on sessions to sharpen your craft.',
    date: 'TBA',
    location: 'TBA',
    status: 'Coming Soon',
  },
];

// Past: full info card, each links to its own Facebook post.
const pastEvents: EventType[] = [
  {
    src: '/media/marketing/neo-league/neo-league-2025.png',
    title: 'Neo League - Prompt The Future 2025',
    description: 'Our AI prompt-engineering competition drew 170+ innovators.',
    date: '05/2025',
    location: 'RMIT Campus',
    status: 'Past',
    href: FACEBOOK_PAGE,
  },
  {
    src: '/media/marketing/events/netcompany-tour.jpg',
    title: 'Netcompany Tour',
    description: 'A guided company tour with demos and networking for members.',
    date: '08/2025',
    location: 'Netcompany Campus',
    status: 'Past',
    href: 'https://www.facebook.com/share/p/16J9j3s46A/',
  },
  {
    src: '/media/marketing/workshops/cv-workshop.jpg',
    title: 'CV Workshop',
    description: 'Internal training to help members land their next role.',
    date: '09/2025',
    location: 'RMIT Campus',
    status: 'Past',
    href: 'https://www.facebook.com/share/p/1aLwzokR2b/',
  },
];

function EventCard({
  event,
  variant,
}: {
  event: EventType;
  variant: 'featured' | 'compact';
}) {
  const featured = variant === 'featured';
  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 shadow-xl transition-all duration-500 hover:shadow-2xl',
        featured ? 'min-h-[22rem] md:min-h-[32rem]' : 'min-h-[18rem]'
      )}
    >
      <Image
        src={event.src}
        alt={event.title}
        fill
        sizes={featured ? '(max-width: 767px) 100vw, 60vw' : '(max-width: 767px) 100vw, 30vw'}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      {/* Status pill */}
      <div className="relative p-5">
        <Badge className="bg-brand-light-blue/90 text-white hover:bg-brand-light-blue">
          {event.status}
        </Badge>
      </div>

      {/* Content */}
      <div className="relative mt-auto p-5 text-white sm:p-6">
        <h3
          className={cn(
            'font-bold leading-tight',
            featured ? 'text-2xl sm:text-3xl' : 'text-lg'
          )}
        >
          {event.title}
        </h3>
        <p
          className={cn(
            'mt-2 text-white/80',
            featured ? 'text-sm sm:text-base' : 'text-sm'
          )}
        >
          {event.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.location}
          </span>
        </div>
        {event.href ? (
          <Link
            href={event.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block"
          >
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 text-black hover:bg-white"
            >
              See details
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function Events() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay },
          viewport: { once: true },
        };

  return (
    <section id="events" className="container mx-auto p-6 sm:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.div
          {...reveal(0.1)}
          className="mb-6 inline-flex items-center gap-2"
        >
          <Calendar className="h-6 w-6 text-brand-light-blue" />
          <Badge
            variant="outline"
            className="border-brand-light-blue/50 px-4 py-2 text-base text-brand-light-blue"
          >
            Upcoming Events
          </Badge>
          <Calendar className="h-6 w-6 text-brand-light-blue" />
        </motion.div>

        <h2 className="mb-4 pb-4 font-bold text-4xl md:text-6xl lg:text-8xl">
          Upcoming{' '}
          <span className="whitespace-nowrap border-brand-light-yellow border-b-4 text-brand-light-blue">
            Events
          </span>
        </h2>

        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Don't miss what's coming up this semester
        </p>
      </div>

      {/* Upcoming bento (no panel) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <motion.div {...reveal(0.05)} className="md:col-span-3">
          <EventCard event={upcomingEvents[0]!} variant="featured" />
        </motion.div>
        <div className="flex flex-col gap-6 md:col-span-2">
          {upcomingEvents.slice(1).map((event, i) => (
            <motion.div key={event.title} {...reveal(0.1 + i * 0.1)}>
              <EventCard event={event} variant="compact" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Past highlights */}
      <div className="mt-16">
        <motion.div {...reveal(0.05)} className="mb-6">
          <span className="font-semibold text-brand-light-blue text-sm uppercase tracking-[0.25em]">
            — Already happened
          </span>
          <h3 className="mt-1 font-bold text-2xl md:text-3xl">Past Highlights</h3>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pastEvents.map((event, i) => (
            <motion.div key={event.title} {...reveal(0.1 + i * 0.1)}>
              <EventCard event={event} variant="compact" />
            </motion.div>
          ))}
        </div>

        <motion.div {...reveal(0.2)} className="mt-10 text-center">
          <Link href={FACEBOOK_PAGE} target="_blank" rel="noopener noreferrer">
            <Button size="lg">
              See all events on Facebook
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Scoped lint/format**

Run: `cd /home/khoai/Khoai/Real_world_projects/hub && bunx @biomejs/biome check --write "apps/web/src/app/[locale]/(marketing)/events.tsx"`
Expected: no errors (auto-fixes applied).

- [ ] **Step 3: Verify `cn` import path** — confirm `@ncthub/utils/format` exports `cn` (same import used by other marketing components). If TypeScript/Biome flags it, fall back to the path used in `who-we-are.tsx`'s sibling components.

---

### Task 2: Replace `events.test.tsx`

**Files:**
- Create/replace: `apps/web/src/app/[locale]/(marketing)/events.test.tsx`

**Interfaces:**
- Consumes: default export `Events` from `./events`.

- [ ] **Step 1: Write the test file**

```tsx
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

  it('renders Coming Soon status and TBA meta for upcoming events', () => {
    render(<Events />);
    expect(screen.getAllByText('Coming Soon').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TBA').length).toBeGreaterThan(0);
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
```

- [ ] **Step 2: Run the tests**

Run: `cd /home/khoai/Khoai/Real_world_projects/hub && bunx vitest run apps/web/src/app/[locale]/(marketing)/events.test.tsx`
Expected: 5 passed.

- [ ] **Step 3: Scoped lint**

Run: `cd /home/khoai/Khoai/Real_world_projects/hub && bunx @biomejs/biome check --write "apps/web/src/app/[locale]/(marketing)/events.test.tsx"`
Expected: no errors.

---

### Task 3: Footprint verification

- [ ] **Step 1: Confirm only intended files changed**

Run: `cd /home/khoai/Khoai/Real_world_projects/hub && git status --short`
Expected: changes limited to `events.tsx`, `events.test.tsx`, and the new docs spec/plan files. No unrelated files.

- [ ] **Step 2: Report to owner** — summarize changes, test result, and suggested commit message. Do NOT commit (owner handles git).

## Self-Review notes

- Spec coverage: header ✔, panel-less ✔, upcoming teaser (Coming Soon/TBA/no button) ✔, past full cards + per-card FB button ✔, global FB button ✔, shared EventCard ✔, tests ✔.
- Neo League 2025 FB link defaults to the club page (`FACEBOOK_PAGE`) since no post URL was confirmed — owner to replace if a specific post exists.
- No placeholders in code; all strings concrete.
