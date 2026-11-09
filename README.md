# AFOGRADE 360+ Mentorship Series — Official Campaign Website

Official mobile-first campaign landing page and structured registration/payment-handoff application for **The 360+ Mentorship Series** (*The 5,000 Pacesetters Project*) by **AFOGRADE Tutorials & Eduservices**, built for **2027 UTME candidates**.

## Primary Sources of Truth

1. **Product Requirements Document**: `DOCX/AFOGRADE_360_Mentorship_Revised_PRD_v1.1.md` (Version `1.1`, 8 November 2026)
2. **Design System Tokens**: `afograde-design-tokens.json` (`v1.0.0`, Material Design 3-inspired W3C Design Tokens)

---

## Technical Stack

- **Framework**: Next.js `15` (App Router) with strict static export (`output: 'export'`, `trailingSlash: true`)
- **Language**: TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`)
- **Styling**: Standard CSS + CSS Modules backed by generated `--afograde-*` custom properties (`src/styles/tokens.css`, `src/styles/typography.css`, `src/styles/globals.css`) — zero runtime animation libraries
- **Registration & Content Backend**: Google Apps Script Web App (`apps-script/Code.gs`, `apps-script/SetupSheet.gs`) + Google Sheets (`Registrations`, `Settings`, `Scores`, `Testimonials`, `Gallery`, `Errors`)
- **Spam Control**: Cloudflare Turnstile (`TurnstileWidget.tsx` + server-side `siteverify` in Apps Script) + hidden honeypot + best-effort `CacheService` throttling
- **Hosting**: Netlify static deployment (`netlify.toml`, `publish = "out"`) with HTTP `Content-Security-Policy` and security headers

---

## Local Development & Verification Commands

```bash
# 1. Install dependencies
npm install

# 2. Regenerate src/styles/tokens.css from afograde-design-tokens.json
npm run tokens:css

# 3. Start local Next.js development server (http://localhost:3000)
npm run dev

# 4. Run strict TypeScript check
npm run typecheck

# 5. Run automated unit & WCAG contrast test suite
npm test

# 6. Build production static export (out/) + run automated HTML/SEO/security verifier
npm run build

# 7. Preview the exported production build locally (http://localhost:3000)
npm run start
```

---

## Environment Variables & Secret Separation

Copy `.env.example` to `.env.local` for local testing, or configure these keys in **Netlify -> Site configuration -> Environment variables**:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_ENV` | Public | `"preview"` (default; enforces `noindex`) or `"production"` |
| `NEXT_PUBLIC_SITE_URL` | Public | Approved canonical HTTPS origin without trailing slash (e.g. `https://360mentorship.afograde.com`) |
| `NEXT_PUBLIC_APPS_SCRIPT_URL` | Public | Deployed Google Apps Script Web App URL ending in `/exec` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Cloudflare Turnstile public site key |
| `NEXT_PUBLIC_ANALYTICS_APPROVED` | Public | `"true"` only after NDPA privacy review approves analytics |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Public | Optional GA4 ID (`G-XXXXXXXXXX`), loaded only after visitor consent |

> **CRITICAL SECURITY RULE**: Never place `TURNSTILE_SECRET_KEY`, `RECOVERY_PEPPER`, Google Sheet credentials, or staff tokens in `.env*`, GitHub, or Netlify. Private secrets belong exclusively in **Google Apps Script -> Project Settings -> Script Properties** (see `apps-script/README.md`).

---

## Connecting GitHub to Netlify (Step-by-Step)

1. **Push Repository to GitHub**:
   ```bash
   git remote add origin https://github.com/<your-org>/afograde-360-mentorship.git
   git branch -M main
   git push -u origin main
   ```
2. **Confirm Commercial Hosting Terms (`GATE-P0-04`)**:
   - Verify current Netlify plan terms and monthly bandwidth/build allowances (`100 GB` bandwidth, `300` build minutes on Free/Starter) meet campaign expectations.
3. **Create Site in Netlify**:
   - Log in to Netlify -> **Add new site** -> **Import an existing project** -> **GitHub**.
   - Select the `afograde-360-mentorship` repository.
4. **Verify Build Settings** (auto-detected from `netlify.toml`):
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
   - **Node version**: `22`
5. **Set Environment Variables in Netlify**:
   - Go to **Site configuration -> Environment variables**.
   - Keep `NEXT_PUBLIC_SITE_ENV=preview` during pilot testing so search engines do not index preview URLs.
   - Add `NEXT_PUBLIC_APPS_SCRIPT_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` once Apps Script and Turnstile are deployed.
   - Only set `NEXT_PUBLIC_SITE_ENV=production` and `NEXT_PUBLIC_SITE_URL=https://<approved-domain>` on the `Production` context when all P0 launch gates are signed off.
6. **Custom Domain & HTTPS**:
   - Connect AFOGRADE's approved custom domain under **Domain management** and verify automatic Let's Encrypt TLS provisioning.

---

## Production Launch Checklist (PRD Section 24)

Do **not** set `REGISTRATION_STATE = OPEN` in the Google Sheet `Settings` tab until every gate below is evidenced and signed off:

- [ ] **Commercial Hosting (`P0`)**: Netlify commercial-use eligibility and bandwidth plan documented and approved.
- [ ] **Dates & Cycle Cutoffs (`P0`)**: 1 March vs 31 March 2027 end date resolved; all 4 monthly cycle start/end/cutoff dates and prices approved in `Settings` and `src/config/programme.ts`.
- [ ] **NDPA & Minors Privacy Review (`P0`)**: Qualified Nigerian data-protection review completed; lawful basis, minors/parental-consent handling, retention schedule, and `/privacy/` wording signed off (`LAUNCH_GATES.privacyAndMinorsReview.approved = true`).
- [ ] **Operations & Staffing Rota (`P0`)**: Payment verification staff rota, third-party payer exception rules, and WhatsApp support escalation capacity approved.
- [ ] **Apps Script Browser Spike (`P0`)**: Live deployed `/exec` endpoint tested end-to-end on Chrome Android, Safari iOS, and Samsung Internet over mobile networks.
- [ ] **Turnstile Verification (`P0`)**: Server-side `siteverify`, token expiry, and single-use rejection verified in Apps Script.
- [ ] **Idempotency, Locking & Load Rehearsal (`P0`)**: Double-tap, lost-response retry, mutated-payload rejection, counter recovery, and 50-concurrent-request burst tests passed against a test Sheet with zero duplicate IDs or phantom successes.
- [ ] **Recovery & Persistence (`P0`)**: 30-minute auto-restore expiry, retained Registration ID, and `POST action=status` verification tested.
- [ ] **Sheet Access, Protections & Backups (`P0`)**: Named Google accounts with 2FA only; script columns protected; scheduled backup & restore procedure tested.
- [ ] **Two-Person Bank Account Verification (`P0`)**: Kuda Bank (`3003920115` — `AFOGRADE TUTORIALS AND EDUSERVICES`) independently verified by two authorised people.
- [ ] **Brand Assets, Refund & Prize Copy (`P1`)**: Official logo, mission/vision statements, refund wording (`FR-18`), and merit award verification terms (`GATE-P1-03`) approved and updated in `src/config/`.
- [ ] **Go/No-Go Sign-Off (`P0`)**: Written sign-off recorded by Product Owner, Technical Owner, Operations Owner, and Privacy Reviewer.

