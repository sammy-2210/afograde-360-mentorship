AFOGRADE 360+ MENTORSHIP SERIES

Landing Page — Product Requirements Document

Version 1.1  |  8 November 2026  |  Prepared for AFOGRADE Tutorials & Eduservices

REVISED AFTER PRODUCT, ENGINEERING, OPERATIONS AND COMPLIANCE REVIEW

# Document control

| Item | Definition |
| --- | --- |
| Purpose | Define the requirements for a standalone, mobile-first campaign landing page and registration/payment workflow for the 360+ Mentorship Series. |
| Version | 1.1 — revised requirements. This version incorporates review corrections; unresolved client and compliance decisions remain explicitly marked. |
| Product owner | AFOGRADE Tutorials & Eduservices. Named decision-maker to be recorded before build. |
| Source tags | [C] Client-confirmed direction; [A] proposed implementation default; [G] launch gate or unresolved decision. A tag does not override legal, provider or technical constraints. |
| Readiness | Not authorised for production build or launch until all P0 gates in Sections 22–24 are resolved and signed off. |

# 1. Product Summary

The 360+ Mentorship Series is a subscription-based preparation and mentorship programme for 2027 UTME candidates. It is part of AFOGRADE’s 5,000 Pacesetters Project. The product covered by this PRD is a mobile-first landing page that explains the programme, collects registrations through a custom form, displays bank-transfer instructions after a registration is confirmed, and directs students to WhatsApp to send payment proof.

Google Apps Script receives registration submissions and writes records to Google Sheets. AFOGRADE staff independently verify bank payments and update payment/access statuses. The website must never mark a student as Paid or Granted access.

| Item | Current direction | Status |
| --- | --- | --- |
| Programme | The 360+ Mentorship Series | [C] |
| Campaign | The 5,000 Pacesetters Project | [C] |
| Audience | 2027 UTME candidates; final eligibility scope requires confirmation | [G] |
| Registration opening | 9 November 2026 (confirm whether this date remains achievable) | [G] |
| Programme period | Working dates: 30 November 2026 to 31 March 2027; 1 March/31 March flyer conflict must be resolved | [G] |
| Pricing | ₦1,500 per programme month; 1–4 month plans, subject to cycle/cutoff rules | [C/G] |
| Delivery | Live online tutorials, WhatsApp and Telegram groups | [C] |
| Contact | WhatsApp and calls: 09079255537 | [C] |

## Scope

- Included: campaign landing page, approved programme content, custom registration form, Apps Script integration, Sheet record creation, payment instructions, WhatsApp proof handoff, basic campaign attribution and privacy-compatible analytics.

- Excluded: full institutional website, student portal, user accounts, admin dashboard, payment gateway, automatic bank verification, automatic access granting, LMS, email/SMS sending and live class hosting.

The landing page improves information consistency and registration record-keeping. It does not automate payment verification, access delivery or student support; those remain manual operational responsibilities.

# 2. Problem Statement

Current campaign traffic is directed to WhatsApp and phone calls. That approach becomes difficult to manage as registration volume grows. Staff must manually collect student details, identify the intended plan, match payment proof to registrations and repeatedly answer common questions.

The landing page addresses four defined problems: inconsistent programme information, unstructured registration capture, weak payment-reference matching and limited campaign attribution. It does not, by itself, solve the staffing and support requirements of a 5,000-student programme.

- A structured registration record with a unique, never-reused ID.

- A server-authoritative plan and price display.

- A consistent bank-transfer and WhatsApp proof workflow.

- Best-effort source attribution through UTM parameters.

- A central Sheet for staff verification and access-status updates.

# 3. Goals and Non-Goals

| ID | Goal | Measure / acceptance |
| --- | --- | --- |
| G-01 | Make registration understandable and usable on mid-range phones. | Usability test: at least 90% of participants complete the flow without assistance; record median and 90th-percentile completion time. |
| G-02 | Create one record per accepted submission key. | No duplicate/reused registration IDs; every displayed success has a matching Sheet row. |
| G-03 | Prevent false success. | Only a confirmed server success or verified recovery lookup can display registration success. |
| G-04 | Help students send payment proof with the correct reference. | Staff monitor the share of proof messages that contain a valid registration ID. |
| G-05 | Capture campaign source where available. | Store approved UTM values on web registrations; attribution is best-effort. |
| G-06 | Minimise launch infrastructure spend. | Use a host and services whose current terms permit this commercial use; no free-tier assumption is accepted without verification. |

## Non-goals

- Student portal, login or student accounts.

- Online payment gateway or automatic payment verification.

- Automatic access granting.

- Email or SMS sending.

- Display of past UTME scores, testimonials or unverified outcomes.

- Full AFOGRADE institutional website.

- Leaderboard or live class hosting.

# 4. User Personas

The following are design hypotheses, not validated research findings. Validate them during the pilot.

- UTME candidate: wants programme dates, subjects, price, registration steps and confidence that payment goes to the correct account. Some candidates may be minors.

- Sponsor: parent, guardian or relative who may pay on behalf of the candidate and needs a clear registration reference.

- Payment verifier: AFOGRADE staff member who checks the bank transaction independently, matches it to a Sheet record and updates statuses.

- Campaign manager: shares campaign links and needs a best-effort view of which channels generate registrations.

Third-party payer rule: the payer's bank-account name need not match the student's name. Staff must verify the actual transaction, amount and registration reference, and record exceptions in Notes.

# 5. User Journey

| Stage | Student action | System/staff behaviour |
| --- | --- | --- |
| Discover | Opens campaign link. | Loads page; captures approved UTM values for the current session when present. |
| Learn | Reads programme information and FAQs. | Displays approved content; optional analytics only as permitted by privacy decision. |
| Choose | Selects an available plan. | Displays server-configured plans; server revalidates plan and price on submission. |
| Register | Completes form and submits. | Validates client-side and server-side; persists submission key; prevents duplicate accepted submissions. |
| Payment | Reads bank details and transfers. | Displays payment instructions only after confirmed registration; amount comes from server response. |
| Proof | Opens WhatsApp, manually attaches screenshot and sends. | Opens prefilled message; does not claim screenshot was attached or message sent. |
| Verification | Waits for staff. | Staff independently checks bank app and updates Sheet statuses. |
| Access | Receives group/access instructions. | Staff sends access instructions and then marks Access Status Granted. |

## Session and recovery rules

- The 30-minute period applies only to automatic restoration of the payment screen on the same browser/device. It is not a payment deadline and does not cancel the server-side registration.

- After local payment-screen expiry, the student should retain or recover the registration ID through a defined, secure recovery process. The ID must not disappear merely because the browser reloads.

- If configuration cannot be trusted or loaded, disable online submission and explain that registration is temporarily unavailable; offer WhatsApp as an alternative. Do not silently change Register Now into an unexplained redirect.

# 6. Functional Requirements

| ID | Requirement | Status |
| --- | --- | --- |
| FR-01 | One landing page containing the 14 content sections defined in Section 7. | [C] |
| FR-02 | Register Now CTAs appear in hero, plans, mobile sticky bar and final CTA; they navigate to the form and focus its first field. | [C] |
| FR-03 | Registration UI implements the complete state model: loading, not open, open, closed, config error, form, validation error, submitting, duplicate confirmation, payment, expired session, paused and recovery/error states. | [A] |
| FR-04 | Custom form; no embedded Google Form. | [C] |
| FR-05 | Registration submission is sent to Apps Script. | [C] |
| FR-06 | Payment screen appears only after confirmed server success or verified status recovery. | [C] |
| FR-07 | Plan, amount and access dates displayed after registration are server-authoritative. | [A] |
| FR-08 | Only plans valid for the server date and configured programme cycles are offered. | [C] |
| FR-09 | Opening, closing and paused states are server-controlled and provide clear WhatsApp alternatives. | [A] |
| FR-10 | Website never marks Payment Status Paid or Access Status Granted. | [C] |
| FR-11 | Send Proof opens WhatsApp; it does not change Sheet status. | [C] |
| FR-12 | Cancel returns to landing page without deleting the Sheet record. | [C] |
| FR-13 | Start New Registration clears local state only after confirmation and warns that a new submission creates a new ID. | [C/A] |
| FR-14 | Copy controls for account number and registration ID. | [A] |
| FR-15 | Purpose-specific WhatsApp CTAs appear in approved locations. | [C] |
| FR-16 | Capture approved UTM fields and store them with web registrations. | [C/A] |
| FR-17 | Send privacy-approved GA4 events only if analytics is permitted. | [G] |
| FR-18 | Refund wording is displayed only after AFOGRADE approves the policy and exact wording. | [G] |
| FR-19 | No past UTME scores, testimonials or dormant achievements feature in version 1. | [C/A] |
| FR-20 | Bank details are hidden until a registration is confirmed. | [A] |
| FR-21 | Timeout/ambiguous outcomes preserve the same submission key and allow safe recovery/retry. | [A] |
| FR-22 | No card details or payment credentials are collected. | [C] |

## State-machine rule

Every state transition must be explicit. Only server-confirmed registration success may enter Payment. A timeout is an ambiguous outcome, not proof of failure. The client must query status or retry with the same key; it must not create a fresh key merely because a response was lost.

# 7. Landing Page Structure and Content

All public claims must be traceable to approved AFOGRADE content. Mission, vision, audience statements, logo and final copy are launch dependencies. Developers must not invent missing material.

## 7.1 Hero

Programme name; approved campaign headline; approved four-month description only after dates are confirmed; server-driven registration status; Register Now and WhatsApp enquiry CTAs.

## 7.2 About AFOGRADE and the Series

Approved programme description, tagline “Where Success begins with Preparation” and 5,000 Pacesetters Project explanation. No invented history or staff claims.

## 7.3 Objectives and audience

Approved mission, vision and audience statements. Present 5,000 as a target, not an achieved result.

## 7.4 Benefits and learning

Approved benefits: live tutorials, recordings, resources/practice questions, brainstorming, mock examinations/speed tests, Question Battles, admission mentorship, peer study and recognition. “Competent tutors” may be used only if substantiated and approved. Subjects: Mathematics, English, Biology, Chemistry and Physics, subject to final eligibility confirmation.

## 7.5 How it works

Register, pay by transfer, send proof on WhatsApp, receive access instructions, join approved WhatsApp/Telegram groups and attend sessions. Timetable marked “to be announced” until confirmed.

## 7.6 Dates and programme structure

Show approved registration dates and four programme cycles. Do not publish an unconfirmed UTME date.

## 7.7 Programme credibility and transparency

Use verifiable programme facts, clear delivery information and approved institutional material. Do not present targets as past performance.

## 7.8 Rewards and prizes

HP Elite Laptop, Smartphone and ₦50,000 cash only with approved eligibility, score verification, tie-break and delivery terms. If rules are incomplete, publish only approved provisional wording.

## 7.9 Plans and pricing

Show only server-available plans. Display monthly price and total. Explain fixed cycle coverage and any no-proration rule before registration.

## 7.10 Registration

Form and all states defined in Sections 8, 9 and 13.

## 7.11 Payment

Pre-registration explainer only; bank details after confirmed registration.

## 7.12 Contact

Official WhatsApp/call number 09079255537. No unapproved address, email or social links.

## 7.13 FAQs

Answers only from approved facts: eligibility, dates, prices, subjects, payment, proof, access, expiry, refund policy, prizes and timetable.

## 7.14 Final CTA/footer

Register Now and WhatsApp CTAs; approved tagline, official name, contact number and approved privacy-notice link.

# 8. Registration Form Requirements

| ID | Field | Required / rule |
| --- | --- | --- |
| REG-01 | Full name | Required; 2–80 characters; accept legitimate name characters; trim and validate server-side. |
| REG-02 | WhatsApp number | Required; accepted formats and country coverage must match eligibility. Normalise to canonical international format. |
| REG-03 | Telegram username | Optional; 5–32 characters; remove one leading @; validate server-side. |
| REG-04 | Email | Optional; validate format when supplied. |
| REG-05 | State/residence | Required; 36 states, FCT and Outside Nigeria only if international eligibility is approved. |
| REG-06 | School | Optional; maximum 100 characters. |
| REG-07 | UTME subject combination | Required; English plus exactly three distinct subjects from Mathematics, Biology, Chemistry and Physics, or Not sure yet. |
| REG-08 | Plan | Required; server-available plans only. |
| REG-09 | Privacy acknowledgement | Required only as approved by privacy review; link to current privacy notice and record notice version. |
| REG-10 | Honeypot | Hidden; must remain empty. |
| REG-11 | Turnstile token | Required; fresh, valid token verified server-side. |

- Validate on blur and submit; show inline errors and an accessible error summary; focus the first invalid field.

- Keep entered data after a recoverable error. Do not clear form data after an ambiguous network outcome.

- Client validation is for usability; Apps Script repeats all validation.

- Use at least 16px form text on mobile.

- Do not collect UTME number, password, bank PIN, OTP, card data or date of birth unless a documented legal review establishes a necessity.

- Under-18 processing is subject to the legal/privacy decision in Section 18; do not implement the original unconditional no-parental-consent rule.

# 9. Google Apps Script Integration

## 9.1 Deployment

Use one AFOGRADE-owned Apps Script project bound to the AFOGRADE Sheet. Deploy as a Web App executing as the owner, with public access only if the actual account and organisation policy permit it. Verify public deployment during Phase 0. Store the public endpoint URL in the frontend environment; store Turnstile secret in Script Properties. Document primary owner, backup maintainer, account recovery, deployment update and rollback.

## 9.2 Endpoints

- GET action=config: returns server registration state, valid plans, cycle dates, prices, configuration version and server time in Africa/Lagos. It returns no student data.

- POST action=register: accepts one registration attempt and its persistent submission key.

- POST action=status: preferred recovery endpoint; accepts a high-entropy recovery credential in the request body and returns only minimum registration details. Never log the credential.

## 9.3 Browser communication

Send JSON as text/plain where required to avoid unnecessary preflight, but do not assume that this guarantees readable redirected responses. A deployed-browser spike is mandatory. Test Chrome Android, Safari iOS, Samsung Internet and agreed fallback browsers on real networks. Define bounded status polling, delays and an ambiguous final state.

## 9.4 Processing and idempotency

1. Validate request structure, size and key format.

1. Check whether the submission key already maps to a successful record; return the original result for a valid retry, even if registration has since closed.

1. For a new key, read and validate server registration state and configuration.

1. Reject non-empty honeypot; validate Turnstile with Cloudflare Siteverify; reject expired or reused tokens.

1. Apply best-effort throttling and server-side field validation.

1. Validate plan, cycle coverage and amount against current server configuration.

1. Acquire script lock; recheck submission key and recent duplicate condition inside the lock.

1. Allocate a unique, never-reused ID; write one row; confirm the row exists; update counter/recovery metadata safely; release lock.

1. Return success only after the record is confirmed. If outcome is uncertain, preserve key and allow status recovery.

Bind each submission key to one immutable payload or payload fingerprint. Reuse of the same key with materially different data must be rejected. A new attempt requires an explicit new-registration action.

## 9.5 Response codes

| Code | Meaning | Client behaviour |
| --- | --- | --- |
| VALIDATION | Field or request validation failed | Show safe field errors; preserve data. |
| NOT_OPEN / CLOSED | Registration outside approved window | Show approved date/message and WhatsApp CTA. |
| PAUSED | AFOGRADE paused registrations | Disable submit and explain temporary pause. |
| PLAN_UNAVAILABLE | Plan no longer available | Refresh config and ask student to select again. |
| TURNSTILE_FAILED | Invalid, expired or reused token | Reset widget and obtain a fresh token. |
| RATE_LIMITED | Best-effort throttle triggered | Ask student to wait and retry. |
| DUPLICATE_RECENT | Recent same-phone/plan attempt | Explain that confirmation creates a separate registration. |
| BUSY | Lock unavailable | Retry same key safely; then offer retry. |
| CONFIG_INVALID | Server configuration invalid | Fail closed; WhatsApp alternative. |
| SERVER_ERROR | Unexpected failure | Preserve key and show recovery/help. |
| UNKNOWN | Client cannot determine whether request committed | Query status; preserve key; never assume failure. |

## 9.6 Logging and permissions

Log timestamp, stage, error code and a safe correlation reference. Do not log raw request bodies, personal data, Turnstile tokens, submission keys or recovery credentials. Test owner-script writes to protected ranges in the actual Sheet.

## 9.7 Abuse controls

Use Turnstile, honeypot, request-size limits, field caps and best-effort CacheService throttling. CacheService is not a durable or strict rate limiter: entries may expire or be evicted, and concurrent increments may race. Do not promise hard limits.

## 9.8 Quotas

Verify current official Google Apps Script quotas before launch. Measure execution time, URL Fetch consumption, lock waits, failures and burst behaviour. Provider quotas can change and do not prove safe peak throughput.

# 10. Google Sheets Structure and Management

## 10.1 Tabs

- Registrations: one row per accepted registration.

- Settings: approved dates, cycle definitions, plan prices, registration state and configuration version.

- Errors: privacy-safe technical error records.

## 10.2 Registration columns

| # | Column | Writer / rule |
| --- | --- | --- |
| 1 | Registration ID | Script; AFO-2027-00001 format; unique and never reused. |
| 2 | Date and Time | Script; Africa/Lagos. |
| 3–9 | Name, WhatsApp, Telegram, email, state, school, subjects | Script; validated; personal data. |
| 10–14 | Plan, months, start cycle, access end, expected amount | Script; derived from server configuration. |
| 15 | Payment Status | Script sets Pending; staff may update. |
| 16 | Proof Received | Script sets No; staff may update to Yes when proof is received. |
| 17 | Verification Date | Staff; set only after bank verification decision. |
| 18 | Access Status | Script sets Not Granted; staff set Granted only after instructions are sent. |
| 19–23 | UTM source, medium, campaign, content, term | Script; all five if collected. |
| 24 | Updated By | Staff name/initials. |
| 25 | Notes | Staff exception notes; no unnecessary sensitive data. |

## 10.3 Management rules

- Protect script-owned columns and allow staff editing only in approved status/notes columns.

- Use dropdown validation for Payment Status, Proof Received and Access Status.

- Payment Status = Paid only after independent bank-app confirmation.

- Proof Received = Yes means proof arrived; it does not mean payment is verified.

- Access Status = Granted only after staff have sent access instructions.

- Share only with named accounts; enforce two-step verification and remove access when staff leave.

- Validate Settings values and audit changes. Invalid or contradictory settings must pause new registrations.

- Define backup frequency, retention, off-account protection and restoration tests.

- Set and publish a retention period before launch; apply the same policy to backup copies.

# 11. Registration ID and Duplicate Handling

## 11.1 Registration ID

Format: AFO-2027-00001, increasing sequentially where possible. The requirement is uniqueness and non-reuse, not gap-free numbering. Gaps are acceptable and must not be repaired by reusing an ID.

- Use a script lock around allocation and write.

- Recheck the submission key and ID collision while holding the lock.

- If counter state is inconsistent, recover from existing records or pause safely; never reuse an existing ID.

## 11.2 Accidental duplicate submissions

- Generate a high-entropy submission key once per attempt and persist it before sending the request.

- Reuse the same key after reload, timeout, lost response or retry.

- Bind the key to one immutable payload; reject materially different payload reuse.

- Clear the key only after confirmed success or an explicit new attempt that cannot hide an accepted registration.

## 11.3 Deliberate repeat registrations

A recent-submission warning may be shown for the same normalised WhatsApp number and plan within ten minutes. This is a warning, not proof that the same person is registering twice. Confirmation creates a separate ID and row. Perform the comparison inside the lock.

## 11.4 Required tests

- Double-tap and same-key simultaneous submissions create one row.

- Lost response and retry return the original ID.

- Same key with changed payload is rejected.

- Retry after registration closes returns the original accepted result.

- Different keys with same phone/plan trigger the recent-submission warning.

- Counter update failure cannot cause ID reuse.

- Fifty simultaneous test requests produce no duplicate IDs; report measured throughput and latency.

# 12. Payment and WhatsApp Workflow

## 12.1 Payment screen

Show first name or approved minimal identifier, registration ID, plan, covered programme cycles, server-returned amount, Kuda Bank, account name AFOGRADE TUTORIALS AND EDUSERVICES and account number 3003920115. Verify account details independently before launch and after any change.

Display a clear notice: “Your registration has been recorded. Payment is not confirmed until AFOGRADE verifies the transfer. The 30-minute period applies only to this device’s payment-screen restoration; it is not a payment deadline.”

## 12.2 Instructions

1. Open your bank app.

1. Transfer exactly the amount shown to the account above.

1. Check that the account name is AFOGRADE TUTORIALS AND EDUSERVICES before confirming.

1. If available, include the registration ID in the transfer narration.

1. Take a screenshot of the successful payment confirmation.

1. Tap Send Proof, attach the screenshot manually in WhatsApp and send the message.

Security warning: Never share a bank PIN, password or OTP. AFOGRADE will never ask for these.

## 12.3 Send Proof

Open https://wa.me/2349079255537 with a URL-encoded, minimal prefilled message containing the registration ID, plan and amount. Omit full name unless a documented need is approved. The student must manually attach the screenshot. A click does not prove WhatsApp opened, the message was sent or proof was received.

## 12.4 Cancel and Start New Registration

Cancel returns to the landing page without deleting the Sheet record. Start New Registration clears local browser state only after confirmation and warns that the original record remains and a new submission creates a separate registration ID.

## 12.5 WhatsApp CTAs

Use the official number only. Provide concise, purpose-specific messages for general enquiry, registration help, payment proof and recovery. Include the registration ID only when available. Do not include blank placeholders or unnecessary personal data.

## 12.6 Staff verification and access

- Match proof to registration ID; if missing, use approved alternative lookup and document the match.

- Check the bank app, amount and transaction receipt. A screenshot alone is not proof of receipt.

- Set Proof Received independently from Payment Status.

- Set Paid only after confirming the transaction in the bank account.

- Handle wrong amount, partial payment, third-party payer and payment-without-proof cases using documented staff procedures.

- Send correct access instructions; only then set Access Status to Granted.

# 13. Registration Persistence

- Store only the minimum browser state needed for restoration. Do not store phone, email, school or bank details.

- Treat localStorage as untrusted display state; verify the registration through the secure server recovery mechanism before showing authoritative plan, amount or payment instructions.

- The 30-minute expiry applies to the automatic payment-screen session only.

- Retain the registration ID as a minimal reference for a separately approved period, or provide a secure recovery route. Do not erase the only usable reference immediately after 30 minutes.

- If localStorage is unavailable, the current page may continue from in-memory state, but clearly warn that reload recovery may not work.

- Malformed or tampered local data must never grant access or change payment status.

- No IP address is used as a student identity key.

- Explain that another browser/device may require WhatsApp recovery; the server-side Sheet record remains.

# 14. Analytics and Campaign Tracking

## 14.1 Setup

Use an AFOGRADE-owned GA4 property only if the privacy review approves the analytics purpose, lawful basis and consent experience. Do not hard-code a no-banner decision before review. If analytics is not permitted or consent is declined where required, the registration flow must still work without GA4.

## 14.2 Events

| Event | Fires when | Meaning / restriction |
| --- | --- | --- |
| register_cta_clicked | Register CTA tapped | Navigation intent only. |
| registration_form_opened | Form becomes active | Not a registration. |
| plan_selected | Plan selected | Not payment intent confirmation. |
| registration_submit_attempted | Valid form submitted | Attempt only. |
| registration_recorded | Server success or verified recovery | Registration only, not payment. |
| registration_failed | Definitive server error | Not an ambiguous outcome. |
| payment_instructions_displayed | Verified payment screen shown | Not payment. |
| send_proof_clicked | Send Proof tapped | Does not prove proof sent. |
| whatsapp_cta_clicked | Any WhatsApp CTA tapped | Does not prove app opened or message sent. |
| payment_cancelled | Cancel tapped | Does not delete the record. |
| registration_session_expired | Local payment-screen session expires | Does not mean registration expired. |
| faq_opened | FAQ item opened | Question ID only. |

Never send names, phone numbers, emails, registration IDs, submission keys or recovery credentials to GA4.

## 14.3 Measurement

The Sheet is the source of truth for registrations, payments and access. GA4 is a behavioural cross-check. Compare production web registrations with GA4 using defined Africa/Lagos reporting windows and exclude test/manual-fallback records. A 15% difference is an investigation trigger, not an accuracy guarantee.

## 14.4 UTM

Capture source, medium, campaign, content and term where present. Retain the first non-empty values within the current browser session. Validate and length-limit each field. Attribution is best-effort and may be lost across sessions, app handoffs or forwarded links.

## 14.5 Privacy

Do not use analytics for payment reconciliation or student-level decisions. Do not claim complete attribution or exact event counts.

# 15. Technical Requirements

## 15.1 Architecture

Preferred architecture remains a static frontend plus Google Apps Script and Google Sheets, subject to provider approval and Phase 0 validation. No Supabase, Firebase, custom backend, authentication, student portal or payment gateway in version 1.

| Layer | Technology / role | Constraint |
| --- | --- | --- |
| Frontend | Next.js static export, TypeScript, Tailwind CSS | No API routes, server actions or middleware. |
| Motion | Framer Motion | Progressive enhancement; reduced motion respected. |
| Version control | GitHub | Committed changes, preview validation and release checklist. |
| Hosting | Commercial-use-approved static host | Must be approved before build lock; Vercel Hobby is not assumed eligible. |
| Registration | Google Apps Script | Public endpoint only after feasibility test. |
| Records | Google Sheets | Named access, protected columns, retention and backup rules. |
| Spam control | Cloudflare Turnstile | Server-side Siteverify required. |
| Analytics | GA4 if approved | Privacy decision before loading. |

## 15.2 Engineering requirements

- TypeScript strict mode; avoid any in form and API integration code.

- Content, dates, plans, prices, bank details and contact number live in typed configuration.

- Secrets never enter the repository or frontend bundle.

- Use small dependencies and test validators, plan logic, UTM parsing and WhatsApp message construction.

- Pre-compress images for static deployment; do not depend on server-side image optimisation.

- Self-host a maximum of two font families; final font selection is a design decision.

- Support agreed current browsers and test the deployed Apps Script integration on the agreed fallback browsers.

- Use preview deployment and release checklist; branch protection depends on repository capability.

- Run unit, integration, accessibility, persistence, failure and load tests.

## 15.3 Cost and provider terms

No infrastructure is considered free or approved until current commercial-use terms, quotas and limitations have been checked. Separate website infrastructure costs from tutors, prizes, staff time, WhatsApp operations and other programme costs. Any paid service requires AFOGRADE approval.

# 16. Design and User Experience

## 16.1 Brand

Use AFOGRADE's official logo, approved taglines and approved brand identity. The original logo and brand assets are launch dependencies. Do not invent an alternative identity.

## 16.2 Colour and contrast

Sampled colours are provisional only. AFOGRADE must approve exact hex values. Test each actual text/background pairing against WCAG 2.1 AA and document approved combinations.

## 16.3 Layout

- Design mobile-first at 360px, then tablet and desktop.

- Touch targets at least 44px; body text at least 16px.

- Sticky mobile bar: Register Now primary, WhatsApp secondary; hide when it would obstruct form focus, keyboard, payment controls or error/recovery content.

- Respect safe-area insets and prevent content overlap.

- Plan cards show monthly price, total and covered cycles.

- Account number is readable and copyable.

- Three-step indicator shows workflow position only; it must never imply payment or proof completion.

## 16.4 Motion

Motion is non-blocking progressive enhancement. All content and controls remain usable without animation. Respect prefers-reduced-motion.

## 16.5 Figma

Deliver mobile and desktop frames for all 14 sections and every agreed state, including validation, submitting, Turnstile failure, duplicate confirmation, config failure, ambiguous network outcome, payment, expired session, paused, not-open, closed and recovery. Include keyboard/focus and screen-reader behaviour.

# 17. SEO and Social Sharing

- Use approved page title and meta description.

- One H1 and logical heading hierarchy; language en-NG.

- Create an approved 1200×630 social preview image and test actual WhatsApp, Facebook and X previews.

- Use one production base URL for canonical, sitemap, robots and social metadata.

- Preview deployments must be noindex and must not claim the production canonical URL.

- JSON-LD is optional and must contain only verified organisation information.

- Use meaningful alt text and an approved favicon.

# 18. Performance, Accessibility, Security and Privacy

## 18.1 Performance

Targets: LCP under 2.5 seconds, CLS under 0.1, INP under 200 ms, first-load JS around 170 KB compressed or less, first-load page weight around 1 MB or less. Measure using a defined mid-range Android and slow-4G profile, with real-device tests as well as Lighthouse. These are acceptance targets, not guarantees.

- Lazy-load below-the-fold imagery and defer non-essential third-party scripts.

- If configuration fails, show a clear unavailable state and WhatsApp alternative; never guess plan availability or price.

## 18.2 Accessibility

- Target WCAG 2.1 AA.

- Full keyboard navigation, visible focus and skip-to-content link.

- Visible labels, textual errors and accessible announcements.

- Manage focus when switching form/payment/expired/paused states.

- Support 200% zoom and reduced motion.

- Test TalkBack and VoiceOver.

## 18.3 Security

- HTTPS only; no secrets in frontend or repository.

- Treat all input as untrusted; no unsafe HTML injection.

- Use explicit CSP directives for scripts, frames and connections. Deploy report-only first, test integrations, then enforce.

- Set frame-ancestors as an HTTP response header, not a meta tag.

- Turnstile secret remains in Script Properties; validate every token server-side.

- Use dependency scanning and release-time audit.

- Staff verify bank transactions in the bank app, not from screenshots alone.

## 18.4 Privacy and data protection

AFOGRADE must obtain qualified review under the Nigeria Data Protection Act and applicable guidance before collecting student data. The review must determine the lawful basis for each purpose, children's data requirements, whether parental/guardian consent or an applicable exception is relevant, provider roles, cross-border processing, analytics consent, retention, rights requests and security safeguards.

The privacy notice must accurately state controller identity/contact, purposes, lawful basis, recipients, retention, student rights, complaint route and how to request correction/deletion. Do not assume a consent checkbox alone resolves compliance. Minimise data and restrict access to named staff.

# 19. Business Model

- Revenue: subscription fee of ₦1,500 per approved programme month, subject to final cycle rules.

- The ₦30,000,000 figure is only a gross-revenue ceiling if all 5,000 target students purchase four months. It is not a forecast or profit figure.

- Gross revenue excludes tutors, prizes, support staffing, payment handling and other programme costs.

- No discounts, coupons or referral codes in version 1 unless separately approved.

- Late-joiner and no-proration rules must be explicit before launch.

- Optional marketing messages must never advertise plans that are no longer available.

# 20. Risks and Constraints

| Risk | Mitigation / gate |
| --- | --- |
| Commercial hosting eligibility | P0: approve a host whose terms permit this commercial use. |
| Apps Script browser response failure | P0: deployed-browser spike and secure recovery path. |
| Registration burst / lock contention | P0: measured load rehearsal, pilot and traffic waves. |
| Quota exhaustion | Monitor execution dashboard; safe pause switch and WhatsApp fallback. |
| Fake registrations | Turnstile, honeypot, best-effort throttling, server validation. |
| Fake payment proof | Independent bank-app verification. |
| Wrong amount / third-party payer | Documented staff exception procedure. |
| Fake account/page | Official URL and number; verify account name; anti-impersonation warning. |
| Student loses local state | Secure recovery process and retained registration ID. |
| WhatsApp support overload | Named staff rota, escalation and capacity plan. |
| Privacy/minors risk | Qualified review, minimisation, named access and retention policy. |
| Account loss | Named recovery owner, second authorised maintainer and tested backups. |
| Late assets/content | Content freeze and no live placeholders. |
| Launch date missed | Keep manual registration; formally revise opening date if necessary. |

## Launch load plan

1. Rehearse against a test Sheet and record throughput, p50/p95 latency, success rate, lock waits, errors and quota use.

1. Test normal load, burst load, same-key concurrency and failure injection.

1. Run a controlled production smoke test with labelled test records and cleanup.

1. Launch in waves; increase traffic only after technical and operational checks pass.

1. Pause registration when configuration is invalid, errors exceed approved thresholds, quotas are at risk or support capacity is exceeded.

# 21. Success Metrics

| Metric | Definition / source | Target |
| --- | --- | --- |
| Server registration success | Accepted server records divided by valid new submission attempts; Apps Script/Sheet. | At least 95% after agreed minimum sample; define observation period. |
| Client confirmation | Accepted records confirmed to the browser, including verified recovery. | Track separately from server success. |
| Duplicate IDs | Repeated registration ID in Sheet. | 0. |
| Phantom successes | Client displays success without a matching Sheet record. | 0. |
| Response time | Apps Script p95 response time. | Under 8 seconds target, subject to pilot evidence. |
| Proof rate | Proof received divided by eligible registration cohort. | Set after pilot baseline. |
| Payment conversion | Paid registrations divided by eligible cohort. | Set after pilot baseline. |
| Verification time | Median time from registration to verified payment. | Set after staffing pilot. |
| Channel mix | Registrations grouped by UTM source. | Observe and review weekly. |
| Plan mix | Registrations grouped by covered months. | Observe and review weekly. |

Use Africa/Lagos reporting windows. Exclude test records and distinguish web registrations from manual WhatsApp fallback. GA4 is not the payment or registration source of truth.

# 22. Decisions and Open Questions

The following decisions remain unresolved. AFOGRADE must assign an owner and deadline to each before the relevant gate can pass.

| Priority | Decision required | Why it matters |
| --- | --- | --- |
| P0 | Confirm 1 March or 31 March 2027 programme end date. | Dates, pricing, cycles and copy. |
| P0 | Approve four programme cycle start/end dates and monthly cutoff rules. | Plan availability and access dates. |
| P0 | Approve registration close date and launch opening date. | Server gating and campaign calendar. |
| P0 | Approve commercial-use hosting provider and cost. | Production deployment eligibility. |
| P0 | Approve privacy/legal basis and minors' data approach. | Lawful collection and launch. |
| P0 | Set data retention, deletion and backup retention. | Privacy notice and operations. |
| P0 | Approve staffing and support capacity for payment/access workflows. | Operational readiness. |
| P1 | Approve refund policy and exact wording. | Payment page and FAQs. |
| P1 | Confirm international eligibility and phone-number formats. | Form validation. |
| P1 | Approve final form fields and privacy notice versioning. | Data collection. |
| P1 | Approve prize eligibility and score verification rules. | Marketing claims and dispute prevention. |
| P1 | Supply logo, colours, mission, vision and approved page copy. | Design and content. |
| P1 | Approve recovery-token and status-endpoint design. | Secure retry and restoration. |
| P1 | Approve analytics consent and event configuration. | Privacy and measurement. |
| P1 | Approve Sheet editors, backup owner and privacy contact. | Access and continuity. |
| P2 | Set monthly registration targets after pilot baseline. | Campaign measurement. |

# 23. Phased Roadmap

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 0. Decisions and feasibility | Resolve P0 items; approve hosting/privacy/business rules; create test Sheet and Apps Script; run browser, Turnstile, idempotency and lock spikes. | All P0 decisions signed off; spikes pass; no unresolved architecture blocker. |
| 1. Content and design | Supply assets and approved copy; finalise state machine; create Figma mobile/desktop and all state frames. | AFOGRADE approves content, design and user journeys. |
| 2. Build and test | Build static frontend, Apps Script integration, Sheet controls, recovery, analytics if approved and accessibility. | Functional, security, accessibility and failure tests pass. |
| 3. Pilot and launch approval | Controlled pilot; staff verify payments and grant access; measure workload and technical performance. | Technical, operational, content and privacy go/no-go approvals. |
| 4. Public launch | Traffic waves, monitoring, support rota and weekly review. | No duplicate IDs or phantom successes; service remains within measured capacity. |
| 5. Run and close | Update approved Settings, maintain records, archive and apply retention policy. | Data handled according to approved retention and programme closure plan. |

Registration must not be represented as open until the system is ready. If the planned 9 November 2026 opening cannot be met, AFOGRADE must approve and publish a revised date.

# 24. Acceptance and Launch Gates

Production launch is blocked until every P0 item below is evidenced and approved.

- Commercial-use hosting approval documented.

- Programme dates, cycles, plan coverage, prices and registration cutoff approved.

- Privacy review and approved privacy notice completed, including minors' data handling.

- Staffing rota and operational escalation process approved.

- Apps Script deployed-browser response spike passes on target browsers.

- Turnstile Siteverify, token expiry and single-use behaviour tested.

- Same-key idempotency, counter recovery and ID collision tests pass.

- Secure recovery endpoint and local-state restoration tests pass.

- Sheet access controls, backup restoration and retention procedures tested.

- Payment account details verified by two authorised people.

- All page claims, prizes, refund wording and brand assets approved.

- Functional, accessibility, security, load and production smoke tests pass.

- Go/no-go sign-off recorded by product owner, technical owner, operations owner and privacy reviewer.

This PRD becomes build-authorised only after the P0 gates are closed. P1 items must be completed before the affected feature is implemented or launched. P2 items may be scheduled after launch if they do not affect safety, legality, accuracy or core operation.
