/**
 * Safe Browser Persistence Manager (PRD Sections 5, 11.2, 12.1 & 13)
 *
 * Security & privacy invariants:
 * - NEVER stores phone, email, school, subjects, or bank account numbers.
 * - Automatic payment-screen session expires after 30 minutes (`PAYMENT_SESSION_TTL_MS`).
 * - Retains minimal Registration ID + recovery credential separately so a reload after
 *   30 minutes NEVER erases the student's Registration ID reference.
 * - Treats localStorage as untrusted display state; callers must re-verify with the server
 *   (`POST action=status`) before displaying authoritative payment instructions after reload.
 * - Gracefully falls back to in-memory state when localStorage is blocked/unavailable.
 */

import type {
  PersistedAttemptKey,
  PersistedPaymentSession,
  RetainedRegistrationReference,
} from "../types/registration.ts";
import { isValidRegistrationId } from "./crypto.ts";

export const PAYMENT_SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes (PRD Section 5 & 13)

const ATTEMPT_KEY_STORAGE = "afograde_reg_attempt_v1";
const PAYMENT_SESSION_STORAGE = "afograde_payment_session_v1";
const RETAINED_REF_STORAGE = "afograde_reg_reference_v1";

let memoryAttempt: PersistedAttemptKey | null = null;
let memorySession: PersistedPaymentSession | null = null;
let memoryReference: RetainedRegistrationReference | null = null;

export function checkLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const probeKey = "__afograde_storage_probe__";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function saveAttemptKey(attempt: PersistedAttemptKey): void {
  memoryAttempt = attempt;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ATTEMPT_KEY_STORAGE, JSON.stringify(attempt));
  } catch {
    // Handled via memoryAttempt + UI storage warning
  }
}

export function loadAttemptKey(): PersistedAttemptKey | null {
  if (typeof window === "undefined") return memoryAttempt;
  try {
    const raw = window.localStorage.getItem(ATTEMPT_KEY_STORAGE);
    if (!raw) return memoryAttempt;
    const parsed = JSON.parse(raw) as Partial<PersistedAttemptKey>;
    if (
      typeof parsed.submissionKey === "string" &&
      parsed.submissionKey.startsWith("sub_") &&
      typeof parsed.payloadHash === "string" &&
      parsed.payloadHash.length === 64 &&
      typeof parsed.createdAtMs === "number"
    ) {
      return {
        submissionKey: parsed.submissionKey,
        payloadHash: parsed.payloadHash,
        createdAtMs: parsed.createdAtMs,
      };
    }
    window.localStorage.removeItem(ATTEMPT_KEY_STORAGE);
    return null;
  } catch {
    return memoryAttempt;
  }
}

export function clearAttemptKey(): void {
  memoryAttempt = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ATTEMPT_KEY_STORAGE);
  } catch {
    // Ignore
  }
}

export function saveConfirmedSession(params: {
  registrationId: string;
  recoveryToken: string;
  firstName: string;
  planId: string;
  nowMs?: number;
}): PersistedPaymentSession {
  const now = params.nowMs ?? Date.now();
  const session: PersistedPaymentSession = {
    registrationId: params.registrationId.trim(),
    recoveryToken: params.recoveryToken.trim(),
    firstName: params.firstName.trim().slice(0, 30),
    planId: params.planId.trim(),
    createdAtMs: now,
    expiresAtMs: now + PAYMENT_SESSION_TTL_MS,
  };

  const retained: RetainedRegistrationReference = {
    registrationId: session.registrationId,
    recoveryToken: session.recoveryToken || undefined,
    recordedAtIso: new Date(now).toISOString(),
  };

  memorySession = session;
  memoryReference = retained;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PAYMENT_SESSION_STORAGE, JSON.stringify(session));
      window.localStorage.setItem(RETAINED_REF_STORAGE, JSON.stringify(retained));
    } catch {
      // In-memory state preserved for current tab
    }
  }

  return session;
}

export type RestoredSessionCheck =
  | { status: "none" }
  | { status: "active"; session: PersistedPaymentSession }
  | { status: "expired"; reference: RetainedRegistrationReference };

export function inspectStoredSession(nowMs = Date.now()): RestoredSessionCheck {
  let session: PersistedPaymentSession | null = memorySession;
  let reference: RetainedRegistrationReference | null = memoryReference;

  if (typeof window !== "undefined") {
    try {
      const rawSession = window.localStorage.getItem(PAYMENT_SESSION_STORAGE);
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as Partial<PersistedPaymentSession>;
        if (
          typeof parsed.registrationId === "string" &&
          isValidRegistrationId(parsed.registrationId) &&
          typeof parsed.recoveryToken === "string" &&
          typeof parsed.firstName === "string" &&
          typeof parsed.planId === "string" &&
          typeof parsed.createdAtMs === "number" &&
          typeof parsed.expiresAtMs === "number"
        ) {
          session = {
            registrationId: parsed.registrationId,
            recoveryToken: parsed.recoveryToken,
            firstName: parsed.firstName,
            planId: parsed.planId,
            createdAtMs: parsed.createdAtMs,
            expiresAtMs: parsed.expiresAtMs,
          };
        } else {
          // Tampered or malformed data — purge safely (PRD Section 13)
          window.localStorage.removeItem(PAYMENT_SESSION_STORAGE);
        }
      }

      const rawRef = window.localStorage.getItem(RETAINED_REF_STORAGE);
      if (rawRef) {
        const parsedRef = JSON.parse(rawRef) as Partial<RetainedRegistrationReference>;
        if (
          typeof parsedRef.registrationId === "string" &&
          isValidRegistrationId(parsedRef.registrationId)
        ) {
          reference = {
            registrationId: parsedRef.registrationId,
            recoveryToken:
              typeof parsedRef.recoveryToken === "string"
                ? parsedRef.recoveryToken
                : undefined,
            recordedAtIso:
              typeof parsedRef.recordedAtIso === "string"
                ? parsedRef.recordedAtIso
                : "",
          };
        } else {
          window.localStorage.removeItem(RETAINED_REF_STORAGE);
        }
      }
    } catch {
      // Continue with in-memory fallback
    }
  }

  if (session) {
    if (nowMs < session.expiresAtMs) {
      return { status: "active", session };
    }
    // 30-minute auto-restore window expired; preserve Registration ID reference!
    return {
      status: "expired",
      reference: reference ?? {
        registrationId: session.registrationId,
        recoveryToken: session.recoveryToken || undefined,
        recordedAtIso: new Date(session.createdAtMs).toISOString(),
      },
    };
  }

  if (reference) {
    return { status: "expired", reference };
  }

  return { status: "none" };
}

/**
 * Clears ONLY the active 30-minute auto-restore session on manual expiry while keeping
 * the Registration ID reference intact.
 */
export function expireActivePaymentSessionOnly(): void {
  memorySession = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PAYMENT_SESSION_STORAGE);
  } catch {
    // Ignore
  }
}

/**
 * Full local reset invoked ONLY after explicit user confirmation on "Start New Registration"
 * (PRD FR-13 & Section 12.4).
 */
export function clearAllLocalRegistrationState(): void {
  memoryAttempt = null;
  memorySession = null;
  memoryReference = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ATTEMPT_KEY_STORAGE);
    window.localStorage.removeItem(PAYMENT_SESSION_STORAGE);
    window.localStorage.removeItem(RETAINED_REF_STORAGE);
  } catch {
    // Ignore
  }
}

