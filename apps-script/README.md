# AFOGRADE Google Apps Script & Sheets Integration Guide

This directory contains the production Google Apps Script backend specified in **PRD Sections 9, 10 & 11**, extended with no-portal staff publishing tabs for Track Record results, student testimonials, result/review screenshots, and official social media URLs.

## Files
- `appsscript.json` — Manifest configured for `Africa/Lagos` timezone and least-privilege OAuth scopes.
- `SetupSheet.gs` — One-click workbook provisioner creating `Registrations` (25 columns), `Settings`, `Scores`, `Testimonials`, `Gallery`, `Errors`, and protected `_SystemMeta` with dropdown/checkbox validations and column protections.
- `Code.gs` — Web App endpoints (`GET ?action=config`, `POST action=register`, `POST action=status`) with `LockService`, SHA-256 idempotency/recovery hashing, Cloudflare Turnstile `siteverify`, 3-Science-elective UTME subject validation, monotonic `AFO-2027-00001` ID allocation, and live `trackRecord` + `socialLinks` configuration delivery.

## Deployment Steps (Phase 0 / Phase 4)
1. Create a new Google Sheet owned by the official AFOGRADE Google account (with 2-Step Verification enabled and a second named maintainer recorded).
2. Open **Extensions -> Apps Script**.
3. Enable **Show "appsscript.json" manifest file in editor** in **Project Settings**, then copy `appsscript.json`, `SetupSheet.gs`, and `Code.gs` into the project.
4. Run `setupAfogradeWorkbook()` once from the toolbar and grant the requested permissions.
5. In **Project Settings -> Script Properties**, add:
   - `TURNSTILE_SECRET_KEY`: Your private Cloudflare Turnstile secret key (never put this in Netlify or `.env`).
   - `RECOVERY_PEPPER`: A random 32+ character string used to salt SHA-256 hashes in `_SystemMeta`.
6. Review all values in the `Settings` sheet (keep `REGISTRATION_STATE` as `NOT_OPEN` until all PRD Section 24 P0 gates are signed off; verify Kuda Bank account details with two authorised people).
7. Click **Deploy -> New deployment -> Web app**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
8. Copy the `/exec` Web App URL into Netlify environment variable `NEXT_PUBLIC_APPS_SCRIPT_URL` and run the deployed-browser spike across Chrome Android, Safari iOS, and Samsung Internet before opening public traffic.

## Staff Guide: Updating Scores, Testimonials, Gallery & Social Links (No Website Rebuild Needed)
- **Past UTME Scores (`Scores` tab)**: Pre-seeded with `347, 341, 315, 310, 308, 290`. Add rows and tick `Approved_To_Publish = TRUE` to display additional scores.
- **Student Reviews (`Testimonials` tab)**: Add genuine student reviews, optional institution/course, and optional Google Drive photo/screenshot share links. Both `Consent_Verified` and `Approved_To_Publish` must be ticked `TRUE` before a review is published.
- **Result & Review Screenshots (`Gallery` tab)**: Upload genuine screenshots to an official Google Drive folder shared as *"Anyone with the link -> Viewer"*, paste the share link into `Image_URL_Or_Drive_Link`, and tick both `Consent_Verified = TRUE` and `Approved_To_Publish = TRUE`.
- **Official Social Media Links (`Settings` tab)**: Populate `SOCIAL_FACEBOOK_PAGE`, `SOCIAL_FACEBOOK_COMMUNITY`, `SOCIAL_INSTAGRAM`, `SOCIAL_WHATSAPP_CHANNEL`, `SOCIAL_TELEGRAM`, or `SOCIAL_X_TWITTER` with valid `https://...` URLs. Any blank row remains automatically hidden on the website.
