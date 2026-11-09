/**
 * Pure Explicit Registration State Machine (PRD Section 6 FR-03, FR-06 & State-Machine Rule)
 *
 * Invariants:
 * 1. Only a server-confirmed registration (`SERVER_SUCCESS`) or verified server status recovery
 *    (`RECOVERY_VERIFIED`) can enter `uiState === "payment"`.
 * 2. Bank transfer details may ONLY be rendered when `canDisplayPaymentDetails(state)` is true.
 * 3. Network timeouts / `UNKNOWN` outcomes preserve the existing `attemptKey` and transition
 *    to `ambiguous_timeout`, never claiming definitive failure or discarding form input.
 */

import type {
  ConfirmedRegistration,
  FieldValidationErrors,
  PersistedAttemptKey,
  PlanOption,
  RegistrationUiState,
  RetainedRegistrationReference,
  ServerConfigPayload,
} from "../types/registration.ts";

export interface RegistrationMachineState {
  uiState: RegistrationUiState;
  serverConfig: ServerConfigPayload | null;
  availablePlans: PlanOption[];
  statusMessage: string | null;
  fieldErrors: FieldValidationErrors;
  attemptKey: PersistedAttemptKey | null;
  confirmedRegistration: ConfirmedRegistration | null;
  retainedReference: RetainedRegistrationReference | null;
  sessionExpiresAtMs: number | null;
  storageAvailable: boolean;
}

export type RegistrationMachineAction =
  | { type: "STORAGE_CHECKED"; available: boolean }
  | {
      type: "CONFIG_LOADED_OPEN";
      config: ServerConfigPayload;
      restoredAttempt?: PersistedAttemptKey | null;
    }
  | {
      type: "CONFIG_LOADED_GATED";
      uiState: "not_open" | "paused" | "closed";
      config: ServerConfigPayload;
      message: string;
    }
  | { type: "CONFIG_FAILED"; message: string }
  | {
      type: "SESSION_EXPIRED_DETECTED";
      reference: RetainedRegistrationReference;
      config: ServerConfigPayload | null;
    }
  | { type: "VALIDATION_FAILED"; errors: FieldValidationErrors; message?: string }
  | { type: "FIELD_EDITED"; field: keyof FieldValidationErrors }
  | { type: "SUBMIT_STARTED"; attemptKey: PersistedAttemptKey }
  | {
      type: "SERVER_SUCCESS";
      registration: ConfirmedRegistration;
      expiresAtMs: number;
    }
  | { type: "DUPLICATE_RECENT_DETECTED"; message: string }
  | { type: "CANCEL_DUPLICATE_CONFIRMATION" }
  | { type: "AMBIGUOUS_OUTCOME"; message: string }
  | { type: "ENTER_MANUAL_RECOVERY"; message?: string }
  | {
      type: "RECOVERY_VERIFIED";
      registration: ConfirmedRegistration;
      expiresAtMs: number;
    }
  | {
      type: "DEFINITIVE_SUBMIT_ERROR";
      message: string;
      fieldErrors?: FieldValidationErrors;
      nextState?: "form" | "validation_error" | "paused" | "closed" | "not_open" | "config_error";
    }
  | { type: "LOCAL_PAYMENT_TIMER_EXPIRED" }
  | { type: "OPEN_RECOVERY_VIEW" }
  | { type: "RETURN_TO_FORM_FROM_RECOVERY" }
  | { type: "START_NEW_REGISTRATION_CONFIRMED" };

export function createInitialMachineState(): RegistrationMachineState {
  return {
    uiState: "loading",
    serverConfig: null,
    availablePlans: [],
    statusMessage: null,
    fieldErrors: {},
    attemptKey: null,
    confirmedRegistration: null,
    retainedReference: null,
    sessionExpiresAtMs: null,
    storageAvailable: true,
  };
}

export function registrationReducer(
  state: RegistrationMachineState,
  action: RegistrationMachineAction
): RegistrationMachineState {
  switch (action.type) {
    case "STORAGE_CHECKED":
      return {
        ...state,
        storageAvailable: action.available,
      };

    case "CONFIG_LOADED_OPEN":
      return {
        ...state,
        uiState: "form",
        serverConfig: action.config,
        availablePlans: action.config.plans.filter((p) => p.available),
        statusMessage: action.config.stateMessage ?? null,
        attemptKey: action.restoredAttempt ?? state.attemptKey,
        confirmedRegistration: null,
      };

    case "CONFIG_LOADED_GATED":
      return {
        ...state,
        uiState: action.uiState,
        serverConfig: action.config,
        availablePlans: action.config.plans.filter((p) => p.available),
        statusMessage: action.message,
        confirmedRegistration: null,
      };

    case "CONFIG_FAILED":
      return {
        ...state,
        uiState: "config_error",
        statusMessage: action.message,
        confirmedRegistration: null,
      };

    case "SESSION_EXPIRED_DETECTED":
      return {
        ...state,
        uiState: "expired_session",
        serverConfig: action.config,
        availablePlans: action.config ? action.config.plans.filter((p) => p.available) : [],
        retainedReference: action.reference,
        confirmedRegistration: null,
        sessionExpiresAtMs: null,
        statusMessage:
          "Your 30-minute automatic payment-screen session on this browser has ended. Your registration was NOT cancelled—restore your payment details below or send proof with your Registration ID.",
      };

    case "VALIDATION_FAILED":
      return {
        ...state,
        uiState: "validation_error",
        fieldErrors: action.errors,
        statusMessage:
          action.message ?? "Please review the highlighted fields before submitting.",
      };

    case "FIELD_EDITED": {
      const nextErrors = { ...state.fieldErrors };
      delete nextErrors[action.field];
      const hasRemainingErrors = Object.keys(nextErrors).length > 0;
      return {
        ...state,
        uiState:
          state.uiState === "validation_error" && !hasRemainingErrors
            ? "form"
            : state.uiState,
        fieldErrors: nextErrors,
        statusMessage: hasRemainingErrors ? state.statusMessage : null,
      };
    }

    case "SUBMIT_STARTED":
      return {
        ...state,
        uiState: "submitting",
        attemptKey: action.attemptKey,
        statusMessage: "Submitting your registration securely...",
        fieldErrors: {},
      };

    case "SERVER_SUCCESS":
    case "RECOVERY_VERIFIED":
      return {
        ...state,
        uiState: "payment",
        confirmedRegistration: action.registration,
        retainedReference: {
          registrationId: action.registration.registrationId,
          recoveryToken: action.registration.recoveryToken,
          recordedAtIso: action.registration.recordedAtLagos || new Date().toISOString(),
        },
        sessionExpiresAtMs: action.expiresAtMs,
        attemptKey: null,
        fieldErrors: {},
        statusMessage: null,
      };

    case "DUPLICATE_RECENT_DETECTED":
      return {
        ...state,
        uiState: "duplicate_confirmation",
        statusMessage: action.message,
      };

    case "CANCEL_DUPLICATE_CONFIRMATION":
      return {
        ...state,
        uiState: "form",
        statusMessage: null,
      };

    case "AMBIGUOUS_OUTCOME":
      return {
        ...state,
        uiState: "ambiguous_timeout",
        // CRITICAL (PRD Section 6 & 11.2): Preserve attemptKey on timeout/ambiguous network outcome!
        attemptKey: state.attemptKey,
        confirmedRegistration: null,
        statusMessage: action.message,
      };

    case "ENTER_MANUAL_RECOVERY":
      return {
        ...state,
        uiState: "recovery",
        confirmedRegistration: null,
        statusMessage:
          action.message ??
          "Enter your Registration ID or retry your pending submission to verify your status.",
      };

    case "DEFINITIVE_SUBMIT_ERROR": {
      const target =
        action.nextState ??
        (action.fieldErrors && Object.keys(action.fieldErrors).length > 0
          ? "validation_error"
          : "form");
      return {
        ...state,
        uiState: target,
        fieldErrors: action.fieldErrors ?? {},
        statusMessage: action.message,
        confirmedRegistration: null,
      };
    }

    case "LOCAL_PAYMENT_TIMER_EXPIRED": {
      const ref: RetainedRegistrationReference | null = state.confirmedRegistration
        ? {
            registrationId: state.confirmedRegistration.registrationId,
            recoveryToken: state.confirmedRegistration.recoveryToken,
            recordedAtIso:
              state.confirmedRegistration.recordedAtLagos || new Date().toISOString(),
          }
        : state.retainedReference;
      return {
        ...state,
        uiState: "expired_session",
        confirmedRegistration: null,
        sessionExpiresAtMs: null,
        retainedReference: ref,
        statusMessage:
          "The 30-minute automatic display period for this device has ended. Your registration record remains active on AFOGRADE's server.",
      };
    }

    case "OPEN_RECOVERY_VIEW":
      return {
        ...state,
        uiState: "recovery",
        statusMessage: null,
      };

    case "RETURN_TO_FORM_FROM_RECOVERY":
      if (!state.serverConfig) {
        return {
          ...state,
          uiState: "config_error",
          statusMessage:
            "Online registration is currently unavailable. Please contact AFOGRADE on WhatsApp.",
        };
      }
      if (state.serverConfig.registrationState === "OPEN") {
        return {
          ...state,
          uiState: "form",
          statusMessage: null,
        };
      }
      return {
        ...state,
        uiState:
          state.serverConfig.registrationState === "PAUSED"
            ? "paused"
            : state.serverConfig.registrationState === "CLOSED"
              ? "closed"
              : "not_open",
        statusMessage: state.serverConfig.stateMessage ?? null,
      };

    case "START_NEW_REGISTRATION_CONFIRMED":
      return {
        ...state,
        uiState:
          state.serverConfig?.registrationState === "OPEN" ? "form" : "config_error",
        confirmedRegistration: null,
        retainedReference: null,
        sessionExpiresAtMs: null,
        attemptKey: null,
        fieldErrors: {},
        statusMessage: null,
      };
  }
}

export function canDisplayPaymentDetails(state: RegistrationMachineState): boolean {
  return (
    state.uiState === "payment" &&
    state.confirmedRegistration !== null &&
    Boolean(state.confirmedRegistration.registrationId) &&
    state.confirmedRegistration.expectedAmountNgn > 0
  );
}

