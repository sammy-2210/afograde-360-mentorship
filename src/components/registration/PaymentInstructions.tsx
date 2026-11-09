"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { formatNaira } from "@/lib/validation";
import type { ConfirmedRegistration } from "@/types/registration";
import { Button } from "@/components/ui/Button";
import { CopyField } from "@/components/ui/CopyField";
import { AlertTriangleIcon, CheckCircleIcon } from "@/components/ui/Icons";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import styles from "./Registration.module.css";

interface PaymentInstructionsProps {
  registration: ConfirmedRegistration;
  sessionMinutes: number;
  onStartNewConfirmed: () => void;
}

/**
 * Verified Post-Registration Payment Instructions (PRD Section 12.1–12.4)
 *
 * Strictly rendered ONLY after confirmed server registration or verified recovery.
 * Never claims payment has been received or verified.
 */
export function PaymentInstructions({
  registration,
  sessionMinutes,
  onStartNewConfirmed,
}: PaymentInstructionsProps) {
  const [confirmingNew, setConfirmingNew] = useState(false);

  const handleCancelToOverview = () => {
    trackEvent("payment_cancelled", { plan_id: registration.planId });
    const hero = document.getElementById("hero");
    hero?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.paymentContainer}>
      <div className={`${styles.banner} ${styles.bannerInfo}`}>
        <h3
          id="registration-active-heading"
          tabIndex={-1}
          className={styles.bannerTitle}
        >
          <CheckCircleIcon />
          <span>
            Registration Recorded for {registration.firstName} (Payment Pending)
          </span>
        </h3>
        <p className="type-body-medium">
          Your registration has been recorded. Payment is not confirmed until
          AFOGRADE verifies the transfer. The {sessionMinutes}-minute period
          applies only to this device’s payment-screen restoration; it is not a
          payment deadline.
        </p>
      </div>

      <CopyField
        label="Your Unique Registration ID (Save or Screenshot This Now)"
        value={registration.registrationId}
        copyAnnouncementLabel="Registration ID"
      />

      <div className={styles.summaryGrid} aria-label="Registered plan summary">
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Selected Plan</span>
          <span className={styles.summaryValue}>{registration.planName}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Exact Transfer Amount</span>
          <span className={styles.summaryAmount}>
            {formatNaira(registration.expectedAmountNgn)}
          </span>
        </div>
        {registration.coveredCyclesLabel ? (
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Covered Programme Cycles</span>
            <span className={styles.summaryValue}>
              {registration.coveredCyclesLabel}
            </span>
          </div>
        ) : null}
        {registration.accessEndLabel ? (
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Covered Period End</span>
            <span className={styles.summaryValue}>
              {registration.accessEndLabel}
            </span>
          </div>
        ) : null}
      </div>

      <div className={styles.bankCard} aria-label="Official bank transfer details">
        <h4 className="type-title-large">Official Bank Transfer Account</h4>
        <div className={styles.bankMetaRow}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Bank Name</span>
            <span className={styles.summaryValue}>
              {registration.bankDetails.bankName}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Account Name</span>
            <span className={styles.summaryValue}>
              {registration.bankDetails.accountName}
            </span>
          </div>
        </div>
        <CopyField
          label="Account Number"
          value={registration.bankDetails.accountNumber}
          copyAnnouncementLabel="Kuda Bank account number"
        />
      </div>

      <div>
        <h4 className="type-title-medium" style={{ marginBottom: "12px" }}>
          How to Complete Payment &amp; Send Proof
        </h4>
        <ol className={`type-body-large ${styles.instructionList}`}>
          <li>Open your bank app (or ask your parent/sponsor to make the transfer).</li>
          <li>
            Transfer <strong>exactly {formatNaira(registration.expectedAmountNgn)}</strong>{" "}
            to the account number above.
          </li>
          <li>
            Confirm that the recipient account name reads{" "}
            <strong>{registration.bankDetails.accountName}</strong> before
            authorising the transfer.
          </li>
          <li>
            Include your Registration ID (
            <strong>{registration.registrationId}</strong>) in the transfer
            narration/remark if your bank app provides a narration field.
          </li>
          <li>Take a clear screenshot of your successful transfer receipt.</li>
          <li>
            Tap <strong>Send Proof on WhatsApp</strong> below,{" "}
            <strong>manually attach your transfer screenshot</strong> in WhatsApp,
            and send the message.
          </li>
        </ol>
      </div>

      <div className={styles.securityWarning} role="note">
        <AlertTriangleIcon style={{ flexShrink: 0, marginTop: "2px" }} />
        <p className="type-body-medium">
          <strong>Security warning:</strong> Never share a bank PIN, password or
          OTP. AFOGRADE will never ask for these.
        </p>
      </div>

      <div>
        <WhatsAppCta
          intent="payment_proof"
          registrationId={registration.registrationId}
          planName={registration.planName}
          expectedAmountNgn={registration.expectedAmountNgn}
          label="Send Proof on WhatsApp (Attach Screenshot Manually)"
          variant="whatsapp"
          fullWidth
          ctaLocation="payment_screen_send_proof"
        />
        <p
          className="type-body-small"
          style={{
            marginTop: "8px",
            color: "var(--afograde-color-on-surface-variant)",
            textAlign: "center",
          }}
        >
          Opening WhatsApp does not automatically attach your screenshot or verify
          payment. Staff will verify the bank transaction and send your group
          access instructions.
        </p>
      </div>

      {confirmingNew ? (
        <div className={`${styles.banner} ${styles.bannerWarning}`} role="alert">
          <p className={styles.bannerTitle}>
            <AlertTriangleIcon />
            <span>Start a Separate Registration?</span>
          </p>
          <p className="type-body-medium">
            Clearing this screen does <strong>not</strong> delete registration{" "}
            <strong>{registration.registrationId}</strong> on AFOGRADE’s server.
            Submitting the form again will create a brand-new Registration ID. Only
            continue if you are registering a different student or intentionally
            creating a separate registration.
          </p>
          <div className={styles.bannerActions}>
            <Button variant="dangerOutline" onClick={onStartNewConfirmed}>
              Yes, Clear This Device &amp; Start New Registration
            </Button>
            <Button variant="outline" onClick={() => setConfirmingNew(false)}>
              Keep My Current Payment Screen
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.secondaryActionsRow}>
          <Button variant="outline" onClick={handleCancelToOverview}>
            Return to Page Overview
          </Button>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setConfirmingNew(true)}
          >
            Start New Registration
          </button>
        </div>
      )}
    </div>
  );
}

