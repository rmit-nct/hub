# Hero Section Redesign — Design Spec

**Date:** 2026-10-19
**Branch:** feat/landing-page-redesign
**File touched:** `apps/web/src/app/[locale]/(marketing)/hero-section.tsx` (+ new `hero-section.test.tsx`)
**Reference:** `~/Downloads/hero-landing-page.jpeg` (Canva demo — "NEO CULTURE TECHNOLOGY" hero)

## Goal

Rebuild the landing hero to match the demo's **layout + content organization** —
a single bold gradient panel with an oversized centered wordmark and the N logo
as the centerpiece — while keeping the **club's default brand colors** and
reusing the current hero's copy. Hero only; no nav/chrome, no photo gallery.

## What stays / goes

- **Keep (reused copy):** the "Founded in 2020 … SSET students … RMIT" tagline,
  the blinking "Recruitment now for Semester C – 2026" status (machine blink +
  green dot), and the two CTAs (Join Now → recruitment, Learn More → /about).
- **Remove:** the two-column layout, the `ExpandingPhotoGrid` / `RotatingImage`
  photo gallery, and all its photo data arrays. The small boxed logo chip is
  replaced by the large centered N.
- **Colors:** club brand tokens only (theme-aware); NOT the demo's exact blue/cream.

## Layout

One rounded **brand-blue gradient panel**, roughly one screen tall, centered content:

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│              NEO  CULTURE  TECH                         │  ← wordmark, ~80% width, centered
│                                                        │
│   Founded in 2020 —        ╱╲      ● Recruitment C-2026 │
│   best club for SSET      (  N  )   [ Join Now ]        │  ← md+: 3-col row under wordmark
│   students at RMIT        ╲╱        [ Learn More ]      │     left=tagline · center=N · right=status+CTAs
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Panel
- `relative overflow-hidden rounded-3xl` with a brand gradient:
  `bg-gradient-to-br from-brand-light-blue via-brand-light-blue to-brand-dark-blue`.
  (Dark-blue end keeps light text legible in both themes.)
- Generous padding: `px-6 py-14 sm:px-10 sm:py-16 md:px-16 md:py-20`.
- Min height ~ screen: `min-h-[calc(100svh-6rem)]`, content vertically centered
  (`flex flex-col justify-center`).
- All text inside is light (white/cream) since the panel is always dark-blue.

### Wordmark (centerpiece, ~80% width)
- `NEO CULTURE TECH`, big bold condensed uppercase, centered, spanning most of
  the width via large responsive sizing:
  `font-black uppercase tracking-tight text-5xl sm:text-7xl lg:text-8xl`.
- Club treatment: `NEO CULTURE` in brand-white/cream with a
  `border-b-4 border-brand-light-yellow` underline accent; `TECH` in
  `text-brand-light-blue`. Wraps gracefully on small screens.

### Center + flanking content (the row under the wordmark)
- `md:grid md:grid-cols-[1fr_auto_1fr] md:items-center` (stacks to one column on
  mobile). Three cells:
  1. **Left (tagline)** — `md:text-right`, `text-white/80`: "Founded in 2020 —
     the best club for SSET students to explore technology at RMIT University."
     ("SSET students" keeps the yellow-underline accent.)
  2. **Center (N logo)** — the existing logo-only PNG, compact and centered with
     breathing room: `h-40 w-40 sm:h-52 sm:w-52 md:h-60 md:w-60`. Use the bright
     full-color variant `/media/logos/transparent/light-logo-only-transparent.png`
     (navy + teal + yellow N).
  3. **Right (status + CTAs)** — `md:text-left`:
     - Blinking **Recruitment now for Semester C – 2026** (green dot + `.nct-blink`).
     - **Join Now** button (brand-light-yellow bg, dark text) →
       `https://rmitnct.site/recruitment` (external).
     - **Learn More** button (outline, white) → `/about` (i18n `Link`).

### Mobile stack order
wordmark → tagline → N logo → status + buttons (single column, centered).

## Motion / a11y

- Keep the `motion.section` entrance + per-cell `whileInView` fade; respect
  `useReducedMotion`.
- Keep `BLINK_CSS` (hard machine blink; disabled under reduced motion).
- The N logo is fixed to the bright full-color variant (not theme-aware), so no
  theme hook / `mounted` guard is needed.
- Logo `<Image>` has descriptive `alt="Neo Culture Tech logo"`; decorative dot
  `aria-hidden`.

## Testing

New `hero-section.test.tsx` (mock matchMedia + IntersectionObserver):
1. Renders the wordmark (h1 textContent contains "NEO CULTURE" and "TECH").
2. Renders the blinking recruitment text "Recruitment now for Semester C - 2026".
3. Renders a Join Now link → `rmitnct.site/recruitment`.
4. Renders a Learn More link → `/about`.
5. Renders the N logo image (`getByRole('img')`).

(If the i18n `Link` is used for Learn More, mock `@/i18n/routing` to a plain
anchor in the test, as done in `summarized-departments.test.tsx`.)

## Out of scope / non-goals

- No nav bar, no "Get Started" pill, no photo gallery.
- No change to `page.tsx` or other sections.
- No new image assets (reuse existing logo PNG).
- No repo-wide formatting; scoped Biome only.

## Workflow constraints

- Only `hero-section.tsx` (+ its test) change. Verify footprint with `git status --short`.
- Lint via `bunx @biomejs/biome check --write "<exact path>"`.
- **All git commits/pushes are the owner's.**
