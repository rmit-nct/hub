# Departments Section Redesign — Design Spec

**Date:** 2026-10-18
**Branch:** feat/landing-page-redesign
**File touched:** `apps/web/src/app/[locale]/(marketing)/summarized-departments.tsx` (+ new `summarized-departments.test.tsx`)

## Goal

Redesign the landing "Our Departments" section so it matches the visual family
of the redesigned Events / Who We Are sections, presents richer per-department
information, and drives visitors into each department's detail page. Serves the
north star: impress the visitor and push them to explore further.

## Design constraints honored

- **Distinct section:** content sits inside a big **panel** (`rounded-3xl
  bg-background/60 backdrop-blur-xl shadow-2xl`, same as Who We Are / Memorable
  Moments) — contrast against the panel-less Events section above it.
- **Imagery everywhere:** each card is image-topped with real department photos.
- **Standard header:** eyebrow badge flanked by icons + giant headline, matching
  the Events section header form.

## Content source (no invented copy)

All text is pulled from the existing `./about/data.ts` `departments` array:

- `characteristics.bio` → the card **tagline** (e.g. Technology → "Develop tools
  for member use").
- `activities.items[].title` → the **"What we do"** list (3 titles per dept).
- `characteristics.badges` → the **trait chips** (show the first 3).
- department image → reuse the current `departmentCards[].image` per department
  (already curated), keyed by department name.

The three core departments shown (as today): **Technology, Human Resources,
Marketing** (`CoreDepartmentName`).

## Layout

```
                 ◇ ── OUR STRUCTURE ── ◇            (eyebrow badge + Network icons)
                     Our Departments                (giant; "Departments" blue + yellow underline)
               Three teams, one mission             (subheadline)

  ┌───────────────────────────────────────────────────────────┐  ← big panel
  │  ┌────────────┐   ┌────────────┐   ┌────────────┐          │
  │  │  (image)   │   │  (image)   │   │  (image)   │          │
  │  ├────────────┤   ├────────────┤   ├────────────┤          │
  │  │ ◉ Technology│  │ ◉ Human Res.│  │ ◉ Marketing │         │
  │  │ tagline…    │  │ tagline…    │  │ tagline…    │         │
  │  │ What we do  │  │ What we do  │  │ What we do  │         │
  │  │  › item 1   │  │  › item 1   │  │  › item 1   │         │
  │  │  › item 2   │  │  › item 2   │  │  › item 2   │         │
  │  │  › item 3   │  │  › item 3   │  │  › item 3   │         │
  │  │ [chip][chip]│  │ [chip][chip]│  │ [chip][chip]│         │
  │  │ [Explore →] │  │ [Explore →] │  │ [Explore →] │         │
  │  └────────────┘   └────────────┘   └────────────┘          │
  └───────────────────────────────────────────────────────────┘
```

Mobile: cards stack single-column inside the panel.

### Header
- `container mx-auto`, centered, on the page background (above the panel).
- Eyebrow: `Badge variant="outline"` with text "Our Structure", flanked by two
  `Network` icons (`text-brand-light-blue`), same treatment as Events' Calendar
  eyebrow.
- Headline `<h2>`: `font-bold text-4xl md:text-6xl lg:text-8xl`; the word
  "Departments" wrapped in `text-brand-light-blue border-b-4
  border-brand-light-yellow whitespace-nowrap`.
- Subheadline `<p class="text-muted-foreground">`: "Three teams, one mission".

### Panel
- `rounded-3xl border border-border/50 bg-background/60 p-6 shadow-2xl
  backdrop-blur-xl sm:p-8 md:p-10`.
- Inside: `grid gap-6 md:grid-cols-3`.

### Card (keeps per-department accent color)
Per-department accent is already defined in the current file
(`color` / `hoverColor`) using `dynamic-blue` (Technology), `dynamic-purple`
(Human Resources), `dynamic-orange` (Marketing). Extend that accent to the icon,
chips, and CTA. Card anatomy, top to bottom:

1. **Image** — `aspect-video`, `object-cover`, `group-hover:scale-105`.
2. **Name row** — accent-colored icon (`Network`/dept icon) + `h3` name.
3. **Tagline** — `characteristics.bio`, muted.
4. **"What we do"** — a small uppercase label + list of the 3
   `activities.items[].title`, each prefixed with a `›`/chevron marker.
5. **Trait chips** — first 3 `characteristics.badges` as small accent-tinted
   pills.
6. **CTA** — a `Button` labelled **"Explore <Department> →"** in the accent
   color; `ArrowRight` nudges right on hover. Links (via `next-intl` `Link`) to
   `/about?department=<encoded name>#about-departments` (unchanged destination).

Card hover: `-translate-y-1` lift (as today) + image zoom + CTA arrow nudge.
Whole card is no longer a single link — the explicit CTA is the action.

### Motion / a11y
- framer-motion staggered reveal-on-scroll (`whileInView`, `viewport once`),
  matching the current stagger.
- Respect `useReducedMotion` for the reveal (consistent with other sections).
- Icons `aria-hidden`; CTA is a real link with descriptive text.

## Data shape (local to the file)

```ts
type DeptCard = {
  name: CoreDepartmentName;
  tagline: string;       // characteristics.bio
  image: string;         // curated image per department
  activities: string[];  // activities.items[].title (3)
  badges: string[];      // characteristics.badges.slice(0, 3)
  // accent class groups:
  text: string;          // e.g. 'text-dynamic-blue'
  chip: string;          // e.g. 'bg-dynamic-blue/10 text-dynamic-blue'
  button: string;        // accent button classes
  cardHover: string;     // border/bg hover classes (existing)
};
```

Build the array by mapping the existing `departments` data (filtered to the 3
core names) + a small per-name accent/image lookup. This keeps copy DRY with
`data.ts`.

## Testing

New `summarized-departments.test.tsx` (mock `matchMedia` +
`IntersectionObserver`, like the other section tests):
1. Renders the giant heading containing "Our Departments".
2. Renders all three department names (Technology, Human Resources, Marketing).
3. Renders a "What we do" label and at least one known activity title
   (e.g. "Project Development").
4. Renders an "Explore" CTA linking to `/about?department=` for each department
   (at least 3 such links).
5. Renders department images (>= 3).

## Out of scope / non-goals

- No change to `about/data.ts`, `about/` pages, or `page.tsx`.
- No new routes; CTA reuses the existing `/about?department=...` destination.
- No repo-wide formatting; scoped Biome on the touched file(s) only.

## Workflow constraints

- Only `summarized-departments.tsx` (+ its test) change.
- Lint via `bunx @biomejs/biome check --write "<exact path>"` — never repo-wide.
- Verify footprint with `git status --short`.
- **All git commits/pushes are the owner's.**
