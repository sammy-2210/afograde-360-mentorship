"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { PRIVACY_NOTICE_CONFIG } from "@/config/gates";
import {
  COMPULSORY_SUBJECT,
  ELECTIVE_SUBJECTS,
  NIGERIAN_STATES_AND_FCT,
} from "@/config/programme";
import { canDisplayPaymentDetails } from "@/lib/stateMachine";
import { formatNaira } from "@/lib/validation";
import type {
  RegistrationFieldName,
  RegistrationUiState,
} from "@/types/registration";
import type { useRegistrationMachine } from "@/hooks/useRegistrationMachine";
import { Button } from "@/components/ui/Button";
import { AlertTriangleIcon } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import { PaymentInstructions } from "./PaymentInstructions";
import { SessionRecoveryCard } from "./SessionRecoveryCard";
import { StepIndicator } from "./StepIndicator";
import { TurnstileWidget } from "./TurnstileWidget";
import { DeadlineCountdown } from "@/components/ui/DeadlineCountdown";
import { PriceTags } from "@/components/ui/PriceTags";
import styles from "./Registration.module.css";

type MachineController = ReturnType<typeof useRegistrationMachine>;

interface RegistrationSectionProps {
  controller: MachineController;
}

const FIELD_DOM_IDS: Record<RegistrationFieldName, string> = {
  fullName: "field-fullName",
  whatsappNumber: "field-whatsappNumber",
  telegramUsername: "field-telegramUsername",
  email: "field-email",
  stateOfResidence: "field-stateOfResidence",
  schoolName: "field-schoolName",
  electiveSubjects: "field-electiveSubjects",
  planId: "field-planId",
  privacyAcknowledged: "field-privacyAcknowledged",
  turnstileToken: "field-turnstileToken",
};

export function RegistrationSection({ controller }: RegistrationSectionProps) {
  const {
    machine,
    formValues,
    allowInternational,
    turnstileResetNonce,
    isRecovering,
    recoveryError,
    updateField,
    toggleElectiveSubject,
    validateBlurField,
    executeSubmission,
    attemptStatusRecovery,
    confirmStartNewRegistration,
    cancelDuplicateWarning,
    openRecoveryView,
    returnToFormFromRecovery,
    sessionTotalDurationMinutes,
  } = controller;

  const prevUiStateRef = useRef<RegistrationUiState>(machine.uiState);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  // Accessible focus management across state transitions (PRD Section 18.2)
  useEffect(() => {
    const prev = prevUiStateRef.current;
    prevUiStateRef.current = machine.uiState;
    if (prev === machine.uiState || prev === "loading") return;

    if (
      machine.uiState === "payment" ||
      machine.uiState === "expired_session" ||
      machine.uiState === "ambiguous_timeout" ||
      machine.uiState === "recovery" ||
      machine.uiState === "duplicate_confirmation" ||
      machine.uiState === "paused" ||
      machine.uiState === "closed" ||
      machine.uiState === "not_open"
    ) {
      window.setTimeout(() => {
        const activeHeading = document.getElementById(
          "registration-active-heading"
        );
        activeHeading?.focus({ preventScroll: false });
      }, 60);
    }
  }, [machine.uiState]);

  const isFullNameFilled = formValues.fullName.trim().length >= 2;
  const isWhatsAppFilled = formValues.whatsappNumber.trim().length >= 8;
  const isStateFilled = formValues.stateOfResidence.trim().length > 0;
  const isElectivesFilled = formValues.electiveSubjects.length === 3;
  const isPlanFilled = Boolean(formValues.planId);
  const isPrivacyFilled = formValues.privacyAcknowledged === true;

  const requiredCompletedCount =
    (isFullNameFilled ? 1 : 0) +
    (isWhatsAppFilled ? 1 : 0) +
    (isStateFilled ? 1 : 0) +
    (isElectivesFilled ? 1 : 0) +
    (isPlanFilled ? 1 : 0) +
    (isPrivacyFilled ? 1 : 0);

  const canProceed = requiredCompletedCount === 6;

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { firstErrorField } = await executeSubmission(false);
    const fieldEl = firstErrorField
      ? document.getElementById(FIELD_DOM_IDS[firstErrorField])
      : null;
    if (fieldEl) {
      fieldEl.focus();
      fieldEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // No field to jump to (e.g. a server-side rejection, or a security check
    // with no visible widget): bring the error banner, which sits at the top
    // of the form far above this button, into view so the failure is never
    // silent.
    window.setTimeout(() => {
      const banner = errorSummaryRef.current;
      if (!banner) return;
      banner.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  const stateOptions = allowInternational
    ? [...NIGERIAN_STATES_AND_FCT, "Outside Nigeria"]
    : NIGERIAN_STATES_AND_FCT;

  const errorEntries = Object.entries(machine.fieldErrors).filter(
    (pair): pair is [RegistrationFieldName, string] => Boolean(pair[1])
  );

  return (
    <section id="register" className={`section ${styles.section}`}>
      <div className="container">
        <SectionHeading
          eyebrow="Registration & Payment Handoff"
          title="Register for The 360+ Mentorship Series"
          lead="Complete your candidate details below. Official bank transfer details and your unique Registration ID are displayed immediately after the server confirms your registration."
          centered
        />

        <div className={styles.shell}>
          <StepIndicator uiState={machine.uiState} />

          <div className={styles.countdownRow}>
            <DeadlineCountdown tone="light" />
          </div>

          {!machine.storageAvailable ? (
            <div
              className={`${styles.banner} ${styles.bannerWarning}`}
              style={{ marginBottom: "24px" }}
              role="status"
            >
              <p className="type-body-medium">
                <strong>Browser storage notice:</strong> Local browser storage is
                restricted in your current tab/private window. You can still
                register, but please screenshot or copy your Registration ID
                immediately once displayed because reloading the page will not
                auto-restore it.
              </p>
            </div>
          ) : null}

          {/* 1. LOADING STATE */}
          {machine.uiState === "loading" ? (
            <div className={styles.banner} role="status" aria-live="polite">
              <p className={styles.bannerTitle}>
                Checking live registration status and available plans...
              </p>
              <p className="type-body-medium">
                Connecting to AFOGRADE’s registration service. Please wait a
                moment.
              </p>
            </div>
          ) : null}

          {/* 2. GATED / UNAVAILABLE STATES (config_error, not_open, paused, closed) */}
          {machine.uiState === "config_error" ||
          machine.uiState === "not_open" ||
          machine.uiState === "paused" ||
          machine.uiState === "closed" ? (
            <div className={`${styles.banner} ${styles.bannerWarning}`}>
              <h3
                id="registration-active-heading"
                tabIndex={-1}
                className={styles.bannerTitle}
              >
                <AlertTriangleIcon />
                <span>
                  {machine.uiState === "not_open"
                    ? "Registration Not Yet Open"
                    : machine.uiState === "paused"
                      ? "Online Registration Temporarily Paused"
                      : machine.uiState === "closed"
                        ? "Online Registration Closed"
                        : "Online Registration Temporarily Unavailable"}
                </span>
              </h3>
              <p className="type-body-large">
                {machine.statusMessage ??
                  "Online registration cannot be completed right now. Please contact AFOGRADE directly on WhatsApp for assistance."}
              </p>
              <div className={styles.bannerActions}>
                <WhatsAppCta
                  intent="registration_help"
                  label="Message AFOGRADE on WhatsApp"
                  variant="whatsapp"
                  ctaLocation={`state_${machine.uiState}`}
                />
                {machine.uiState !== "config_error" ? (
                  <Button variant="outline" onClick={openRecoveryView}>
                    Already Registered? Recover Payment Screen
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* 3. DUPLICATE RECENT WARNING CONFIRMATION (PRD Section 11.3) */}
          {machine.uiState === "duplicate_confirmation" ? (
            <div
              className={`${styles.banner} ${styles.bannerWarning}`}
              role="alert"
            >
              <h3
                id="registration-active-heading"
                tabIndex={-1}
                className={styles.bannerTitle}
              >
                <AlertTriangleIcon />
                <span>Recent Registration Detected for This Number &amp; Plan</span>
              </h3>
              <p className="type-body-large">
                {machine.statusMessage ??
                  "A registration with this WhatsApp number and plan was recorded within the last 10 minutes. Confirming below will create a separate Registration ID and record (for example, if two siblings share a parent's WhatsApp line)."}
              </p>
              <div className={styles.bannerActions}>
                <Button
                  variant="primary"
                  onClick={() => void executeSubmission(true)}
                >
                  Confirm &amp; Create Separate Registration
                </Button>
                <Button variant="outline" onClick={cancelDuplicateWarning}>
                  Cancel &amp; Review Details
                </Button>
              </div>
            </div>
          ) : null}

          {/* 4. EXPIRED SESSION / AMBIGUOUS TIMEOUT / MANUAL RECOVERY */}
          {machine.uiState === "expired_session" ||
          machine.uiState === "ambiguous_timeout" ||
          machine.uiState === "recovery" ? (
            <SessionRecoveryCard
              uiState={machine.uiState}
              statusMessage={machine.statusMessage}
              retainedReference={machine.retainedReference}
              attemptKey={machine.attemptKey}
              isRecovering={isRecovering}
              recoveryError={recoveryError}
              onRecoverStatus={attemptStatusRecovery}
              onRetrySameSubmission={() => executeSubmission(false)}
              onReturnToForm={returnToFormFromRecovery}
              onStartNewConfirmed={confirmStartNewRegistration}
            />
          ) : null}

          {/* 5. SERVER-CONFIRMED PAYMENT SCREEN (ONLY when canDisplayPaymentDetails is true!) */}
          {canDisplayPaymentDetails(machine) && machine.confirmedRegistration ? (
            <PaymentInstructions
              registration={machine.confirmedRegistration}
              sessionMinutes={sessionTotalDurationMinutes}
              onStartNewConfirmed={confirmStartNewRegistration}
            />
          ) : null}

          {/* 6. REGISTRATION FORM (form | validation_error | submitting) */}
          {machine.uiState === "form" ||
          machine.uiState === "validation_error" ||
          machine.uiState === "submitting" ? (
            <>
              {errorEntries.length > 0 ||
              (machine.uiState === "validation_error" && machine.statusMessage) ? (
                <div
                  ref={errorSummaryRef}
                  className={`${styles.banner} ${styles.bannerError}`}
                  style={{ marginBottom: "24px" }}
                  role="alert"
                  aria-live="assertive"
                >
                  <p className={styles.bannerTitle}>
                    <AlertTriangleIcon />
                    <span>
                      {machine.statusMessage ??
                        "Please fix the highlighted fields below"}
                    </span>
                  </p>
                  {errorEntries.length > 0 ? (
                    <ul className={styles.errorSummaryList}>
                      {errorEntries.map(([field, msg]) => (
                        <li key={field}>
                          <a
                            href={`#${FIELD_DOM_IDS[field]}`}
                            className={styles.errorSummaryLink}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(FIELD_DOM_IDS[field])?.focus();
                            }}
                          >
                            {msg}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              <form
                className={styles.form}
                noValidate
                onSubmit={(e) => void handleFormSubmit(e)}
              >
                {/* REG-01 & REG-02 */}
                <div className={`${styles.fieldGrid} ${styles.fieldGridTwo}`}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="field-fullName" className={styles.label}>
                      Candidate Full Name
                      <span className={styles.requiredMark} aria-hidden="true">
                        *
                      </span>
                    </label>
                    <span id="hint-fullName" className={styles.hint}>
                      Surname and first name as used in school/UTME preparation.
                    </span>
                    <input
                      id="field-fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Ibrahim Musa Adebayo"
                      required
                      maxLength={80}
                      disabled={machine.uiState === "submitting"}
                      value={formValues.fullName}
                      aria-invalid={Boolean(machine.fieldErrors.fullName)}
                      aria-describedby={
                        machine.fieldErrors.fullName
                          ? "hint-fullName err-fullName"
                          : "hint-fullName"
                      }
                      className={`${styles.input} ${
                        formValues.fullName ? styles.inputFilled : ""
                      } ${
                        machine.fieldErrors.fullName ? styles.inputInvalid : ""
                      }`.trim()}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      onBlur={() => validateBlurField("fullName")}
                    />
                    {machine.fieldErrors.fullName ? (
                      <p id="err-fullName" className={styles.fieldError}>
                        {machine.fieldErrors.fullName}
                      </p>
                    ) : null}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="field-whatsappNumber" className={styles.label}>
                      Active WhatsApp Number
                      <span className={styles.requiredMark} aria-hidden="true">
                        *
                      </span>
                    </label>
                    <span id="hint-whatsappNumber" className={styles.hint}>
                      Used for group access delivery (e.g. 08012345678).
                    </span>
                    <input
                      id="field-whatsappNumber"
                      name="whatsappNumber"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="e.g. 08012345678 or +234..."
                      required
                      disabled={machine.uiState === "submitting"}
                      value={formValues.whatsappNumber}
                      aria-invalid={Boolean(machine.fieldErrors.whatsappNumber)}
                      aria-describedby={
                        machine.fieldErrors.whatsappNumber
                          ? "hint-whatsappNumber err-whatsappNumber"
                          : "hint-whatsappNumber"
                      }
                      className={`${styles.input} ${
                        formValues.whatsappNumber ? styles.inputFilled : ""
                      } ${
                        machine.fieldErrors.whatsappNumber ? styles.inputInvalid : ""
                      }`.trim()}
                      onChange={(e) => updateField("whatsappNumber", e.target.value)}
                      onBlur={() => validateBlurField("whatsappNumber")}
                    />
                    {machine.fieldErrors.whatsappNumber ? (
                      <p id="err-whatsappNumber" className={styles.fieldError}>
                        {machine.fieldErrors.whatsappNumber}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* REG-03 & REG-04 */}
                <div className={`${styles.fieldGrid} ${styles.fieldGridTwo}`}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="field-telegramUsername" className={styles.label}>
                      Telegram Username
                      <span className={styles.optionalTag}>(Optional)</span>
                    </label>
                    <span id="hint-telegramUsername" className={styles.hint}>
                      5–32 characters, e.g. @candidate2027 (if you already use Telegram).
                    </span>
                    <input
                      id="field-telegramUsername"
                      name="telegramUsername"
                      type="text"
                      placeholder="e.g. @candidate2027"
                      maxLength={33}
                      disabled={machine.uiState === "submitting"}
                      value={formValues.telegramUsername}
                      aria-invalid={Boolean(machine.fieldErrors.telegramUsername)}
                      aria-describedby={
                        machine.fieldErrors.telegramUsername
                          ? "hint-telegramUsername err-telegramUsername"
                          : "hint-telegramUsername"
                      }
                      className={`${styles.input} ${
                        formValues.telegramUsername ? styles.inputFilled : ""
                      } ${
                        machine.fieldErrors.telegramUsername
                          ? styles.inputInvalid
                          : ""
                      }`.trim()}
                      onChange={(e) =>
                        updateField("telegramUsername", e.target.value)
                      }
                      onBlur={() => validateBlurField("telegramUsername")}
                    />
                    {machine.fieldErrors.telegramUsername ? (
                      <p id="err-telegramUsername" className={styles.fieldError}>
                        {machine.fieldErrors.telegramUsername}
                      </p>
                    ) : null}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="field-email" className={styles.label}>
                      Email Address
                      <span className={styles.optionalTag}>(Optional)</span>
                    </label>
                    <span id="hint-email" className={styles.hint}>
                      Optional secondary contact record.
                    </span>
                    <input
                      id="field-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="e.g. candidate@example.com"
                      maxLength={254}
                      disabled={machine.uiState === "submitting"}
                      value={formValues.email}
                      aria-invalid={Boolean(machine.fieldErrors.email)}
                      aria-describedby={
                        machine.fieldErrors.email
                          ? "hint-email err-email"
                          : "hint-email"
                      }
                      className={`${styles.input} ${
                        formValues.email ? styles.inputFilled : ""
                      } ${
                        machine.fieldErrors.email ? styles.inputInvalid : ""
                      }`.trim()}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => validateBlurField("email")}
                    />
                    {machine.fieldErrors.email ? (
                      <p id="err-email" className={styles.fieldError}>
                        {machine.fieldErrors.email}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* REG-05 & REG-06 */}
                <div className={`${styles.fieldGrid} ${styles.fieldGridTwo}`}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="field-stateOfResidence" className={styles.label}>
                      State of Residence
                      <span className={styles.requiredMark} aria-hidden="true">
                        *
                      </span>
                    </label>
                    <select
                      id="field-stateOfResidence"
                      name="stateOfResidence"
                      required
                      disabled={machine.uiState === "submitting"}
                      value={formValues.stateOfResidence}
                      aria-invalid={Boolean(machine.fieldErrors.stateOfResidence)}
                      aria-describedby={
                        machine.fieldErrors.stateOfResidence
                          ? "err-stateOfResidence"
                          : undefined
                      }
                      className={`${styles.select} ${
                        formValues.stateOfResidence ? styles.inputFilled : ""
                      } ${
                        machine.fieldErrors.stateOfResidence
                          ? styles.inputInvalid
                          : ""
                      }`.trim()}
                      onChange={(e) =>
                        updateField("stateOfResidence", e.target.value)
                      }
                      onBlur={() => validateBlurField("stateOfResidence")}
                    >
                      <option value="">Select state of residence...</option>
                      {stateOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {machine.fieldErrors.stateOfResidence ? (
                      <p id="err-stateOfResidence" className={styles.fieldError}>
                        {machine.fieldErrors.stateOfResidence}
                      </p>
                    ) : null}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="field-schoolName" className={styles.label}>
                      Secondary School / Tutorial Centre
                      <span className={styles.optionalTag}>(Optional)</span>
                    </label>
                    <input
                      id="field-schoolName"
                      name="schoolName"
                      type="text"
                      placeholder="e.g. Kings College Lagos"
                      maxLength={100}
                      disabled={machine.uiState === "submitting"}
                      value={formValues.schoolName}
                      aria-invalid={Boolean(machine.fieldErrors.schoolName)}
                      aria-describedby={
                        machine.fieldErrors.schoolName
                          ? "err-schoolName"
                          : undefined
                      }
                      className={`${styles.input} ${
                        formValues.schoolName ? styles.inputFilled : ""
                      } ${
                        machine.fieldErrors.schoolName ? styles.inputInvalid : ""
                      }`.trim()}
                      onChange={(e) => updateField("schoolName", e.target.value)}
                      onBlur={() => validateBlurField("schoolName")}
                    />
                    {machine.fieldErrors.schoolName ? (
                      <p id="err-schoolName" className={styles.fieldError}>
                        {machine.fieldErrors.schoolName}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* REG-07: UTME Subject Combination */}
                <fieldset
                  id="field-electiveSubjects"
                  tabIndex={-1}
                  className={styles.fieldset}
                >
                  <legend className={styles.legend}>
                    UTME Subject Combination
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </legend>
                  <p className={styles.hint}>
                    <strong>{COMPULSORY_SUBJECT}</strong> is compulsory for all
                    candidates. Select <strong>any 3 subjects</strong> below.
                  </p>
                  <div className={styles.compulsoryPill}>
                    ✓ {COMPULSORY_SUBJECT} (Included automatically)
                  </div>

                  <div className={styles.subjectGrid}>
                    {ELECTIVE_SUBJECTS.map((subject) => {
                      const isChecked =
                        formValues.electiveSubjects.includes(subject);
                      const maxReached =
                        formValues.electiveSubjects.length >= 3 && !isChecked;

                      return (
                        <label
                          key={subject}
                          className={`${styles.choiceTile} ${
                            isChecked ? styles.choiceTileSelected : ""
                          } ${maxReached ? styles.choiceTileDisabled : ""}`.trim()}
                        >
                          <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={isChecked}
                            disabled={
                              machine.uiState === "submitting" || maxReached
                            }
                            onChange={() => toggleElectiveSubject(subject)}
                          />
                          <span>{subject}</span>
                        </label>
                      );
                    })}
                  </div>

                  {machine.fieldErrors.electiveSubjects ? (
                    <p className={styles.fieldError} role="alert">
                      {machine.fieldErrors.electiveSubjects}
                    </p>
                  ) : null}
                </fieldset>

                {/* REG-08: Server-Available Plan Selection */}
                <fieldset
                  id="field-planId"
                  tabIndex={-1}
                  className={styles.fieldset}
                >
                  <legend className={styles.legend}>
                    Select Available Subscription Plan
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </legend>
                  <p className={styles.hint}>
                    Only plans currently valid for the server schedule are shown.
                    Final amount and covered cycles are verified by the server on
                    submission.
                  </p>
                  <div className={styles.priceTagsBox}>
                    <PriceTags tone="light" />
                  </div>
                  <div className={styles.planRadioGrid}>
                    {machine.availablePlans.map((plan) => {
                      const selected = formValues.planId === plan.id;
                      return (
                        <label
                          key={plan.id}
                          className={`${styles.planOptionCard} ${
                            selected ? styles.planOptionSelected : ""
                          }`.trim()}
                        >
                          <input
                            type="radio"
                            name="planId"
                            value={plan.id}
                            checked={selected}
                            disabled={machine.uiState === "submitting"}
                            className={styles.radioInput}
                            onChange={() => updateField("planId", plan.id)}
                          />
                          <div className={styles.planOptionMeta}>
                            <span className={styles.planOptionTitle}>
                              {plan.name}
                              {plan.badge ? (
                                <span className={styles.planOptionBadge}>
                                  {plan.badge}
                                </span>
                              ) : null}
                            </span>
                            <span className={styles.planOptionPrice}>
                              {formatNaira(plan.totalAmountNgn)}{" "}
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 500,
                                  color:
                                    "var(--afograde-color-on-surface-variant)",
                                }}
                              >
                                ({formatNaira(plan.monthlyPriceNgn)}/month)
                              </span>
                            </span>
                            <span className={styles.planOptionSub}>
                              {plan.coveredCyclesLabel}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {machine.fieldErrors.planId ? (
                    <p className={styles.fieldError} role="alert">
                      {machine.fieldErrors.planId}
                    </p>
                  ) : null}
                </fieldset>

                {/* REG-10: Hidden Honeypot Field.
                    Named with no meaning on purpose: browser autofill and
                    password managers fill fields that look like "company",
                    "website" or "url", which silently tripped the trap for
                    real students ("Request rejected."). */}
                <div className={styles.honeypotWrap} aria-hidden="true">
                  <label htmlFor="field-hpx7q">Leave this field blank</label>
                  <input
                    id="field-hpx7q"
                    name="hpx7q"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-form-type="other"
                    value={formValues.honeypot}
                    onChange={(e) => updateField("honeypot", e.target.value)}
                  />
                </div>

                {/* REG-09: Privacy Notice & Minors Guidance */}
                <div className={styles.privacyBox}>
                  <p className={styles.minorsNotice}>
                    <strong>Under-18 &amp; Parent/Guardian Notice:</strong>{" "}
                    {PRIVACY_NOTICE_CONFIG.minorsGuidanceNotice}
                  </p>
                  <label
                    htmlFor="field-privacyAcknowledged"
                    className={styles.privacyCheckLabel}
                  >
                    <input
                      id="field-privacyAcknowledged"
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={formValues.privacyAcknowledged}
                      disabled={machine.uiState === "submitting"}
                      aria-invalid={Boolean(
                        machine.fieldErrors.privacyAcknowledged
                      )}
                      onChange={(e) =>
                        updateField("privacyAcknowledged", e.target.checked)
                      }
                    />
                    <span className="type-body-medium">
                      I have read and understood how AFOGRADE processes
                      registration information as described in the{" "}
                      <Link href="/privacy/" target="_blank">
                        Privacy Notice
                      </Link>{" "}
                      (and, if under 18, I am completing this with my parent or
                      legal guardian’s awareness).
                    </span>
                  </label>
                  {machine.fieldErrors.privacyAcknowledged ? (
                    <p className={styles.fieldError} role="alert">
                      {machine.fieldErrors.privacyAcknowledged}
                    </p>
                  ) : null}
                </div>

                {/* REG-11: Cloudflare Turnstile */}
                <TurnstileWidget
                  resetNonce={turnstileResetNonce}
                  error={machine.fieldErrors.turnstileToken}
                  onVerify={(token) => updateField("turnstileToken", token)}
                  onExpireOrError={() => updateField("turnstileToken", "")}
                />

                {/* Live Requirement Checklist / Feedback */}
                {!canProceed ? (
                  <div className={styles.requirementNotice} role="status">
                    <div className={styles.requirementHeader}>
                      <span className={styles.requirementBadge}>
                        Step 1 Required Fields
                      </span>
                      <span className={styles.requirementCounter}>
                        {requiredCompletedCount} of 6 Completed
                      </span>
                    </div>
                    <p className={styles.requirementText}>
                      Please complete all required fields marked with{" "}
                      <strong style={{ color: "var(--afograde-color-error)" }}>*</strong> before proceeding to transfer instructions:
                    </p>
                    <ul className={styles.requirementList}>
                      {!isFullNameFilled && (
                        <li className={styles.requirementChip}>
                          <span className={styles.requirementChipDot} />
                          Full Name
                        </li>
                      )}
                      {!isWhatsAppFilled && (
                        <li className={styles.requirementChip}>
                          <span className={styles.requirementChipDot} />
                          WhatsApp Number
                        </li>
                      )}
                      {!isStateFilled && (
                        <li className={styles.requirementChip}>
                          <span className={styles.requirementChipDot} />
                          State of Residence
                        </li>
                      )}
                      {!isElectivesFilled && (
                        <li className={styles.requirementChip}>
                          <span className={styles.requirementChipDot} />
                          3 Subjects ({formValues.electiveSubjects.length}/3)
                        </li>
                      )}
                      {!isPlanFilled && (
                        <li className={styles.requirementChip}>
                          <span className={styles.requirementChipDot} />
                          Subscription Plan
                        </li>
                      )}
                      {!isPrivacyFilled && (
                        <li className={styles.requirementChip}>
                          <span className={styles.requirementChipDot} />
                          Privacy Notice
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className={styles.requirementSuccess} role="status">
                    <span className={styles.requirementCheck} aria-hidden="true">✓</span>
                    <span>
                      All required fields completed! You can now proceed to view bank transfer instructions.
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={!canProceed || machine.uiState === "submitting"}
                  className={!canProceed ? styles.submitBtnLocked : undefined}
                >
                  {machine.uiState === "submitting"
                    ? "Recording Your Registration..."
                    : canProceed
                      ? "Submit Registration & View Transfer Instructions →"
                      : `Complete All Required Fields to Proceed (${requiredCompletedCount}/6)`}
                </Button>
              </form>

              <div className={styles.recoveryFooterBar}>
                <span>Already registered earlier on this or another tab?</span>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={openRecoveryView}
                >
                  Restore Payment Screen with Registration ID
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

