/**
 * Cryptographic Helpers for Submission Idempotency & Payload Binding
 * Implements PRD Sections 9.4 & 11.2.
 */

export function generateSubmissionKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `sub_${crypto.randomUUID()}`;
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `sub_${hex}`;
}

export interface FingerprintableSubmission {
  fullName: string;
  whatsappCanonical: string;
  telegramUsername: string;
  email: string;
  stateOfResidence: string;
  schoolName: string;
  subjectsLabel: string;
  planId: string;
}

/**
 * Computes a deterministic SHA-256 hex digest of the normalized registration fields.
 * Ensures a submissionKey cannot be silently reused with mutated student/plan data.
 */
export async function computePayloadHash(input: FingerprintableSubmission): Promise<string> {
  const canonical = JSON.stringify({
    fullName: input.fullName.trim().toLowerCase(),
    whatsappCanonical: input.whatsappCanonical.trim(),
    telegramUsername: input.telegramUsername.trim().toLowerCase(),
    email: input.email.trim().toLowerCase(),
    stateOfResidence: input.stateOfResidence.trim(),
    schoolName: input.schoolName.trim().toLowerCase(),
    subjectsLabel: input.subjectsLabel.trim(),
    planId: input.planId.trim(),
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const digestBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digestBuffer), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

export function isValidRegistrationId(value: string): boolean {
  return /^AFO-2027-\d{5,}$/.test(value.trim());
}

