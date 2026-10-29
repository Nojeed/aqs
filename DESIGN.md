# AQS design system

How the AQS site and admin look and behave. Tokens live in `src/app/globals.css` (`@theme`), shared components in
`src/components/ui/`. When something here and the code disagree, fix one of them.

## Principles

1. **Two audiences, one system.** Companies and individuals get equal paths; Arabic and English are equals.
2. **RTL is designed, not flipped.** Use logical utilities (`ms-`, `pe-`, `start-`, `text-start`) and mirror directional icons with `rtl:-scale-x-100`.
3. **Calm admin, confident site.** Public pages can be expressive; the admin stays dense, consistent and quiet.

## Colour

| Token | Use |
|---|---|
| `brand-50 … brand-950` | The AQS blues, sampled from the logo. `brand-800` primary buttons, `brand-900/950` dark bands and headings, `brand-50/100` tints and focus rings. |
| `accent-300 … 500` | Light blue highlight: hero highlight line, focus outline (`accent-500`), "Starts soon" badge (`accent-400`). Never for body text on white. |
| `silver-100 … 600` | Neutral metal from the logo, used sparingly (taglines, soft backgrounds). |
| `slate-*` (Tailwind) | Body text (`slate-700`), secondary text (`slate-500`), borders (`slate-200/300`). |
| `success / warning / danger / info` (50–900) | **States only**: valid/expired/revoked, form errors, status pills. Never use raw `emerald`, `amber`, `red` or `sky`. |
| `whatsapp`, `whatsapp-dark` | WhatsApp links only. |

Text on coloured surfaces uses that surface's tint (`text-white/70` on navy), not grey.

## Type

- **Inter** (`--font-inter`): all Latin text, headings and numbers. Stands in for Apple's SF Pro, which may not be embedded on websites.
- **Noto Sans Arabic** (`--font-noto-arabic`): all Arabic text. Stands in for SF Arabic.
- Latin display headings use -0.02em tracking (SF style); Arabic headings never get letter spacing.
- Heading sizes are fluid (`clamp()` tokens in `globals.css`), never breakpoint steps like `text-3xl sm:text-4xl`:
  - `text-display` 36→60px: home hero only.
  - `text-title` 36→48px: page titles (`PageHero`, blog post) and the closing call to action.
  - `text-heading` 30→36px: section headings (`SectionHeading`) and the home stats.
  - `text-subheading` 24→30px: card and panel headings (form cards, verify result, related lists).
  - Smaller headings inside cards and sidebars stay fixed (`text-xl`, `text-lg`).
- Headings use `text-balance`; Arabic headings get a little more line height (set in `globals.css`).
- Data uses `tabular-nums` (tables, counts, dates, phone numbers).
- No small "eyebrow" labels above headings: the heading carries the hierarchy. Breadcrumbs in page heroes are the only label above a title.
- No gradient text. Emphasis comes from weight, size or the solid accent colour.

## Shape and depth

- Radii: `rounded-xl` controls, `rounded-2xl` admin panels, `rounded-3xl` public cards, `rounded-full` pills and public buttons.
- The `card` utility is the one public card surface (hairline border + soft offset shadow). Don't nest cards.
- Shadows always have an offset and blur (`shadow-lg shadow-brand-900/10`); no zero-offset glows.

## Components (`src/components/ui/`)

Built shadcn-style (Radix primitives, `cn()` from `src/lib/utils.ts`), styled with the tokens above.

| Component | Notes |
|---|---|
| `Input`, `Textarea` | Share `controlClass`: 44px tall, `rounded-xl`, brand focus ring, `aria-invalid` turns the border danger. Admin editor fields use a compact version (`rounded-lg`, `text-sm`). |
| `Label`, `Field`, `fieldAria()` | Every control has a visible label. `Field` renders label + control + help or error; spread `fieldAria(id, { error, help })` on the control so errors are announced. |
| `Select` | Radix select (keyboard, RTL via `dir`). Items can't have an empty value, so "All" uses the value `all`. |
| `Tabs` | Radix tabs; used on the contact page (message / register). |
| `StatusBadge`, `badgeClass(tone)` | The one status pill: `success`, `warning`, `danger`, `info`, `neutral`. Publish toggle, certificate status and inbox status all use it. |
| Toasts (`sonner`) | Admin feedback. Run admin actions through `useAdminAction()` so every outcome is a toast: success in the action's own words, errors stay readable. Top-right. Public forms use inline messages instead. |
| `LevelIcon`, `CopyButton` | Level = 1/2/3 signal bars, always next to the level text. Copy shows a check mark for a moment and announces "Copied". |

### Buttons

| Family | Where | Shape |
|---|---|---|
| `btn-primary`, `btn-light`, `btn-outline`, `btn-ghost-light` | Public site | Pill, 44px+ tall. Press scales to 0.98; a trailing arrow nudges forward in the reading direction on hover. |
| `admin-btn` (+ `btn-primary rounded-lg` for the main action) | Admin | Compact rounded square; grows to 44px on touch screens (`pointer-coarse`). Press scales to 0.97. |

Both: visible focus outline (`accent-500`), `disabled` = 50–60% opacity + not-allowed cursor.

## Motion

- Library: **Motion** (`motion/react`). Tokens in `src/lib/motion.ts` (keep `--ease-smooth` in CSS in sync).
- Easing: `ease = [0.22, 1, 0.36, 1]` for UI and the hero; `easeLuxe = [0.16, 1, 0.3, 1]` for entrances. Durations: page 0.8s, reveal 0.8s, hero 0.8s; UI transitions 150–250ms.
- Entrances "rise into focus": fade, 28–32px rise and a 10px blur that clears (page transitions, scroll reveals, filtered grids, contact tabs, form success panels).
- Glass rule: `backdrop-filter` stops working while an ancestor fades or has any `filter`, even `blur(0px)`. Content containing glass only rises (`containsGlass` in `src/lib/motion.ts`), and every entrance removes its filter when it ends.
- Page transitions animate section *contents*, never section backgrounds (avoids white flashes between navy heroes).
- The hero headline and subtitle only slide (no fade) so they paint before JavaScript loads.
- Reduced motion: `MotionConfig reducedMotion="user"` drops movement and keeps fades; CSS keeps colour and opacity transitions and drops transforms.
- Admin: motion only for state (hover, press, open). No entrance choreography.

## Layout

- `container-page`: max 80rem with 16/24/32px gutters.
- Inner pages open with `py-16 lg:py-20`; home sections breathe more (`py-24 sm:py-32`); admin pages use `max-w-5xl`/`6xl` with `py-10`.
- Tap targets are at least 44px on touch screens (header language switch, footer links, admin buttons, form controls).

## Browser surfaces

`html` sets `accent-color`, `caret-color` and `scrollbar-color` from the brand; `::selection` is `brand-800` on white text;
`:focus-visible` uses a 2px `accent-500` outline.

## Data visualisation (admin dashboard)

Single-series charts use `brand-500` (`#2f5fae`, 6.2:1 on white, validated with the dataviz palette checker). Thin columns with
4px rounded tops anchored to the baseline, a recessive dashed grid, one direct label (the peak), a tooltip per column, and a
"Show as table" fallback. Add a second series only with a categorical palette validated the same way.

## Not decided yet

- **Dark mode**: not planned for launch. If added, define a second set of surface and text tokens rather than inverting.
- **Admin in Arabic**: the admin is English only by choice.
