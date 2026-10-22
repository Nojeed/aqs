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
- [ ] **(P2, security)** Confirm Hostinger's proxy sets `X-Forwarded-For` itself. The login lockout and form rate limits read the visitor IP from it; if visitors can send their own value, they can dodge the limits.

---

## Bugs

Found by behaviour checks. Every bug gets a line here: open ones at the top, fixed ones move to "Fixed" with the date.

### Open
- [ ] **(P3)** Admin "not found" pages (a deleted registration, a wrong certificate number in the URL) answer with HTTP 200 instead of 404. They show the right message and are hidden from search engines (`noindex`); the 200 comes from the admin's streamed rendering.
- [ ] **(P3)** Page views also count the admin's own visits to the public pages.
- [ ] **(P3)** A remembered table filter can point to a course that no longer exists, which shows an empty table until you press Clear.
- [ ] **(P3)** Renaming a course doesn't update certificates already issued for it: their course name (English and Arabic) keeps the old title, shown as an extra option in the certificate's course dropdown.
- [ ] **(P3)** New-registration alerts arrive within 30 seconds (polling), and only while an admin tab is open.

### Fixed 2026-10-22
- [x] Several admin buttons failed silently: publish/draft, revoke/restore, reorder, inbox status and delete showed nothing when the save failed. Every admin action now confirms with a toast or shows the error.
- [x] Website forms showed the browser's own "Please fill out this field" bubble, in the browser's language (English on Arabic pages). Forms now show the site's own messages in the page language.
- [x] After a form submit with errors, the cursor stayed on the button and errors further up could go unnoticed. The cursor now moves to the first field with an error.
- [x] After a successful submit on a phone, the success message could be out of view. It now scrolls into view and is announced to screen readers.
- [x] No way to know a registration or message had arrived without reloading. The sidebar shows live counts, new arrivals pop up as toasts (with an Open button), the browser tab shows "(2) …", and optional desktop alerts work while the tab is in the background.
- [x] Certificate lookup failed for numbers typed with spaces or dots ("AQS 2026 0001") or Arabic digits ("AQS-٢٠٢٦-٠٠٠١"). Now any separator and both digit styles work (unit tested).
- [x] Admin "not found" pages showed Next's bare default page. They now show an admin page with a link back.
- [x] Revoking and then restoring a "never expires" certificate turned it into a normal one. It now returns to the status it had.
- [x] The default expiry for a new certificate (issue date + 3 years) was an invalid date when created on 29 February. Fixed.
- [x] The tab-title count was wiped whenever the page refreshed. It now stays.

---

## Done

### 2026-10-22
- [x] **Notifications:** one toast system for the whole admin (sonner); live inbox badges, arrival toasts, desktop alerts, tab-title count
- [x] Smooth course filtering: cards fade in and out, the rest glide into place (Motion layout animations)
- [x] Copy button for certificate numbers (admin table and the public verification result)
- [x] Course level shown with a matching icon everywhere (1, 2 or 3 signal bars): cards, course page, filters, admin table, admin dropdown
- [x] Icon dropdowns in the admin show the icons (services, hero highlights, why-us items, every icon field), with readable names
- [x] Dashboard: "Most viewed pages" for courses, blog posts and services (last 30 days; anonymous, counted once per visitor session); content cards show published vs draft, certificates show valid / expired / revoked
- [x] Certificates: new status **Valid – never expires** (shown as "Does not expire" on the verification page)
- [x] Simpler certificate form: course and grade are dropdowns and their Arabic text is filled in automatically; new certificates default to a 3-year expiry
- [x] Reorder services and courses with up/down arrows instead of typing order numbers

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
