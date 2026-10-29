# AQS – Advanced Quality Skills website

Bilingual (Arabic / English) Next.js 16 site for AQS with a built-in admin panel and certificate verification.

- **Public site**: `/ar` (default, right-to-left) and `/en` — home, services, courses, blog, contact, certificate verification.
- **Admin panel**: `/admin` — edit all site text, services, courses, blog posts, images and certificates.
- **No database**: content is stored as JSON files in a data folder on the server.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in ADMIN_PASSWORD and SESSION_SECRET
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run build
npm start                    # PORT=3000 by default
```

Requires Node.js 20.9+ and a host with a persistent disk (a VPS or Node.js hosting such as Hostinger). Serverless hosts
like Vercel can't store the admin's changes, because their file system is read-only.

`npm test` runs the unit tests (CSV, certificate numbers, passwords).
`npm run test:e2e` builds the site into `.next-e2e` with its own data folder (`.e2e-data`, recreated from `seed/`) and runs
the end-to-end tests in your installed Google Chrome. Your real data and normal build are never touched.

## Admin accounts

The `ADMIN_USERNAME` / `ADMIN_PASSWORD` account is the **owner**. In the admin, the owner can add **staff** accounts
(Users), everyone can change their own password (Account), and the owner can see who changed what (Activity).
Passwords are stored hashed in `DATA_DIR/users.json`.

**Forgot the owner password?** Once the owner has changed it in the admin, the server password no longer works. On the
server, delete the owner's entry from `DATA_DIR/users.json`; the `ADMIN_PASSWORD` from the environment works again.

## Backups

Every save keeps the previous 15 versions of each file in `DATA_DIR/backups` (restore them in Admin → Backups). Those
live on the same disk, so also keep copies elsewhere:

- **By hand:** Admin → Backups → **Download full backup** (all data and uploaded images in one `.tar.gz`).
- **Automatically (VPS):** a nightly cron job, e.g.
  `0 3 * * * cd /var/www/aqs && DATA_DIR=/var/lib/aqs-data node scripts/backup.mjs /mnt/backups/aqs`
  (keeps the newest 30; point the target at another disk or a synced folder).
- **Hostinger web hosting:** turn on Hostinger's daily backups in hPanel, and download a full backup from the admin now and then.

## Deploying on Hostinger

Use a plan that runs Node.js apps (Business / Cloud web hosting with Node.js, or a VPS).

**Web hosting with Node.js (hPanel)**
1. hPanel → **Websites → Add website → Node.js app**, connect the GitHub repository (or upload the code).
2. Build settings: Node **20 or newer**, install `npm ci`, build `npm run build`, start `npm start`.
3. **Environment variables**: `ADMIN_PASSWORD` (strong), `SESSION_SECRET` (`openssl rand -hex 32`), `SITE_URL`
   (e.g. `https://aqs-training.com`), and `DATA_DIR` set to a folder **outside** the app folder, e.g.
   `/home/<user>/aqs-data`. Create that folder first.
4. Deploy, then open `/admin` and sign in. The data files are created from `seed/` on first use.
5. Point the domain at the app and enable SSL in hPanel.

**VPS**
1. Install Node 20+ and a process manager: `npm i -g pm2`.
2. `git clone …`, `npm ci`, `npm run build`.
3. Create `.env.production.local` with the variables above (`DATA_DIR=/var/lib/aqs-data`).
4. `pm2 start npm --name aqs -- start` and `pm2 save`; put Nginx in front for the domain and SSL (Let's Encrypt).

Either way: back up `DATA_DIR` regularly (it holds every edit, certificate, registration and message). After deploying,
check the link previews with a social preview tool (e.g. opengraph.xyz) for the home page and one course.

## Environment variables

| Variable          | Required | Purpose                                                                 |
| ----------------- | -------- | ----------------------------------------------------------------------- |
| `ADMIN_PASSWORD`  | yes      | Password for `/admin`                                                   |
| `SESSION_SECRET`  | yes      | 32+ random characters used to sign the login cookie (`openssl rand -hex 32`) |
| `ADMIN_USERNAME`  | no       | Defaults to `admin`                                                     |
| `DATA_DIR`        | no       | Content folder, defaults to `./data`. **Set it outside the app folder in production.** |
| `TRUSTED_PROXIES` | no       | Proxies in front of the app, defaults to `1` (Hostinger). Set `2` if Cloudflare sits in front too. Used to read the visitor IP for rate limits. |
| `SITE_URL`        | no       | Public URL for link previews, the sitemap and robots.txt. **Set it before `npm run build`**: pages are pre-rendered with it. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | no | Email alerts for new registrations and messages, and a confirmation email to the visitor. Hostinger email works: `smtp.hostinger.com`, port `465`, your mailbox address and password. Off when not set. |
| `SMTP_FROM`       | no       | Sender shown on emails, e.g. `AQS <info@your-domain.com>`. Defaults to `SMTP_USER`. |
| `ALERT_EMAIL`     | no       | Where staff alerts go. Defaults to `SMTP_USER`. |
| `GOOGLE_SITE_VERIFICATION` | no | The code from Google Search Console's "HTML tag" method. |
| `NEXT_PUBLIC_GA_ID` | no     | Google Analytics 4 ID (`G-…`). Analytics loads only when set. GA uses cookies: add a consent banner if your visitors need one. Set before building. |

Changing `SESSION_SECRET` signs everyone out.

## How content is stored

```
seed/            default content shipped with the code (copied into DATA_DIR on first run)
DATA_DIR/
  site.json          hero, about, numbers, why-us, contact details, social links, SEO
  services.json
  courses.json
  posts.json
  certificates.json  read by the verification page
  registrations.json course registrations from the course pages and the contact page
  messages.json      messages from the contact page form
  users.json         staff accounts (hashed passwords)
  audit.json         activity log (last 2,000 admin actions; no backups)
  views.json         anonymous page-view counts for the dashboard (no backups; counters only)
  uploads/           images uploaded through the admin panel (served at /uploads/…)
  backups/           the previous 15 versions of every file, saved automatically on each change
```

When a file is missing from `DATA_DIR`, it is created from `seed/`. Redeploying the code never overwrites
`DATA_DIR`, so the admin's edits are safe. **Back up `DATA_DIR`**; it holds everything the admin has created.

Saving in the admin panel updates the public pages immediately. If you edit `site.json`, `services.json`,
`courses.json` or `posts.json` by hand on the server, the change appears within an hour, or straight away after
a restart.

## Certificates

The verification page (`/ar/verify`, `/en/verify`) looks up a number in `DATA_DIR/certificates.json`. The file is
re-read whenever it changes, so you can:

1. **Edit the file directly on the server**, or
2. **Upload a new version** in *Admin → Certificates*. It's validated before it replaces the old file, and the old
   one is kept in `backups/`.

Format: a JSON array. `id` and `name` are required; everything else is optional.

```json
[
  {
    "id": "AQS-2026-0001",
    "name": "Ahmed Mohamed Ali",
    "nameAr": "أحمد محمد علي",
    "course": "HACCP Level 3",
    "courseAr": "HACCP – المستوى الثالث",
    "issueDate": "2026-03-15",
    "expiryDate": "2029-03-15",
    "hours": 24,
    "grade": "Excellent",
    "gradeAr": "ممتاز",
    "status": "valid"
  }
]
```

- Dates are `YYYY-MM-DD`. A certificate past its `expiryDate` shows as **expired** automatically.
- `"status": "revoked"` marks it as revoked.
- Lookups ignore letter case and spaces.
- Direct links work, which is useful for a QR code printed on each certificate:
  `https://your-domain.com/ar/verify?id=AQS-2026-0001`

The seed file contains four **sample** certificates. Replace them before going live.

## Before going live

- [ ] Admin → Site content: replace the placeholder email, phone, address, WhatsApp number and social links.
- [ ] Check the numbers bar (2,500+ trainees and so on). These are placeholders.
- [ ] Review the sample services, courses and blog posts.
- [ ] Upload the real `certificates.json`.
- [ ] Set `SITE_URL`, a strong `ADMIN_PASSWORD`, `SESSION_SECRET`, and a `DATA_DIR` outside the app folder.

## Project structure

```
src/app/[lang]/        public pages (Arabic and English)
src/app/admin/         admin panel (login, dashboard, editors, certificates)
src/app/api/admin/     image upload, image library, certificate import/export
src/app/uploads/       serves uploaded images
src/lib/schema.ts      content model: the admin forms are generated from it and saves are validated against it
src/lib/i18n.ts        interface translations (buttons, labels) for both languages
src/proxy.ts           language redirect (/ → /ar or /en) and the admin login gate
public/images/         stock photos (Unsplash licence: free for commercial use)
public/brand/          logo files cut from the AQS banner
```

To add a field to a service, course or post, add it to the matching definition in `src/lib/schema.ts` (and its type),
then show it in the page component. The admin form picks it up automatically.
