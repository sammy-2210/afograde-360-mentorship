"use client";

import { useState } from "react";
import type {
  PersistedAttemptKey,
  RegistrationUiState,
  RetainedRegistrationReference,
} from "@/types/registration";
import { Button } from "@/components/ui/Button";
import { CopyField } from "@/components/ui/CopyField";
import { AlertTriangleIcon } from "@/components/ui/Icons";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import styles from "./Registration.module.css";

interface SessionRecoveryCardProps {
  uiState: Extract<
    RegistrationUiState,
    "expired_session" | "ambiguous_timeout" | "recovery"
  >;
  statusMessage: string | null;
  retainedReference: RetainedRegistrationReference | null;
  attemptKey: PersistedAttemptKey | null;
  isRecovering: boolean;
  recoveryError: string | null;
  onRecoverStatus: (manualRegistrationId?: string) => Promise<void>;
  onRetrySameSubmission: () => Promise<unknown>;
  onReturnToForm: () => void;
  onStartNewConfirmed: () => void;
}

export function SessionRecoveryCard({
  uiState,
  statusMessage,
  retainedReference,
  attemptKey,
  isRecovering,
  recoveryError,
  onRecoverStatus,
  onRetrySameSubmission,
  onReturnToForm,
  onStartNewConfirmed,
}: SessionRecoveryCardProps) {
  const [manualId, setManualId] = useState(
    retainedReference?.registrationId ?? ""
  );
  const [confirmClear, setConfirmClear] = useState(false);

  const headingText =
    uiState === "expired_session"
      ? "Payment-Screen Session Ended (Your Registration Remains Saved)"
      : uiState === "ambiguous_timeout"
        ? "Connection Interrupted — Checking Safely Without Duplicate Entry"
        : "Restore Registration & Payment Instructions";

  return (
    <div className={styles.paymentContainer}>
      <div className={`${styles.banner} ${styles.bannerWarning}`}>
        <h3
          id="registration-active-heading"
          tabIndex={-1}
          className={styles.bannerTitle}
        >
          <AlertTriangleIcon />
          <span>{headingText}</span>
        </h3>
        <p className="type-body-medium">
          {statusMessage ??
            "Verify your registration status with the server to restore your official payment instructions."}
        </p>
      </div>

      {retainedReference?.registrationId ? (
        <CopyField
          label="Saved Registration ID Reference on This Device"
          value={retainedReference.registrationId}
          copyAnnouncementLabel="Registration ID"
        />
      ) : null}

      {uiState === "ambiguous_timeout" && attemptKey ? (
        <div className={styles.banner}>
          <p className="type-body-medium">
            Your form entries and unique submission key are preserved on this
            browser. Retrying below will return your original Registration ID if
            the server already recorded it, or complete the submission if it had
            not reached the server yet.
          </p>
          <div className={styles.bannerActions}>
            <Button
              variant="primary"
              disabled={isRecovering}
              onClick={() => void onRetrySameSubmission()}
            >
              Retry Safely (Same Submission Key)
            </Button>
            <Button
              variant="secondary"
              disabled={isRecovering}
              onClick={() => void onRecoverStatus()}
            >
              {isRecovering ? "Checking Status..." : "Check Submission Status"}
            </Button>
          </div>
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void onRecoverStatus(manualId);
          }}
        >
          <div className={styles.fieldGroup}>
            <label htmlFor="recovery-reg-id" className={styles.label}>
              Registration ID
            </label>
            <p id="recovery-reg-hint" className={styles.hint}>
              Enter your Registration ID (for example, <code>AFO-2027-00001</code>)
              to verify your record with the server and view payment instructions.
              If you switched browsers or lost your ID, message AFOGRADE on
              WhatsApp below.
            </p>
            <input
              id="recovery-reg-id"
              type="text"
              className={styles.input}
              placeholder="AFO-2027-00001"
              value={manualId}
              aria-describedby="recovery-reg-hint"
              onChange={(e) => setManualId(e.target.value)}
            />
            {recoveryError ? (
              <p className={styles.fieldError} role="alert">
                {recoveryError}
              </p>
            ) : null}
          </div>

          <div className={styles.bannerActions}>
            <Button type="submit" variant="primary" disabled={isRecovering}>
              {isRecovering
                ? "Verifying Registration..."
                : "Verify & Restore Payment Details"}
            </Button>
            <WhatsAppCta
              intent="session_recovery"
              registrationId={retainedReference?.registrationId || manualId}
              label="Recover via WhatsApp"
              variant="outline"
              ctaLocation="recovery_card"
            />
          </div>
        </form>
      )}

      {confirmClear ? (
        <div className={`${styles.banner} ${styles.bannerWarning}`} role="alert">
          <p className="type-body-medium">
            Starting a new registration clears the saved reference on this browser
            and creates a separate Registration ID if you submit again. Existing
            server records are not deleted.
          </p>
          <div className={styles.bannerActions}>
            <Button variant="dangerOutline" onClick={onStartNewConfirmed}>
              Confirm &amp; Open Blank Form
            </Button>
            <Button variant="outline" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.secondaryActionsRow}>
          {uiState === "recovery" && !retainedReference ? (
            <Button variant="outline" onClick={onReturnToForm}>
              Back to Registration Form
            </Button>
          ) : (
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setConfirmClear(true)}
            >
              Start a Separate New Registration
            </button>
          )}
        </div>
      )}
    </div>
  );
}

