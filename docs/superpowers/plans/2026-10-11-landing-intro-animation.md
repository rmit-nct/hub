# Landing Intro Logo-Reveal Implementation Plan (Revised)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Landing page Section 0 — a once-per-session, skippable, full-screen two-stage logo-reveal intro overlay that fades to reveal the Hero.

**Architecture:** A self-contained client component (`LandingIntro`) renders a fixed white overlay with a `framer-motion` timeline (full-color N enters large → holds ~1s → shrinks → brand wordmark mask-wipes in below → whole lockup fades out). Session gating lives in a tiny pure module (`intro-session`), unit-tested in isolation. `page.tsx` mounts `<LandingIntro />` above the existing sections.

**Tech Stack:** Next.js (App Router), React, TypeScript, `framer-motion`, Tailwind v4 brand tokens, `next/image`, Vitest + `@testing-library/react` (jsdom).

**Revision note:** Tasks 1 and 3 are unchanged from the first pass and already exist in the working tree (not yet committed). Task 2 is **rewritten** to the revised design: pure-white backdrop, full-color logo, two-stage (big → shrink) motion, and the brand-exact wordmark lockup.

## Global Constraints

- Package manager: **Bun** (never npm/yarn/pnpm).
- Formatting (Biome): 2-space indent, 80-char width, single quotes (JSX uses double quotes), semicolons always, ES5 trailing commas. Run `bun format-and-lint:fix` before any handoff.
- Import alias: `@/*` → `apps/web/src/*`.
- Client components must start with `'use client';`.
- Testing: Vitest `environment: jsdom`; use `it` (not `test`); no jest-dom matchers — use `.toBeNull()`, `.toBeTruthy()`, `.textContent`.
- **Commits are performed by the repository owner.** The agent must NOT run `git commit`/`git push`. Each task ends by staging files and surfacing the suggested commit message.
- **Locked design values:**
  - **Theme-aware** via `next-themes` `useTheme().resolvedTheme` (treat
    `resolvedTheme?.includes('dark')` as dark, matching the repo's existing
    pattern in `meet-together/experimental-notice.tsx`):
    - Light: backdrop `bg-white`; N `light-logo-only-transparent.png`;
      "NEO CULTURE" `text-brand-dark-blue`; Skip dark.
    - Dark: backdrop `bg-brand-dark-blue`; N `dark-logo-only-transparent.png`;
      "NEO CULTURE" `text-brand-white`; Skip light.
    - Both: "TECH" `text-brand-light-blue`; underline `border-brand-light-yellow`
      under "NEO CULTURE" only.
  - Wordmark (styled text, font `Noto Sans` global, `font-black`, uppercase,
    `tracking-[0.15em]`); N mark above the wordmark (vertical lockup).
  - Timing: N fades in over ~0.5s at scale 1.6, holds, then scales to 1.0 starting at delay 1.0s (~0.7s); wordmark mask-wipe starts at delay 1.7s (~0.8s); fade-out starts at `HOLD_MS` (3000ms) over 0.5s → ~3.5s total. Reduced-motion hold = 1000ms.

---

### Task 1: Session-gate module (`intro-session`) — UNCHANGED (already in tree)

**Files:**
- `apps/web/src/app/[locale]/(marketing)/intro/intro-session.ts`
- `apps/web/src/app/[locale]/(marketing)/intro/intro-session.test.ts`

**Interfaces produced:** `shouldPlayIntro(): boolean`, `markIntroPlayed(): void` (session key `nct_intro_played`).

- [ ] **Step 1: Verify the module and its tests already exist and pass**

Run (from `apps/web`):
```bash
bunx vitest run "src/app/[locale]/(marketing)/intro/intro-session.test.ts"
```
Expected: PASS (3 passed). No code change needed. If missing, create per the first-pass plan (pure sessionStorage read/write with SSR + try/catch guards).

---

### Task 2: `LandingIntro` overlay component — REWRITTEN

**Files:**
- Modify (overwrite): `apps/web/src/app/[locale]/(marketing)/intro/LandingIntro.tsx`
- Modify (overwrite): `apps/web/src/app/[locale]/(marketing)/intro/LandingIntro.test.tsx`

**Interfaces:**
- Consumes: `shouldPlayIntro`, `markIntroPlayed` from `./intro-session`.
- Produces: `export default function LandingIntro(): JSX.Element | null` — self-contained client overlay, no props.

- [ ] **Step 1: Update the failing test (wordmark is now split into two colored spans)**

Overwrite `apps/web/src/app/[locale]/(marketing)/intro/LandingIntro.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `apps/web`):
```bash
bunx vitest run "src/app/[locale]/(marketing)/intro/LandingIntro.test.tsx"
```
Expected: FAIL — current component renders the single string "NEO CULTURE TECH", so `queryByText('NEO CULTURE')` returns null.

- [ ] **Step 3: Overwrite the component**

Overwrite `apps/web/src/app/[locale]/(marketing)/intro/LandingIntro.tsx`:

```tsx
'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { markIntroPlayed, shouldPlayIntro } from './intro-session';

const N_MARK_LIGHT = '/media/logos/transparent/light-logo-only-transparent.png';
const N_MARK_DARK = '/media/logos/transparent/dark-logo-only-transparent.png';
const HOLD_MS = 3000;
const REDUCED_HOLD_MS = 1000;

export default function LandingIntro() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme?.includes('dark') ?? false;

  // Decide on the client only, to avoid SSR/hydration mismatch.
  useEffect(() => {
    if (shouldPlayIntro()) {
      markIntroPlayed();
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;

    const hold = reduceMotion ? REDUCED_HOLD_MS : HOLD_MS;
    const timer = window.setTimeout(dismiss, hold);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible, reduceMotion, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="presentation"
          onClick={dismiss}
          className={`fixed inset-0 z-[100] flex items-center justify-center ${
            isDark ? 'bg-brand-dark-blue' : 'bg-white'
          }`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Horizontal lockup: N on the left, wordmark revealed to its right. */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {/* N mark: fades in large, holds, then shrinks (stays centered). */}
            <motion.div
              className="relative h-24 w-24 shrink-0 md:h-32 md:w-32"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                opacity: { duration: 0.5, ease: 'easeOut' },
                scale: { duration: 0.7, delay: 1, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <Image
                src={isDark ? N_MARK_DARK : N_MARK_LIGHT}
                alt="Neo Culture Tech logo"
                fill
                priority
                sizes="128px"
                className="object-contain"
              />
            </motion.div>

            {/* Wordmark: width expands from the logo's right edge (mask-wipe). */}
            <motion.div
              className="overflow-hidden"
              initial={reduceMotion ? false : { width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              transition={{
                width: {
                  duration: 0.8,
                  ease: 'easeInOut',
                  delay: reduceMotion ? 0 : 1.7,
                },
                opacity: { duration: 0.3, delay: reduceMotion ? 0 : 1.7 },
              }}
            >
              <div className="flex items-baseline gap-2.5 whitespace-nowrap pb-3 md:gap-3">
                <span
                  className={`relative font-black text-3xl uppercase leading-none tracking-wide md:text-5xl ${
                    isDark ? 'text-brand-white' : 'text-brand-dark-blue'
                  }`}
                >
                  NEO CULTURE
                  <span className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-brand-light-yellow md:h-1.5" />
                </span>
                <span className="font-black text-3xl text-brand-light-blue uppercase leading-none tracking-wide md:text-5xl">
                  TECH
                </span>
              </div>
            </motion.div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              dismiss();
            }}
            className={`absolute right-6 bottom-6 text-sm underline-offset-4 transition hover:underline ${
              isDark
                ? 'text-brand-white/60 hover:text-brand-white'
                : 'text-brand-dark-blue/60 hover:text-brand-dark-blue'
            }`}
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (from `apps/web`):
```bash
bunx vitest run "src/app/[locale]/(marketing)/intro/LandingIntro.test.tsx"
```
Expected: PASS (4 passed).

- [ ] **Step 5: Format, then stage for owner commit**

```bash
bun format-and-lint:fix
git add "apps/web/src/app/[locale]/(marketing)/intro/LandingIntro.tsx" "apps/web/src/app/[locale]/(marketing)/intro/LandingIntro.test.tsx"
```
Suggested commit message (owner runs `git commit`):
```
feat(landing): full-color two-stage intro logo reveal with brand wordmark
```

---

### Task 3: Mount the intro on the landing page — UNCHANGED (already in tree)

**Files:**
- `apps/web/src/app/[locale]/(marketing)/page.tsx` — already renders `<LandingIntro />` above the hero inside a fragment.

- [ ] **Step 1: Verify the mount and typecheck/lint**

Run (from `apps/web`):
```bash
bun format-and-lint
```
Expected: no errors. If `page.tsx` does not yet import and render `LandingIntro`, add it per the first-pass plan.

- [ ] **Step 2: Manual smoke test**

Run (from repo root):
```bash
bun dev --filter @ncthub/web
```
Open `http://localhost:3000/`:
- First load: full-color N fades in **large**, holds ~1s, **shrinks**, then "NEO CULTURE" + "TECH" wordmark **mask-wipes in** below it (yellow underline under "NEO CULTURE" only), on a **white** backdrop; whole thing fades (~3.5s) to reveal the hero.
- Reload same tab: intro does **not** replay.
- Dismiss: click / `Esc` / **Skip** (bottom-right, dark text).
- Light & dark theme: identical (white backdrop, full-color logo).
- OS "Reduce motion": static final lockup, no big-shrink/wipe; scroll locked while up.

- [ ] **Step 3: Full intro test run, format, then stage for owner commit (page only if changed)**

```bash
# from apps/web
bunx vitest run "src/app/[locale]/(marketing)/intro"
bun format-and-lint:fix
git add "apps/web/src/app/[locale]/(marketing)/page.tsx"
```
Expected: all intro tests pass (7 total).
Suggested commit message if `page.tsx` changed (owner runs `git commit`):
```
feat(landing): mount intro logo-reveal on the landing page
```

---

## Section-complete commit message

Once all tasks are reviewed and approved, the Intro section is complete.
Suggested single section commit message (owner runs):

```
feat(landing): add once-per-session intro logo-reveal animation

Full-screen white overlay that plays a two-stage brand reveal (full-color N
enters large, holds, shrinks, then the "NEO CULTURE / TECH" wordmark mask-wipes
in below with a yellow underline). Plays once per session, skippable
(click/Esc/Skip), respects prefers-reduced-motion, and adds no first-paint/LCP
cost.
```

---

## Self-Review notes

- **Spec coverage:** two-stage big→shrink (Task 2 N `scale` delay 1.0s), ~3.5s (HOLD_MS 3000 + 0.5s fade), white backdrop (`bg-white`), full-color logo (`light-logo-only-transparent.png`), brand-exact wordmark — "NEO CULTURE" navy + "TECH" teal + yellow underline under NEO CULTURE only via `border-b` (Task 2 spans), vertical lockup (flex-col), mask-wipe (clipPath), once-per-session (Task 1 + mount effect), skippable click/Esc/Skip (handlers), reduced-motion (`reduceMotion` branches + 1000ms hold), overlay-only/no LCP cost (Task 3), scroll lock (effect). All covered.
- **Placeholder scan:** none — all steps contain full code/commands.
- **Type consistency:** `shouldPlayIntro`/`markIntroPlayed` and session key `nct_intro_played` consistent across tasks; `LandingIntro` default export consumed by `page.tsx`; test queries ('NEO CULTURE', 'TECH') match the literal uppercase text rendered in the component (no reliance on CSS `uppercase` for the DOM text).
```
