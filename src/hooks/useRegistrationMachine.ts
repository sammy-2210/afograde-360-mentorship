"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { isTurnstileConfigured } from "@/config/env";
import { LAUNCH_GATES, PRIVACY_NOTICE_CONFIG } from "@/config/gates";
import { trackEvent } from "@/lib/analytics";
import {
  fetchServerConfig,
  pollStatusRecoveryBounded,
  recoverRegistrationStatus,
  submitRegistration,
} from "@/lib/api";
import {
  computePayloadHash,
  generateSubmissionKey,
  isValidRegistrationId,
} from "@/lib/crypto";
import {
  checkLocalStorageAvailable,
  clearAllLocalRegistrationState,
  clearAttemptKey,
  expireActivePaymentSessionOnly,
  inspectStoredSession,
  loadAttemptKey,
  PAYMENT_SESSION_TTL_MS,
  saveAttemptKey,
  saveConfirmedSession,
} from "@/lib/persistence";
import {
  createInitialMachineState,
  registrationReducer,
} from "@/lib/stateMachine";
import {
  formatUtmeSubjectsLabel,
  normalizeFullName,
  normalizeTelegramUsername,
  normalizeWhatsAppNumber,
  validateRegistrationForm,
  validateSingleField,
} from "@/lib/validation";
import type {
  ElectiveSubject,
  PersistedAttemptKey,
  RegisterRequestPayload,
  RegistrationFieldName,
  RegistrationFormValues,
  UtmParams,
} from "@/types/registration";

const INITIAL_FORM_VALUES: RegistrationFormValues = {
  fullName: "",
  whatsappNumber: "",
  telegramUsername: "",
  email: "",
  stateOfResidence: "",
  schoolName: "",
  electiveSubjects: [],
  planId: "",
  privacyAcknowledged: false,
  honeypot: "",
  turnstileToken: "",
};

export function useRegistrationMachine(utm: UtmParams) {
  const [machine, dispatch] = useReducer(
    registrationReducer,
    undefined,
    createInitialMachineState
  );
  const [formValues, setFormValues] = useState<RegistrationFormValues>(INITIAL_FORM_VALUES);
  const [turnstileResetNonce, setTurnstileResetNonce] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const allowInternational =
    Boolean(machine.serverConfig?.allowInternationalCandidates) ||
    LAUNCH_GATES.internationalEligibility.approved;

  const requireTurnstile = isTurnstileConfigured();

  // Initial load: check storage, inspect existing session, fetch authoritative server config
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function bootstrap() {
      const storageOk = checkLocalStorageAvailable();
      dispatch({ type: "STORAGE_CHECKED", available: storageOk });

      const storedSession = inspectStoredSession();
      const restoredAttempt = loadAttemptKey();

      // Always load server config first
      const configResult = await fetchServerConfig();

      // If an active (<30m) local session exists, re-verify with the server before showing bank details!
      if (storedSession.status === "active" && storedSession.session.recoveryToken) {
        const verifyResult = await recoverRegistrationStatus({
          action: "status",
          registrationId: storedSession.session.registrationId,
          recoveryToken: storedSession.session.recoveryToken,
        });

        if (verifyResult.ok) {
          dispatch({
            type: "RECOVERY_VERIFIED",
            registration: verifyResult.data,
            expiresAtMs: storedSession.session.expiresAtMs,
          });
          trackEvent("payment_instructions_displayed", {
            plan_id: verifyResult.data.planId,
            months: verifyResult.data.months,
          });
          return;
        }
      }

      // If >30m expired session or unverified retained reference exists, show safe expired_session view
      if (storedSession.status === "expired") {
        dispatch({
          type: "SESSION_EXPIRED_DETECTED",
          reference: storedSession.reference,
          config: configResult.ok ? configResult.data : null,
        });
        trackEvent("registration_session_expired");
        return;
      }

      if (!configResult.ok) {
        dispatch({ type: "CONFIG_FAILED", message: configResult.message });
        return;
      }

      const cfg = configResult.data;
      if (cfg.registrationState === "OPEN") {
        dispatch({
          type: "CONFIG_LOADED_OPEN",
          config: cfg,
          restoredAttempt,
        });
        // Pre-select first available plan if none chosen yet
        const firstPlan = cfg.plans.find((p) => p.available);
        if (firstPlan) {
          setFormValues((prev) => (prev.planId ? prev : { ...prev, planId: firstPlan.id }));
        }
        return;
      }

      const mappedState =
        cfg.registrationState === "PAUSED"
          ? "paused"
          : cfg.registrationState === "CLOSED"
            ? "closed"
            : "not_open";

      const defaultMsg =
        mappedState === "not_open"
          ? cfg.stateMessage ??
            `Online registration is not yet open${
              cfg.openingDateLabel ? ` (Scheduled opening: ${cfg.openingDateLabel})` : ""
            }.`
          : mappedState === "paused"
            ? cfg.stateMessage ??
              "Online registration is temporarily paused while AFOGRADE verifies current intake capacity."
            : cfg.stateMessage ?? "Online registration for this intake window has closed.";

      dispatch({
        type: "CONFIG_LOADED_GATED",
        uiState: mappedState,
        config: cfg,
        message: defaultMsg,
      });
    }

    void bootstrap();
  }, []);

  // Automatic 30-minute local payment-screen timer (PRD Section 5 & 13)
  useEffect(() => {
    if (machine.uiState !== "payment" || !machine.sessionExpiresAtMs) {
      return;
    }

    const remainingMs = machine.sessionExpiresAtMs - Date.now();
    if (remainingMs <= 0) {
      expireActivePaymentSessionOnly();
      dispatch({ type: "LOCAL_PAYMENT_TIMER_EXPIRED" });
      trackEvent("registration_session_expired");
      return;
    }

    const timer = window.setTimeout(() => {
      expireActivePaymentSessionOnly();
      dispatch({ type: "LOCAL_PAYMENT_TIMER_EXPIRED" });
      trackEvent("registration_session_expired");
    }, remainingMs);

    return () => window.clearTimeout(timer);
  }, [machine.uiState, machine.sessionExpiresAtMs]);

  const updateField = useCallback(
    <K extends keyof RegistrationFormValues>(
      field: K,
      value: RegistrationFormValues[K]
    ) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
      if (field === "planId" && typeof value === "string" && value) {
        const matched = machine.availablePlans.find((p) => p.id === value);
        trackEvent("plan_selected", {
          plan_id: value,
          months: matched?.months,
        });
      }
      if (field !== "honeypot") {
        dispatch({ type: "FIELD_EDITED", field: field as RegistrationFieldName });
      }
    },
    [machine.availablePlans]
  );

  const toggleElectiveSubject = useCallback((subject: ElectiveSubject) => {
    setFormValues((prev) => {
      const exists = prev.electiveSubjects.includes(subject);
      let nextElectives: ElectiveSubject[];
      if (exists) {
        nextElectives = prev.electiveSubjects.filter((s) => s !== subject);
      } else {
        if (prev.electiveSubjects.length >= 3) {
          return prev;
        }
        nextElectives = [...prev.electiveSubjects, subject];
      }
      return {
        ...prev,
        electiveSubjects: nextElectives,
      };
    });
    dispatch({ type: "FIELD_EDITED", field: "electiveSubjects" });
  }, []);

  const selectPlanAndFocusForm = useCallback(
    (planId: string) => {
      setFormValues((prev) => ({ ...prev, planId }));
      const matched = machine.availablePlans.find((p) => p.id === planId);
      trackEvent("plan_selected", {
        plan_id: planId,
        months: matched?.months,
      });
    },
    [machine.availablePlans]
  );

  const validateBlurField = useCallback(
    (field: RegistrationFieldName) => {
      const err = validateSingleField(field, formValues, {
        availablePlans: machine.availablePlans,
        allowInternational,
        requireTurnstile,
      });
      if (err) {
        dispatch({
          type: "VALIDATION_FAILED",
          errors: { ...machine.fieldErrors, [field]: err },
        });
      }
    },
    [allowInternational, formValues, machine.availablePlans, machine.fieldErrors, requireTurnstile]
  );

  const resetTurnstile = useCallback(() => {
    setFormValues((prev) => ({ ...prev, turnstileToken: "" }));
    setTurnstileResetNonce((n) => n + 1);
  }, []);

  const executeSubmission = useCallback(
    async (confirmDuplicateRecent = false): Promise<{
      firstErrorField?: RegistrationFieldName;
    }> => {
      const validation = validateRegistrationForm(formValues, {
        availablePlans: machine.availablePlans,
        allowInternational,
        requireTurnstile,
      });

      if (!validation.isValid) {
        dispatch({ type: "VALIDATION_FAILED", errors: validation.errors });
        const orderedFields: RegistrationFieldName[] = [
          "fullName",
          "whatsappNumber",
          "telegramUsername",
          "email",
          "stateOfResidence",
          "schoolName",
          "electiveSubjects",
          "planId",
          "privacyAcknowledged",
          "turnstileToken",
        ];
        const firstInvalid = orderedFields.find((f) => Boolean(validation.errors[f]));
        return { firstErrorField: firstInvalid };
      }

      const phoneNorm = normalizeWhatsAppNumber(
        formValues.whatsappNumber,
        allowInternational
      );
      const cleanName = normalizeFullName(formValues.fullName);
      const cleanTelegram = normalizeTelegramUsername(formValues.telegramUsername);
      const cleanEmail = formValues.email.trim().toLowerCase();
      const cleanSchool = formValues.schoolName.trim();
      const subjectsLabel = formatUtmeSubjectsLabel(formValues.electiveSubjects);

      const payloadHash = await computePayloadHash({
        fullName: cleanName,
        whatsappCanonical: phoneNorm.canonical,
        telegramUsername: cleanTelegram,
        email: cleanEmail,
        stateOfResidence: formValues.stateOfResidence.trim(),
        schoolName: cleanSchool,
        subjectsLabel,
        planId: formValues.planId,
      });

      // Reuse existing submissionKey ONLY if payloadHash matches AND not confirming a deliberate duplicate
      let attempt: PersistedAttemptKey;
      if (
        !confirmDuplicateRecent &&
        machine.attemptKey &&
        machine.attemptKey.payloadHash === payloadHash
      ) {
        attempt = machine.attemptKey;
      } else {
        attempt = {
          submissionKey: generateSubmissionKey(),
          payloadHash,
          createdAtMs: Date.now(),
        };
      }

      // Persist submission key BEFORE network send (PRD Section 11.2)
      saveAttemptKey(attempt);
      dispatch({ type: "SUBMIT_STARTED", attemptKey: attempt });
      trackEvent("registration_submit_attempted", { plan_id: formValues.planId });

      const requestPayload: RegisterRequestPayload = {
        action: "register",
        submissionKey: attempt.submissionKey,
        payloadHash: attempt.payloadHash,
        confirmDuplicateRecent,
        privacyNoticeVersion: PRIVACY_NOTICE_CONFIG.version,
        turnstileToken: formValues.turnstileToken,
        honeypot: formValues.honeypot,
        student: {
          fullName: cleanName,
          whatsappCanonical: phoneNorm.canonical,
          telegramUsername: cleanTelegram,
          email: cleanEmail,
          stateOfResidence: formValues.stateOfResidence.trim(),
          schoolName: cleanSchool,
          subjectsLabel,
          planId: formValues.planId,
        },
        utm,
      };

      const result = await submitRegistration(requestPayload);

      if (result.ok) {
        clearAttemptKey();
        const saved = saveConfirmedSession({
          registrationId: result.data.registrationId,
          recoveryToken: result.data.recoveryToken ?? "",
          firstName: result.data.firstName,
          planId: result.data.planId,
        });

        dispatch({
          type: "SERVER_SUCCESS",
          registration: result.data,
          expiresAtMs: saved.expiresAtMs,
        });
        trackEvent("registration_recorded", {
          plan_id: result.data.planId,
          months: result.data.months,
        });
        trackEvent("payment_instructions_displayed", {
          plan_id: result.data.planId,
          months: result.data.months,
        });
        return {};
      }

      // Handle PRD Section 9.5 response codes explicitly
      switch (result.code) {
        case "DUPLICATE_RECENT":
          resetTurnstile();
          dispatch({
            type: "DUPLICATE_RECENT_DETECTED",
            message: result.message,
          });
          return {};

        case "UNKNOWN": {
          dispatch({ type: "AMBIGUOUS_OUTCOME", message: result.message });
          // Automatically perform bounded status recovery using the preserved submissionKey!
          const polled = await pollStatusRecoveryBounded({
            action: "status",
            submissionKey: attempt.submissionKey,
          });
          if (polled.ok) {
            clearAttemptKey();
            const saved = saveConfirmedSession({
              registrationId: polled.data.registrationId,
              recoveryToken: polled.data.recoveryToken ?? "",
              firstName: polled.data.firstName,
              planId: polled.data.planId,
            });
            dispatch({
              type: "RECOVERY_VERIFIED",
              registration: polled.data,
              expiresAtMs: saved.expiresAtMs,
            });
            trackEvent("registration_recorded", {
              plan_id: polled.data.planId,
              months: polled.data.months,
            });
          } else {
            resetTurnstile();
          }
          return {};
        }

        case "TURNSTILE_FAILED":
          resetTurnstile();
          trackEvent("registration_failed", { error_code: result.code });
          dispatch({
            type: "DEFINITIVE_SUBMIT_ERROR",
            message: result.message,
            fieldErrors: { turnstileToken: result.message },
            nextState: "validation_error",
          });
          return { firstErrorField: "turnstileToken" };

        case "PLAN_UNAVAILABLE": {
          resetTurnstile();
          trackEvent("registration_failed", { error_code: result.code });
          const refreshed = await fetchServerConfig();
          if (refreshed.ok && refreshed.data.registrationState === "OPEN") {
            dispatch({ type: "CONFIG_LOADED_OPEN", config: refreshed.data });
          }
          dispatch({
            type: "DEFINITIVE_SUBMIT_ERROR",
            message: result.message,
            fieldErrors: { planId: result.message },
            nextState: "validation_error",
          });
          return { firstErrorField: "planId" };
        }

        case "PAUSED":
        case "CLOSED":
        case "NOT_OPEN":
          clearAttemptKey();
          trackEvent("registration_failed", { error_code: result.code });
          dispatch({
            type: "DEFINITIVE_SUBMIT_ERROR",
            message: result.message,
            nextState:
              result.code === "PAUSED"
                ? "paused"
                : result.code === "CLOSED"
                  ? "closed"
                  : "not_open",
          });
          return {};

        case "CONFIG_INVALID":
          trackEvent("registration_failed", { error_code: result.code });
          dispatch({
            type: "DEFINITIVE_SUBMIT_ERROR",
            message: result.message,
            nextState: "config_error",
          });
          return {};

        case "VALIDATION":
        case "RATE_LIMITED":
        case "BUSY":
        case "SERVER_ERROR":
        default:
          resetTurnstile();
          trackEvent("registration_failed", { error_code: result.code });
          dispatch({
            type: "DEFINITIVE_SUBMIT_ERROR",
            message: result.message,
            fieldErrors: result.fieldErrors,
          });
          return {};
      }
    },
    [
      allowInternational,
      formValues,
      machine.attemptKey,
      machine.availablePlans,
      requireTurnstile,
      resetTurnstile,
      utm,
    ]
  );

  const attemptStatusRecovery = useCallback(
    async (manualRegistrationId?: string) => {
      setIsRecovering(true);
      setRecoveryError(null);

      const cleanedId = manualRegistrationId?.trim().toUpperCase();
      if (cleanedId && !isValidRegistrationId(cleanedId)) {
        setIsRecovering(false);
        setRecoveryError(
          "Enter a valid Registration ID in the format AFO-2027-00001."
        );
        return;
      }

      const recoveryToken = machine.retainedReference?.recoveryToken;
      const submissionKey = machine.attemptKey?.submissionKey;
      const registrationId = cleanedId || machine.retainedReference?.registrationId;

      if (!recoveryToken && !submissionKey && !registrationId) {
        setIsRecovering(false);
        setRecoveryError(
          "No pending submission key or Registration ID was provided. Please enter your Registration ID or reach AFOGRADE on WhatsApp."
        );
        return;
      }

      const result = await recoverRegistrationStatus({
        action: "status",
        registrationId,
        recoveryToken,
        submissionKey,
      });

      setIsRecovering(false);

      if (result.ok) {
        clearAttemptKey();
        const saved = saveConfirmedSession({
          registrationId: result.data.registrationId,
          recoveryToken: result.data.recoveryToken ?? recoveryToken ?? "",
          firstName: result.data.firstName,
          planId: result.data.planId,
        });
        dispatch({
          type: "RECOVERY_VERIFIED",
          registration: result.data,
          expiresAtMs: saved.expiresAtMs,
        });
        trackEvent("payment_instructions_displayed", {
          plan_id: result.data.planId,
          months: result.data.months,
        });
        return;
      }

      setRecoveryError(result.message);
    },
    [machine.attemptKey, machine.retainedReference]
  );

  const confirmStartNewRegistration = useCallback(() => {
    clearAllLocalRegistrationState();
    setFormValues((prev) => ({
      ...INITIAL_FORM_VALUES,
      planId: machine.availablePlans[0]?.id ?? prev.planId,
    }));
    resetTurnstile();
    dispatch({ type: "START_NEW_REGISTRATION_CONFIRMED" });
  }, [machine.availablePlans, resetTurnstile]);

  return {
    machine,
    formValues,
    allowInternational,
    requireTurnstile,
    turnstileResetNonce,
    isRecovering,
    recoveryError,
    updateField,
    toggleElectiveSubject,
    selectPlanAndFocusForm,
    validateBlurField,
    executeSubmission,
    attemptStatusRecovery,
    confirmStartNewRegistration,
    cancelDuplicateWarning: () => dispatch({ type: "CANCEL_DUPLICATE_CONFIRMATION" }),
    openRecoveryView: () => {
      setRecoveryError(null);
      dispatch({ type: "OPEN_RECOVERY_VIEW" });
    },
    returnToFormFromRecovery: () => {
      setRecoveryError(null);
      dispatch({ type: "RETURN_TO_FORM_FROM_RECOVERY" });
    },
    sessionTotalDurationMinutes: Math.round(PAYMENT_SESSION_TTL_MS / 60000),
  };
}

