# Landing Page Redesign — Design Spec

- **Date:** 2026-10-11
- **Author:** DungDao59
- **App:** `apps/web` (`@ncthub/web`)
- **Route:** `/` → `src/app/[locale]/(marketing)/page.tsx`
- **Status:** In progress — designed section-by-section

> **Git note:** All commits and pushes are performed by the repository owner.
> This spec and any future implementation are staged/committed manually by the
> user, not by the agent.

---

## 1. Overview

Redesign the NCT Hub marketing landing page (`/`) into a cohesive,
story-driven experience that clearly communicates what Neo Culture Tech is,
while keeping first paint fast. The eventual north star is a scroll-driven
narrative anchored by a persistent 3D NCT logo, but that 3D layer is **out of
scope for now** and will be layered on only after the content/IA of each
section is finalized.

### Goals
- A clear, modern landing page that tells newcomers who NCT is and converts
  them toward Gen 8 recruitment.
- Performance-first: no regression to LCP / first paint.
- Content and information architecture locked **before** any 3D work.

### Non-goals (deferred)
- The 3D scroll-storytelling model and sticky-canvas scene (separate later
  phase, built on top of this finalized content).
- The About page redesign (its own spec — see Phasing).

---

## 2. Phasing & workflow

This effort ships **one page at a time**, and **one section at a time** within
each page:

1. **Landing page** (this spec) — designed section-by-section. Each section is
   presented for approval, then implemented and reviewed before moving to the
   next.
2. **About page** — separate spec, same section-by-section workflow.
3. **3D storytelling layer** — later phase, added on top of the finalized
   landing content.

Within this spec, each Landing section is tracked below. Only the **Intro**
section is fully designed at this point; the rest are intentionally marked
*Pending design* and will be expanded as we iterate.

### Landing page section status
| # | Section | Status |
|---|---------|--------|
| 0 | **Intro (logo reveal)** | ✅ Designed (this spec) — build first |
| 1 | Hero | ⏳ Pending design |
| 2 | About (values + stats + activities) | ⏳ Pending design |
| 3 | Events (upcoming / past / empty state) | ⏳ Pending design |
| 4 | Our Departments (4 cards) | ⏳ Pending design |
| 5 | Final CTA | ⏳ Pending design |
| 6 | Footer | ⏳ Pending design |

---

## 3. Section 0 — Intro (logo reveal) — **DESIGNED**

### 3.1 Concept
A full-screen overlay on first load that plays a **two-stage logo reveal**, then
fades away to reveal the Hero already rendered beneath it.

Sequence: **large N mark enters centered → holds ~1s → shrinks (staying
centered) → "NEO CULTURE TECH" wordmark mask-wipes out to the right of the N →
whole lockup fades out slowly.**

The final lockup is **horizontal** (N on the left, wordmark to its right, yellow
underline under "NEO CULTURE"). The wordmark reveal is a left→right mask-wipe
that appears to emanate from the N's right edge (its container width expands from
0), which also re-centers the N + wordmark as a group.

### 3.2 Decisions (locked)
- **Technique:** Pure code — `framer-motion` (already a dependency). No video,
  no Lottie, no new assets.
- **Word reveal style:** left-to-right **mask-wipe** (underline revealed within
  the same wipe).
- **Total duration:** **~3.5s** (big-logo hold + shrink + reveal + fade).
- **Theme-aware (driven by the site's dark/light toggle via `next-themes`
  `useTheme().resolvedTheme`).** Two variants of the *same* lockup + motion:

  | | **Light theme** | **Dark theme** |
  |---|---|---|
  | Backdrop | pure white (`bg-white`) | `brand-dark-blue` |
  | N asset | `light-logo-only-transparent.png` (full-color filled) | `dark-logo-only-transparent.png` (neon outline) |
  | "NEO CULTURE" | `brand-dark-blue` | `brand-white` |
  | "TECH" | `brand-light-blue` | `brand-light-blue` |
  | Underline | `brand-light-yellow` | `brand-light-yellow` |
  | Skip text | dark (`brand-dark-blue`) | light (`brand-white`) |

  The dark variant intentionally mirrors the **hero header** treatment
  ("NEO CULTURE" white + yellow underline, "TECH" light-blue).
- **Font:** `Noto Sans` (global site font via `next/font/google`), weight
  `font-black`, all-caps, wide tracking. The full wordmark PNG is **not** used;
  the wordmark is rendered as **styled text**.
- **Wordmark lockup (both themes):** horizontal — N mark on the **left**, wordmark
  to its **right**. "NEO CULTURE" and "TECH" on one line, baseline-aligned, weight
  `font-black`, `uppercase`, `tracking-wide`; yellow underline bar beneath
  **"NEO CULTURE" only** (absolutely positioned so it never shifts "TECH"). Use
  the `brand-*` Tailwind classes.

### 3.3 Motion beats (~3.5s)
1. **0.0–0.5s** — the theme backdrop fills the viewport; the theme **N mark**
   fades in at **large** scale (~1.6×), centered.
2. **0.5–1.0s** — N **holds large**.
3. **~1.0–1.7s** — N **shrinks/settles** to its final size (scale → 1.0),
   staying centered.
4. **~1.7–2.5s** — the **wordmark reveals to the right** of the N via a left→right
   **mask-wipe** (its container width expands from 0; text + yellow underline
   revealed together), re-centering the N + wordmark as a group.
5. **~2.5–3.0s** — brief hold on the complete lockup.
6. **~3.0–3.5s** — entire lockup + backdrop **fade out** (~0.5s), revealing the
   Hero beneath; overlay then unmounts.

### 3.4 Behavior (UX requirements)
- **Overlay only.** The real page (Hero and all content) renders underneath the
  whole time. The intro is `position: fixed`, fades out, then unmounts — so it
  adds **no SEO / first-paint / LCP cost** to the content.
- **Once per session.** Gate playback via `sessionStorage` (e.g.
  `nct_intro_played`). Returning visitors and in-session client navigations skip
  straight to the Hero.
- **Skippable.** A subtle "Skip" affordance (theme-appropriate text color);
  click/tap anywhere or `Esc` also dismisses immediately.
- **Reduced motion.** Users with `prefers-reduced-motion: reduce` do not see
  motion — the final lockup (N at normal size + wordmark) is shown briefly then
  fades. No scale/wipe animations.
- **Theme-aware.** Backdrop, N asset, wordmark colors, and Skip color follow the
  site's dark/light toggle (`resolvedTheme`). If the theme is toggled mid-play,
  the overlay re-renders in the new theme's colors.
- **No scroll lock surprises.** While the overlay is up, background scroll is
  disabled; restored on dismiss.

### 3.5 Component shape (proposed)
```
(marketing)/
  intro/
    LandingIntro.tsx        ← 'use client'; fixed overlay, framer-motion timeline,
                              session gate, skip + reduced-motion handling
  page.tsx                  ← renders <LandingIntro /> above the existing sections
```
- `LandingIntro` is self-contained and client-only; `page.tsx` stays a thin
  orchestrator. The component owns its own session/reduced-motion checks so it
  can be dropped in without touching Hero logic.

### 3.6 Testing
- **Vitest:**
  - Session gate: renders the overlay when `sessionStorage` flag is absent;
    does **not** render when the flag is set.
  - Reduced-motion branch: no motion variants applied when the media query
    matches.
  - Skip handler sets the session flag and unmounts the overlay.
- **Manual:**
  - First load plays intro; reload within the session skips it.
  - `Esc` / click dismisses.
  - Dark and light themes both show the correct logo + readable wordmark.
  - Lighthouse on `/`: LCP unaffected (intro is an overlay; Hero renders under).

### 3.7 Dependencies / open items
- None blocking. Uses existing `framer-motion` + existing PNG logos.
- (Future, optional upgrade noted during design: a true "N morphs into the
  letterforms" effect would require an **SVG** logo or a **Lottie** file. Not in
  scope for the staged-reveal version.)

---

## 4. Later sections (pending design)

Each will be expanded in its own iteration, approved, then implemented. Summary
of intended content (from requirements) for context:

- **Hero:** one-line positioning ("The tech community for SSET students at
  RMIT"), **Join Us** CTA, **Gen 8 recruitment status badge = Open** (launching
  during recruitment). Photo collage + stat block removed from hero.
- **About:** 2–3 sentence intro; 3 core values (Innovation, Collaboration,
  Excellence); stats bar (**founded 2020**, 7 generations, 4 core teams, 170+
  NEO League competitors); one line on activities (workshops, tech talks,
  hackathons, mentorship); "Our journey →" link.
- **Events:** upcoming first (**manual "upcoming" tag**), then past (**manual
  date per past event**; featured highlight: *NEO League – Prompt the Future
  2025*); empty state ("Stay tuned – follow our fanpage for updates").
- **Our Departments:** 4 cards (Technology, Marketing, Human Resources, FinLog)
  — what the team does + who it suits; "Learn more →" per card.
- **Final CTA:** "Ready to join Gen 8?" — **Apply now** (primary) + **More about
  us** (secondary).
- **Footer:** existing footer; links unchanged; partner logo strip added later.

### Known data corrections (apply when those sections are built)
- **Founded year = 2020** (canonical). Correct any "2021" references in stats.
- Remove the **"40th member milestone"** from the 2023 timeline entry
  (`about/data.ts`) — it contradicts "50+ members" in 2022.
- Generation switcher stays **Gen 6 & 7** until Gen 8 data is provided.
- Real copy/numbers (value descriptions, exact stats, partners) to be supplied
  by the owner during each section's design.

---

## 5. Suggested branch

```
feat/landing-page-redesign
```
