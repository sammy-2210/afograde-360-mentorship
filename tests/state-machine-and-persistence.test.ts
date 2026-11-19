import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computePayloadHash,
  generateSubmissionKey,
  isValidRegistrationId,
} from "../src/lib/crypto.ts";
import {
  clearAllLocalRegistrationState,
  inspectStoredSession,
  PAYMENT_SESSION_TTL_MS,
  saveConfirmedSession,
} from "../src/lib/persistence.ts";
import {
  canDisplayPaymentDetails,
  createInitialMachineState,
  registrationReducer,
} from "../src/lib/stateMachine.ts";
import {
  isRegistrationDeadlinePassed,
  SCHEDULE_CONFIG,
} from "../src/config/programme.ts";
import type { ConfirmedRegistration } from "../src/types/registration.ts";

const SAMPLE_CONFIRMED: ConfirmedRegistration = {
  registrationId: "AFO-2027-00042",
  firstName: "Adaeze",
  planId: "plan-4m",
  planName: "4-Month Full Series Plan",
  months: 4,
  coveredCyclesLabel: "Cycles 1–4",
  accessEndLabel: "31 March 2027",
  expectedAmountNgn: 6000,
  recordedAtLagos: "2026-11-09 10:15:00",
  recoveryToken: "rec_secret_token_example",
  bankDetails: {
    bankName: "Kuda Bank",
    accountName: "AFOGRADE TUTORIALS AND EDUSERVICES",
    accountNumber: "3003920115",
  },
};

describe("Registration State Machine, Idempotency & 30-Minute Session Persistence", () => {
  it("never permits displaying bank details until server-confirmed success or verified recovery", () => {
    let state = createInitialMachineState();
    assert.equal(canDisplayPaymentDetails(state), false);

    state = registrationReducer(state, {
      type: "SUBMIT_STARTED",
      attemptKey: {
        submissionKey: generateSubmissionKey(),
        payloadHash: "a".repeat(64),
        createdAtMs: Date.now(),
      },
    });
    assert.equal(canDisplayPaymentDetails(state), false);

    // Timeout / ambiguous network outcome MUST NOT enter payment AND MUST preserve attemptKey
    const preservedKey = state.attemptKey?.submissionKey;
    state = registrationReducer(state, {
      type: "AMBIGUOUS_OUTCOME",
      message: "Connection timed out.",
    });
    assert.equal(state.uiState, "ambiguous_timeout");
    assert.equal(state.attemptKey?.submissionKey, preservedKey);
    assert.equal(canDisplayPaymentDetails(state), false);

    // Only SERVER_SUCCESS unlocks payment screen
    state = registrationReducer(state, {
      type: "SERVER_SUCCESS",
      registration: SAMPLE_CONFIRMED,
      expiresAtMs: Date.now() + PAYMENT_SESSION_TTL_MS,
    });
    assert.equal(state.uiState, "payment");
    assert.equal(canDisplayPaymentDetails(state), true);
    assert.equal(state.attemptKey, null);
  });

  it("retains Registration ID reference after the 30-minute auto-restore session expires (PRD Section 13)", () => {
    clearAllLocalRegistrationState();
    const startMs = 1_700_000_000_000;

    saveConfirmedSession({
      registrationId: "AFO-2027-00105",
      recoveryToken: "rec_high_entropy_token",
      firstName: "Tunde",
      planId: "plan-2m",
      nowMs: startMs,
    });

    const activeCheck = inspectStoredSession(startMs + 10 * 60 * 1000);
    assert.equal(activeCheck.status, "active");

    const expiredCheck = inspectStoredSession(startMs + 31 * 60 * 1000);
    assert.equal(expiredCheck.status, "expired");
    if (expiredCheck.status === "expired") {
      assert.equal(expiredCheck.reference.registrationId, "AFO-2027-00105");
      assert.equal(expiredCheck.reference.recoveryToken, "rec_high_entropy_token");
    }

    clearAllLocalRegistrationState();
    assert.equal(inspectStoredSession().status, "none");
  });

  it("produces deterministic SHA-256 payload fingerprints and detects payload mutation", async () => {
    const base = {
      fullName: "Chinedu Okafor",
      whatsappCanonical: "+2348030001111",
      telegramUsername: "chinedu27",
      email: "",
      stateOfResidence: "Enugu",
      schoolName: "",
      subjectsLabel: "Use of English, Mathematics, Chemistry, Physics",
      planId: "plan-3m",
    };

    const hashA = await computePayloadHash(base);
    const hashB = await computePayloadHash({ ...base, fullName: "  chinedu okafor " });
    const hashMutated = await computePayloadHash({ ...base, planId: "plan-1m" });

    assert.equal(hashA.length, 64);
    assert.equal(hashA, hashB);
    assert.notEqual(hashA, hashMutated);
    assert.equal(isValidRegistrationId("AFO-2027-00001"), true);
    assert.equal(isValidRegistrationId("INVALID-123"), false);
  });

  it("detects the registration deadline to the second", () => {
    const deadlineMs = Date.parse(SCHEDULE_CONFIG.registrationDeadlineIso);
    // 22 Nov 2026 23:59 in Lagos is 22:59 UTC.
    assert.equal(new Date(deadlineMs).toISOString(), "2026-11-22T22:59:00.000Z");
    assert.equal(isRegistrationDeadlinePassed(deadlineMs - 1000), false);
    assert.equal(isRegistrationDeadlinePassed(deadlineMs), true);
  });

  it("closes the form at the deadline but keeps a recorded registration's payment screen", () => {
    const formState = { ...createInitialMachineState(), uiState: "form" as const };
    const closed = registrationReducer(formState, {
      type: "DEADLINE_PASSED",
      message: "closed",
    });
    assert.equal(closed.uiState, "closed");
    assert.equal(closed.statusMessage, "closed");

    const paymentState = registrationReducer(createInitialMachineState(), {
      type: "SERVER_SUCCESS",
      registration: SAMPLE_CONFIRMED,
      expiresAtMs: Date.now() + PAYMENT_SESSION_TTL_MS,
    });
    const after = registrationReducer(paymentState, {
      type: "DEADLINE_PASSED",
      message: "closed",
    });
    assert.equal(after.uiState, "payment");
    assert.equal(canDisplayPaymentDetails(after), true);
  });
});
