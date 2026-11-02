# Why Us Section Redesign — Design Spec

**Date:** 2026-10-18
**Branch:** feat/landing-page-redesign
**File touched:** `apps/web/src/app/[locale]/(marketing)/why-us.tsx` (+ new `why-us.test.tsx`)

## Goal

Turn the final "Why Us?" section into the landing page's climax: remove its
redundancy with the new Departments section, elevate the Join conversion, and
give it a distinct dark-panel finale. (Imagery is intentionally NOT added here per
owner's decision — this section stays icon/text based.)

## Scope (owner-chosen)

- **#2 De-duplicate:** replace the "CLUB DEPARTMENTS" card (which now duplicates
  the Departments section) with a fresh **Hands-on Experience** value prop.
- **#3 Climax CTA:** add a prominent closing Join band → **JD Booklet**
  (`https://rmitnct.site/jdbooklet`), echoing the hero's "Recruitment – Semester
  C 2026".
- **#4 Distinct finale:** wrap the cards + climax band in a dark
  `brand-dark-blue` panel with light text, so the scroll clearly changes gear
  from the light Departments panel above.
- **#5 Polish:** feature rows use `Check` (not a generic yellow `Star`); card
  styling tuned for the dark panel.
- NOT doing #1 (no club imagery in this section).

## Content

Header is unchanged (already standard form): Sparkles eyebrow + giant
**Why Us?** + subheadline. It stays on the page background, above the panel.

Three value-prop cards (each keeps its gradient accent for icon ring + badge):

1. **HANDS-ON EXPERIENCE** (replaces Club Departments)
   - icon `Rocket`, gradient `from-yellow-400 to-orange-500`, badge "Learn by Building"
   - description: "Learn by building. Work on real projects, join technical
     workshops, and compete in challenges like Neo League that turn curiosity
     into real capability."
   - features: Real Club Projects · Technical Workshops · Competitions &
     Hackathons · Portfolio-ready Work
   - CTA: **"See What We Do"** → `#events` (internal anchor; `ArrowRight`)

2. **NETWORKING** (kept)
   - icon `Users`, gradient `from-blue-400 to-cyan-500`, badge "Career Growth"
   - description unchanged
   - features unchanged
   - CTA: **"Meet Our Team"** → `/about` (internal; `ArrowRight`)

3. **MEMBERSHIP** (kept)
   - icon `Heart`, gradient `from-purple-400 to-pink-500`, badge "Inclusive Community"
   - description unchanged
   - features unchanged
   - CTA: **"Join Neo Culture Tech"** → `https://rmitnct.site/recruitment`
     (external; `ExternalLink`)

Climax band (below the cards, inside the dark panel):
- small eyebrow/line: "Recruitment open — Semester C 2026" (brand-light-yellow)
- headline: "Ready to find your role?"
- primary button: **"View JD Booklet"** → `https://rmitnct.site/jdbooklet`
  (external, `ExternalLink`), styled prominent on dark
  (`bg-brand-light-yellow text-brand-dark-blue`).

## Visual treatment

- **Panel:** `rounded-3xl bg-brand-dark-blue p-6 shadow-2xl sm:p-10 md:p-12`
  wrapping the grid + climax band. `brand-dark-blue` is dark in both themes
  (verified), so white text is safe.
- **Cards on dark:** `border border-white/10 bg-white/5 text-white
  backdrop-blur-sm hover:-translate-y-1 hover:border-white/25 hover:bg-white/10`.
  - Icon ring unchanged gradient; the inner circle bg becomes `bg-brand-dark-blue`
    so the ring reads on dark; icon `text-white`.
  - Title `text-white`; description `text-white/70`; feature text `text-white/70`
    with a `Check` icon in `text-brand-light-blue`.
  - Badge keeps its gradient.
  - Card CTA buttons: `variant="outline"` with
    `border-white/30 bg-transparent text-white hover:bg-white
    hover:text-brand-dark-blue`.
- **Climax band:** centered, separated from the grid by a `border-white/15`
  top divider + padding.

## Motion / a11y

- Keep framer-motion reveal-on-scroll + per-card stagger (as today).
- External links keep `target="_blank" rel="noopener noreferrer"` + aria-label.
- Icons `aria-hidden`.

## Testing

New `why-us.test.tsx` (mock `matchMedia` + `IntersectionObserver`):
1. Renders heading containing "Why Us?".
2. Renders the three card titles: HANDS-ON EXPERIENCE, NETWORKING, MEMBERSHIP.
3. Does NOT render the old "CLUB DEPARTMENTS" title.
4. Renders the climax "View JD Booklet" link → `rmitnct.site/jdbooklet`.
5. Renders the recruitment link → `rmitnct.site/recruitment`.

## Out of scope / non-goals

- No club imagery in this section (owner decision).
- No change to `page.tsx`, routes, or other sections.
- No repo-wide formatting; scoped Biome only.

## Workflow constraints

- Only `why-us.tsx` (+ its test) change. Verify footprint with `git status --short`.
- Lint via `bunx @biomejs/biome check --write "<exact path>"`.
- **All git commits/pushes are the owner's.**
