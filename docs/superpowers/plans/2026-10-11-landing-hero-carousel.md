# Landing Hero — Auto-Scrolling Photo Wall — Implementation Plan (inline, minimal-footprint)

**Goal:** Build the Landing page Hero as a centered headline/CTA block on top, with **two opposite-direction auto-scrolling photo rows** (infinite marquee) of club photos beneath it.

**Execution:** Inline in this session (NO subagents). TDD per task.

**Supersedes** the earlier cinematic-carousel design. Keeps `photos.ts`; replaces the carousel component with a photo-wall component.

## ⚠️ Footprint rules (the reason this plan format exists)

- **NEVER run `bun format-and-lint:fix` or `bun format-and-lint`** — repo-wide, reformats hundreds of unrelated files.
- Format/lint **only the exact files below**, by path:
  ```bash
  bunx @biomejs/biome check --write "<file1>" "<file2>"   # format just these
  bunx @biomejs/biome check "<file1>" "<file2>"            # verify just these
  ```
- Create/modify **only** the files named below. No git commits (owner commits).
- Final step runs `git status --short` and asserts only these files changed.

## Files (closed set)

- Keep (already built, unchanged): `apps/web/src/app/[locale]/(marketing)/hero/photos.ts` (+ `photos.test.ts`).
- Delete (untracked carousel, being replaced): `hero/HeroCarousel.tsx`, `hero/HeroCarousel.test.tsx`.
- Create: `hero/HeroPhotoWall.tsx`, `hero/HeroPhotoWall.test.tsx`.
- Modify: `apps/web/src/app/[locale]/(marketing)/page.tsx` (import the new component name).
- Keep `hero-section.tsx` on disk (stats → About later); not imported.

## Design (locked)

- **Layout:** a section, `min-h-[calc(100svh-4rem)]`, flex-column, vertically centered. A **centered** text block on top; **two marquee rows** below.
- **Text block (theme-aware, no scrim — sits on the page background):** Gen 8 badge `Gen 8 · Recruiting Now` + green pulse dot; `<h1>` "The tech community for SSET students at RMIT" in `text-foreground`; **Join Us** (primary → `https://rmitnct.site/recruitment`, new tab) + **Learn more** (secondary → `/about`).
- **Photo wall:** two rows, row 1 drifts left, row 2 drifts right, different speeds, infinite seamless loop. Each row renders the photo list **twice** and translates `-50%` for a seamless loop; per-tile trailing margin (not flex `gap`) so `-50%` is pixel-seamless.
- **Motion:** pure CSS keyframes injected via a scoped `<style>` in the component (NO globals.css edit). Pause on hover; `prefers-reduced-motion: reduce` → rows static. GPU `transform` only.
- **Perf:** `next/image` `fill` + `object-cover`; `priority` only on the first 3 tiles of row 1; the rest lazy. No layout shift (fixed tile sizes).

---

## Task 1: Photos — already done

- [ ] Confirm `hero/photos.ts` + `hero/photos.test.ts` exist and pass:
```bash
bunx vitest run "src/app/[locale]/(marketing)/hero/photos.test.ts"
```
Expect 2 passed. No change.

---

## Task 2: `HeroPhotoWall` component (replaces HeroCarousel)

- [ ] **Step 1 — remove the old carousel files** (untracked; being replaced):
```bash
rm "src/app/[locale]/(marketing)/hero/HeroCarousel.tsx" "src/app/[locale]/(marketing)/hero/HeroCarousel.test.tsx"
```

- [ ] **Step 2 — failing test.** Create `hero/HeroPhotoWall.test.tsx`:

```tsx
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
  it('renders the positioning headline as the h1', () => {
    render(<HeroPhotoWall />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toContain(
      'tech community for SSET students at RMIT'
    );
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
```

- [ ] **Step 3 — run, expect FAIL** (cannot resolve `./HeroPhotoWall`):
```bash
bunx vitest run "src/app/[locale]/(marketing)/hero/HeroPhotoWall.test.tsx"
```

- [ ] **Step 4 — implement.** Create `hero/HeroPhotoWall.tsx`:

```tsx
'use client';

import { Button } from '@ncthub/ui/button';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { type HeroPhoto, heroPhotos } from './photos';

const RECRUITMENT_URL = 'https://rmitnct.site/recruitment';

const MARQUEE_CSS = `
@keyframes nct-marquee-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes nct-marquee-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
.nct-marquee-track {
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.nct-marquee:hover .nct-marquee-track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .nct-marquee-track { animation: none; }
}
`;

function MarqueeRow({
  photos,
  direction,
  durationSeconds,
  eager = false,
}: {
  photos: HeroPhoto[];
  direction: 'left' | 'right';
  durationSeconds: number;
  eager?: boolean;
}) {
  const tiles = [...photos, ...photos];
  return (
    <div className="nct-marquee w-full overflow-hidden">
      <div
        className="nct-marquee-track flex w-max"
        style={{
          animationName:
            direction === 'left' ? 'nct-marquee-left' : 'nct-marquee-right',
          animationDuration: `${durationSeconds}s`,
        }}
      >
        {tiles.map((photo, i) => (
          <div
            key={`${photo.src}-${i}`}
            className="relative mr-4 h-40 w-64 shrink-0 overflow-hidden rounded-xl shadow-md md:h-52 md:w-80"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={eager && i < 3}
              sizes="(max-width: 768px) 256px, 320px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroPhotoWall() {
  return (
    <section
      aria-label="Club highlights"
      className="flex min-h-[calc(100svh-4rem)] w-full flex-col justify-center gap-10 overflow-hidden py-12"
    >
      <style>{MARQUEE_CSS}</style>

      {/* Text block */}
      <div className="container mx-auto flex flex-col items-center gap-5 px-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-light-blue/40 bg-brand-light-blue/10 px-4 py-1.5 font-semibold text-brand-light-blue text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          Gen 8 · Recruiting Now
        </span>

        <h1 className="max-w-3xl font-black text-4xl text-foreground leading-tight md:text-6xl">
          The tech community for SSET students at RMIT
        </h1>

        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link
              href={RECRUITMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Us
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/about">Learn more</Link>
          </Button>
        </div>
      </div>

      {/* Photo wall */}
      <div className="flex flex-col gap-4">
        <MarqueeRow
          photos={heroPhotos}
          direction="left"
          durationSeconds={40}
          eager
        />
        <MarqueeRow
          photos={[...heroPhotos].reverse()}
          direction="right"
          durationSeconds={48}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 5 — run, expect PASS (4):**
```bash
bunx vitest run "src/app/[locale]/(marketing)/hero/HeroPhotoWall.test.tsx"
```

- [ ] **Step 6 — scoped format + verify:**
```bash
bunx @biomejs/biome check --write "src/app/[locale]/(marketing)/hero/HeroPhotoWall.tsx" "src/app/[locale]/(marketing)/hero/HeroPhotoWall.test.tsx"
bunx @biomejs/biome check "src/app/[locale]/(marketing)/hero"
```

---

## Task 3: Mount on the landing page

- [ ] **Step 1 — edit `page.tsx`** (swap the import/usage to the new component):

```tsx
import Events from './events';
import HeroPhotoWall from './hero/HeroPhotoWall';
import LandingIntro from './intro/LandingIntro';
import SummarizedDepartments from './summarized-departments';
import WhyUs from './why-us';

export default function MarketingPage() {
  return (
    <>
      <LandingIntro />
      <HeroPhotoWall />
      <div className="container mx-auto flex flex-col items-center gap-6 px-8 py-16">
        <Events />
        <WhyUs />
        <SummarizedDepartments />
      </div>
    </>
  );
}
```

- [ ] **Step 2 — scoped format `page.tsx`:**
```bash
bunx @biomejs/biome check --write "src/app/[locale]/(marketing)/page.tsx"
bunx @biomejs/biome check "src/app/[locale]/(marketing)/page.tsx"
```

- [ ] **Step 3 — hero suite (scoped):**
```bash
bunx vitest run "src/app/[locale]/(marketing)/hero"
```
Expect 6 passed (2 photos + 4 wall).

- [ ] **Step 4 — footprint guard:**
```bash
git status --short
```
Expect only: `hero/` (photos.* + HeroPhotoWall.*), modified `page.tsx` (plus pre-existing untracked items). Anything else = a leak; revert it.

- [ ] **Step 5 — manual check (owner):**
```bash
bun dev --filter @ncthub/web
```
Open `/`: after the intro, centered headline + Gen 8 badge + Join Us/Learn more, two photo rows sliding in opposite directions (seamless loop); hover pauses; reduced-motion makes them static; works in light & dark.

## Suggested commit (owner runs)

```
feat(landing): add auto-scrolling photo wall hero

Centered headline + Gen 8 badge + Join Us / Learn more over two opposite-
direction infinite photo marquees of club photos. Pure-CSS marquee (pauses on
hover, static under prefers-reduced-motion); lazy-loads all but the first tiles.
```
