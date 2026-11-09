import { LAUNCH_GATES, REFUND_POLICY_CONFIG } from "@/config/gates";
import { SectionHeading } from "@/components/ui/SectionHeading";
import styles from "./Sections.module.css";

/**
 * Pre-Registration Payment Explainer (PRD Section 7.11 & FR-20):
 * Explains how payment and verification work WITHOUT displaying bank account numbers
 * prior to server-confirmed registration.
 */
export function PaymentExplainerSection() {
  return (
    <section id="payment-info" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Payment & Verification Rules"
          title="How Bank Transfers & Manual Verification Work"
          lead="We never collect ATM card details, bank PINs, or online payment credentials on this website."
        />

        <div className={styles.gridThree}>
          <article className={styles.cardElevatedWhite}>
            <h3 className={`type-title-large ${styles.cardTitle}`}>
              1. Register First to Unlock Account Details
            </h3>
            <p className={`type-body-large ${styles.cardBody}`}>
              To prevent unmatched transfers, official Kuda Bank transfer
              instructions appear only after your registration is confirmed by
              the server and assigned a unique Registration ID.
            </p>
          </article>

          <article className={styles.cardElevatedWhite}>
            <h3 className={`type-title-large ${styles.cardTitle}`}>
              2. Transfer &amp; Attach Proof on WhatsApp
            </h3>
            <p className={`type-body-large ${styles.cardBody}`}>
              Transfer the exact server-confirmed plan total, verify that the
              recipient name matches AFOGRADE’s official account name, take a
              screenshot, and send it via the Send Proof WhatsApp button.
            </p>
          </article>

          <article className={styles.cardElevatedWhite}>
            <h3 className={`type-title-large ${styles.cardTitle}`}>
              3. Staff Verification Before Access
            </h3>
            <p className={`type-body-large ${styles.cardBody}`}>
              Submitting the form or tapping Send Proof does not automatically
              mark you as Paid. AFOGRADE staff confirm receipt in the bank
              account first and then share your WhatsApp and Telegram class
              links.
            </p>
          </article>
        </div>

        <div className={styles.noticeBox}>
          <p className="type-body-medium">
            <strong>Fee &amp; policy note:</strong>{" "}
            {LAUNCH_GATES.refundPolicy.approved
              ? REFUND_POLICY_CONFIG.approvedWording
              : REFUND_POLICY_CONFIG.pendingFallbackNotice}
          </p>
        </div>
      </div>
    </section>
  );
}

