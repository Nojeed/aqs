# Improvements tracker

Tracks UI and design-system work for the AQS site and admin panel. Tick items off as they ship and add the date.
Priority: **P1** do before or right after launch · **P2** next pass · **P3** nice to have.

Launch blockers (real contact details, fake sample certificates, env vars) live in the README's "Before going live" list.
How things should look and behave lives in `DESIGN.md`.

---

## Open

### Decisions for the client
- [ ] **How long to keep registrations and messages.** They stay until staff delete them. Pick a period (e.g. 12 months) and add it to the privacy line on the forms.
- [ ] **Dark mode**: skipped for launch (decided 2026-10-18). See `DESIGN.md`.
- [ ] **Admin in Arabic**: kept English only (decided 2026-10-18).

### After deploying
- [ ] Check link previews for the home page and one course with a social preview tool (e.g. opengraph.xyz).
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console.

---

## Done

### 2026-10-18 (second pass: the whole list)

**Public site**
- [x] shadcn-style inputs everywhere (`src/components/ui/`: Input, Textarea, Label, Field, Select, Tabs), on the registration, contact, course filter, verify and login forms
- [x] `sitemap.xml` (both languages with hreflang) and `robots.txt` (blocks `/admin`, `/api`)
- [x] Hero headline and subtitle paint before JavaScript (slide only, no fade from 0)
- [x] Privacy note on the registration and contact forms
- [x] Contact form stores messages (admin **Messages** page); WhatsApp kept as a direct alternative
- [x] Course filters saved in the URL (`?q=&level=&format=&category=&sort=`), so filtered lists can be shared
- [x] Registration without a course: contact page tab "Register for training" with a course list plus "Custom / in-house training"
- [x] Course cards show the fee and a "Starts soon" badge (within 30 days, worked out in the browser); "Upcoming first" sort
- [x] Reduced motion: keeps colour and opacity feedback, drops movement (CSS and Motion)
- [x] 44px tap targets for the header language switch, footer links and social icons
- [x] Social previews: every page has a canonical URL, AR/EN alternates, full Open Graph (site name, locale, image) and a large Twitter/X card
- [x] Browser defaults themed: `accent-color`, caret and scrollbar from the brand
- [x] Blog: related posts from the same category first
- [x] Eyebrow labels removed from section headings (kept only as breadcrumbs in page heroes)
- [x] Hero highlight: solid accent instead of gradient text

**Admin panel**
- [x] **Backups** page: every version per data file, Restore (backs up the current version first, so it can be undone) and Download
- [x] Export registrations and messages to CSV (Excel-ready, Arabic safe, formula injection guarded)
- [x] Certificates: import CSV from Excel ("Add or update" or "Replace all"), download as CSV or JSON; accepts common header names and dates like `15/03/2026`
- [x] Delete uploaded images in the media library, with a warning listing the pages that still use the image
- [x] Registration and message detail pages with a history timeline (status changes) and internal staff notes
- [x] Bulk actions: select rows to set status or delete (registrations, messages)
- [x] Tables remember sorting, filters and page size per table (this browser)
- [x] `admin-btn` grows to 44px on touch screens; press feedback
- [x] Dashboard: registrations per week (12 weeks) and per course charts, with "Show as table"
- [x] Keyboard shortcuts: `/` search, `N` new item, `Esc` clear, `?` shortcuts panel (plus `Ctrl+S` save)

**Design system**
- [x] Semantic colour tokens `success / warning / danger / info`; no raw emerald, amber, red or sky left
- [x] `whatsapp` colour token
- [x] Motion tokens (`src/lib/motion.ts`, `--ease-smooth`)
- [x] One `StatusBadge` / `badgeClass` for every status pill
- [x] One `Field` primitive with aria wiring for labels, help and errors
- [x] Button families documented and aligned (disabled, active, focus)
- [x] `DESIGN.md` written
- [x] Unit tests for CSV import/export (`npm test`)

### 2026-10-18 (first pass)
- [x] Course registration form on every course page: Individual or Company, spam honeypot, rate limit, validation, AR/EN
- [x] Admin **Registrations** page with filters and inline status
- [x] Public course filters: search, level, format, category
- [x] Admin lists on TanStack Table v9: sortable columns, search, filters, pagination
- [x] "View on site" links in admin lists; hover pass; collapsible certificate format help; Next.js smooth-scroll warning fixed

### 2026-10-17
- [x] Page transitions, scroll reveals and hero entrance with Motion (Framer Motion)
- [x] New certificate form with automatic number (`AQS-<year>-0001`), edit, revoke / restore, delete
- [x] Local admin login via `.env.local`

---

## Notes and decisions

- **Hosting:** Hostinger (Node.js app or VPS) with `DATA_DIR` outside the app folder. Vercel can't store data (read-only file system). Steps in the README.
- **`SITE_URL` must be set before `npm run build`**: pages, the sitemap and link previews are pre-rendered with it.
- **Audience:** companies and individuals equally. Both paths stay first-class.
- **Registrations and messages** are stored in `DATA_DIR/registrations.json` and `messages.json`. There's no email alert, by choice; adding one needs an email provider account.
- **Rate limits** (login, forms) are in memory, so they reset when the server restarts.
- **Content:** course, service and blog copy is draft; contact details and the numbers bar are placeholders. Don't present them as facts.
