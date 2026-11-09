import type { Metadata } from "next";
import Link from "next/link";
import { isProductionIndexable } from "@/config/env";
import { LAUNCH_GATES, PRIVACY_NOTICE_CONFIG } from "@/config/gates";
import { BRAND_CONFIG } from "@/config/programme";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FloatingWhatsAppButton } from "@/components/ui/FloatingWhatsAppButton";
import styles from "./PrivacyPage.module.css";

export function generateMetadata(): Metadata {
  const indexable = isProductionIndexable();
  return {
    title: `Privacy Notice | ${BRAND_CONFIG.organisationName}`,
    description: `How ${BRAND_CONFIG.organisationName} collects, protects, and manages candidate registration records for ${BRAND_CONFIG.programmeName}.`,
    ...(indexable ? { alternates: { canonical: "/privacy/" } } : {}),
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default function PrivacyNoticePage() {
  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link href="/" className={styles.backLink}>
            <span className={styles.logoFrame}>
              <img
                src={BRAND_CONFIG.logoSrc}
                alt={BRAND_CONFIG.logoAlt}
                width={44}
                height={44}
                decoding="async"
                className={styles.logoImg}
              />
            </span>
            <span>&larr; Back to {BRAND_CONFIG.programmeName}</span>
          </Link>
          <Badge variant="brand">
            Notice Version: {PRIVACY_NOTICE_CONFIG.version}
          </Badge>
        </div>
      </header>

      <section className={styles.heroBanner}>
        <div className={`container ${styles.heroInner}`}>
          <Badge variant="inverse">Data Protection &amp; Candidate Trust</Badge>
          <h1 className="type-section-heading">
            Privacy Notice &amp; Candidate Data Protection
          </h1>
          <p className={`type-body-large ${styles.heroLead}`}>
            This notice explains how{" "}
            <strong>{PRIVACY_NOTICE_CONFIG.controllerName}</strong> handles
            personal information submitted for{" "}
            <strong>{BRAND_CONFIG.programmeName}</strong> (
            {BRAND_CONFIG.campaignName}).
          </p>
        </div>
      </section>

      <main id="main-content" className={`section ${styles.mainSection}`}>
        <div className={`container ${styles.contentStack}`}>
          {!LAUNCH_GATES.privacyAndMinorsReview.approved ? (
            <div role="note" className={styles.gateWarning}>
              <strong>
                Pre-Launch Compliance Gate ({LAUNCH_GATES.privacyAndMinorsReview.id}):
              </strong>{" "}
              Final lawful-basis wording, retention schedule duration, and named
              data-protection contact sign-off under the Nigeria Data Protection
              Act (NDPA) must be completed and approved before public student
              data collection opens.
            </div>
          ) : null}

          <section className={styles.policyCard}>
            <h2 className={`type-title-large ${styles.policyHeading}`}>
              1. Data Controller &amp; Contact
            </h2>
            <p className={`type-body-large ${styles.policyBody}`}>
              <strong>Controller:</strong> {PRIVACY_NOTICE_CONFIG.controllerName}
              <br />
              <strong>Official Telephone &amp; WhatsApp:</strong>{" "}
              {PRIVACY_NOTICE_CONFIG.officialContactPhone}
            </p>
          </section>

          <section className={`${styles.policyCard} ${styles.policyCardInk}`}>
            <h2 className={`type-title-large ${styles.policyHeading}`}>
              2. Information We Collect
            </h2>
            <p className={`type-body-large ${styles.policyBody}`}>
              When you register for {BRAND_CONFIG.programmeName}, we collect
              only the minimum details required to administer your enrolment:
            </p>
            <ul className={`type-body-large ${styles.policyBody}`}>
              <li>Full name, state of residence, and optional school name.</li>
              <li>
                Active WhatsApp phone number, optional Telegram username, and
                optional email address.
              </li>
              <li>
                Selected 2027 UTME subject combination and chosen subscription
                plan.
              </li>
              <li>
                Campaign attribution tags (<code>utm_source</code>,{" "}
                <code>utm_medium</code>, <code>utm_campaign</code>,{" "}
                <code>utm_content</code>, <code>utm_term</code>) when you open a
                campaign link.
              </li>
            </ul>
            <p className={`type-body-medium ${styles.policyBody}`}>
              We <strong>never</strong> collect ATM card numbers, bank PINs,
              passwords, OTPs, or JAMB registration numbers on this website.
            </p>
          </section>

          <section className={styles.policyCard}>
            <h2 className={`type-title-large ${styles.policyHeading}`}>
              3. How We Use Your Information &amp; Service Providers
            </h2>
            <ul className={`type-body-large ${styles.policyBody}`}>
              <li>
                <strong>Programme Administration:</strong> Assigning a unique
                Registration ID, matching manual bank transfers to your
                registration record, delivering WhatsApp/Telegram class access,
                and providing tutorial support.
              </li>
              <li>
                <strong>Technical Infrastructure:</strong> Registration records
                are processed via Google Apps Script and stored in
                access-controlled Google Sheets restricted to authorised
                AFOGRADE staff with two-step verification. Cloudflare Turnstile
                is used to block automated spam submissions.
              </li>
              <li>
                <strong>Optional Analytics:</strong> If enabled and consented
                to, aggregate page interaction events are measured without ever
                sending names, phone numbers, emails, or Registration IDs.
              </li>
            </ul>
          </section>

          <section className={`${styles.policyCard} ${styles.policyCardInk}`}>
            <h2 className={`type-title-large ${styles.policyHeading}`}>
              4. Candidates Under 18 Years of Age
            </h2>
            <p className={`type-body-large ${styles.policyBody}`}>
              {PRIVACY_NOTICE_CONFIG.minorsGuidanceNotice}
            </p>
          </section>

          <section className={styles.policyCard}>
            <h2 className={`type-title-large ${styles.policyHeading}`}>
              5. Browser Storage, Retention &amp; Your Rights
            </h2>
            <p className={`type-body-large ${styles.policyBody}`}>
              After registration, your browser stores only your Registration ID
              and non-sensitive session restoration reference (never your phone
              number, email, or school) so you can view transfer instructions if
              your tab reloads.
            </p>
            <p className={`type-body-large ${styles.policyBody}`}>
              <strong>Retention schedule:</strong>{" "}
              {PRIVACY_NOTICE_CONFIG.retentionPeriodLabel}.
            </p>
            <p className={`type-body-large ${styles.policyBody}`}>
              <strong>Your NDPA Rights:</strong> Subject to applicable Nigerian
              data-protection law, candidates and parents/guardians may request
              access to, correction of, or deletion of registration records, or
              raise a privacy enquiry by contacting AFOGRADE on{" "}
              <strong>{PRIVACY_NOTICE_CONFIG.officialContactPhone}</strong> (and
              also retain the right to lodge a complaint with the Nigeria Data
              Protection Commission).
            </p>
          </section>

          <div>
            <Button href="/" variant="primary">
              Return to Programme Page
            </Button>
          </div>
        </div>
      </main>

      <Footer isSubpage />
      <FloatingWhatsAppButton />
    </>
  );
}
