# Events Section Redesign — Design Spec

**Date:** 2026-10-18
**Branch:** feat/landing-page-redesign
**File touched:** `apps/web/src/app/[locale]/(marketing)/events.tsx` (only)

## Goal

Redesign the marketing landing `Events` section to lead with **upcoming** events
and demote **past** events to a curiosity teaser that pushes visitors to the
club's Facebook. Serves the landing north star: impress a visitor who clicked
"see more" and nudge them to explore / follow.

## Design constraints honored

- **Distinct section:** unlike the neighboring paneled sections (Who We Are /
  Memorable Moments use a `rounded-3xl bg-background/60` panel), this section is
  **panel-less** — cards float directly on the page's gradient background and
  read as an open gallery. The contrast on scroll is the distinctness mechanism
  here. (This is an intentional, approved exception to the "contrasting rounded
  panel" default for this one section.)
- **Imagery everywhere:** every card is image-backed with real club photos.
- **Standard header:** eyebrow badge flanked by `Calendar` icons + giant
  headline, matching the Who We Are form.

## Layout

```
                    ◇ ── UPCOMING EVENTS ── ◇        (eyebrow badge + Calendar icons)
                       Upcoming  Events              (giant headline; "Events" in
              Don't miss what's coming up this sem.   brand-light-blue + yellow underline)

  (no panel — cards on the gradient background)

  ┌─────────────────────────┐  ┌───────────────┐
  │ [Coming Soon]           │  │ [Coming Soon] │
  │   FEATURED image        │  │  compact      │
  │   Title / hook          │  └───────────────┘
  │   📅 TBA   📍 TBA       │  ┌───────────────┐
  │   (no button)           │  │ [Coming Soon] │
  └─────────────────────────┘  │  compact      │
                               └───────────────┘

  ── ALREADY HAPPENED ──  Past Highlights   (small eyebrow label, NOT giant)

  ┌───────────┐  ┌───────────┐  ┌───────────┐
  │  image    │  │  image    │  │  image    │
  │  Title    │  │  Title    │  │  Title    │
  │  desc…    │  │  desc…    │  │  desc…    │
  │ 📅MM/YYYY │  │ 📅MM/YYYY │  │ 📅MM/YYYY │
  │ 📍Loc     │  │ 📍Loc     │  │ 📍Loc     │
  │[See detail→]│ │[See detail→]│ │[See detail→]│  → each event's Facebook post
  └───────────┘  └───────────┘  └───────────┘

            [ See all events on Facebook → ]   → facebook.com/rmit.nct
```

### Header
- `container mx-auto`, centered.
- Eyebrow: `Badge variant="outline"` ("Upcoming Events" / "What's Next") flanked
  by two `Calendar` icons — same treatment as Who We Are's Sparkles eyebrow.
- Headline `<h2>`: `font-bold text-4xl md:text-6xl lg:text-8xl`, word "Events"
  wrapped in `text-brand-light-blue border-b-4 border-brand-light-yellow`.
- Subheadline `<p class="text-muted-foreground">`.

### Zone 1 — Upcoming (focus)
- **No surrounding panel.** A responsive bento: 1 **featured** card (large,
  spans 2 cols on desktop) + 1–2 **compact** cards beside/stacked. On mobile all
  stack full-width, featured first.
- Each upcoming card (`EventCard` featured/compact variant):
  - Image background + dark top-gradient overlay (for legible text).
  - **Status pill:** always `Coming Soon` (top-left on image).
  - **Title** + **short description** (hook, 1–2 lines).
  - **Meta row:** `📅 TBA` (`Calendar`) · `📍 TBA` (`MapPin`).
  - **No CTA button.**

### Zone 2 — Past (teaser, demoted)
- Thin divider + a **small** left-aligned eyebrow label ("Past Highlights" /
  "— ALREADY HAPPENED") — deliberately not the giant header, to keep hierarchy.
- **3 compact `EventCard`s**, same component/format, each with:
  - Image, title, short description.
  - **Meta row:** `📅 MM/YYYY` + `📍 Location`.
  - **"See details →"** button linking to that event's own Facebook post
    (`target="_blank" rel="noopener noreferrer"`).
- Below the three: one centered **"See all events on Facebook →"** button →
  `https://www.facebook.com/rmit.nct`.

## Components (single file)

- `EventCard({ event, variant })` — shared card used by both zones. `variant`:
  `'featured' | 'compact'`. Renders image, overlay, status pill, title,
  description, meta row, and (only when `event.href` is present) a
  "See details →" button. Upcoming cards omit `href` → no button; past cards
  include `href` → button renders.
- `Events()` — default export. Renders header, upcoming bento, past grid, global
  Facebook button. Framer-motion staggered reveal-on-scroll, `useReducedMotion`
  respected, `viewport={{ once: true }}`.

## Data model

Reuse/trim the existing `EventType`:

```ts
type EventType = {
  src: string;          // image path under /public
  title: string;
  description: string;
  date: string;         // upcoming: 'TBA'; past: 'MM/YYYY'
  location: string;     // upcoming: 'TBA'; past: real location
  status: string;       // upcoming: 'Coming Soon'; past: e.g. 'Past'
  href?: string;        // past only → Facebook post; upcoming omits → no button
};
```

Two arrays: `upcomingEvents` (2–3 items) and `pastEvents` (3 items).

## Content to finalize (owner-provided)

**Upcoming (2–3) — only the title + image + description hook are needed; date,
location, status are fixed (`TBA` / `TBA` / `Coming Soon`):**
1. _title TBD_ — image TBD
2. _title TBD_ — image TBD
3. _(optional) title TBD_ — image TBD

Scaffold defaults (replaceable) will use existing hero/event imagery so the
section renders before real copy lands.

**Past (3) — defaults drawn from existing data, confirm titles + Facebook links:**
1. Neo League 2025 — `/media/marketing/neo-league/neo-league-2025.png` —
   📅 05/2025 · 📍 RMIT Campus — FB link: _confirm_ (existing data points to
   `https://nova.ai.vn`, needs a Facebook post URL).
2. Netcompany Tour — `/media/marketing/events/netcompany-tour.jpg` —
   📅 08/2025 · 📍 Netcompany Campus — FB: `https://www.facebook.com/share/p/16J9j3s46A/`.
3. CV Workshop — `/media/marketing/workshops/cv-workshop.jpg` —
   📅 09/2025 · 📍 RMIT Campus — FB: `https://www.facebook.com/share/p/1aLwzokR2b/`.

## Testing

Update/replace `events`-related tests (new `events.test.tsx` alongside, mocking
`matchMedia` + `IntersectionObserver` like `who-we-are.test.tsx`):
1. Renders the giant heading containing "Upcoming Events".
2. Renders the "Coming Soon" status on upcoming cards.
3. Renders upcoming meta as "TBA".
4. Renders the "Past Highlights" label and at least 3 past images.
5. Renders a "See all events on Facebook" link pointing at `facebook.com/rmit.nct`.

## Out of scope / non-goals

- No panel wrapper, no changes to `page.tsx` layout wrapper, no global CSS.
- No registration backend / forms — upcoming cards are teasers only.
- No repo-wide formatting; scoped Biome on the touched file(s) only.

## Workflow constraints

- Only `apps/web/src/app/[locale]/(marketing)/events.tsx` (+ its test) change.
- Lint via `bunx @biomejs/biome check --write "<exact path>"` — never the
  repo-wide script.
- Verify footprint with `git status --short`.
- **All git commits/pushes are the owner's.**
