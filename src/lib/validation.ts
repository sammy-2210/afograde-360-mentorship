/**
 * Client-Side Form Validation & Normalisation (PRD Section 8 REG-01..REG-11)
 * Note: Apps Script repeats all validation authoritatively on the server.
 */

import {
  COMPULSORY_SUBJECT,
  ELECTIVE_SUBJECTS,
  NIGERIAN_STATES_AND_FCT,
} from "../config/programme.ts";
import type {
  ElectiveSubject,
  FieldValidationErrors,
  PlanOption,
  RegistrationFormValues,
} from "../types/registration.ts";

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]{0,78}[\p{L}\p{M}.]$/u;
const TELEGRAM_PATTERN = /^[a-zA-Z0-9_]{5,32}$/;
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const NIGERIAN_MOBILE_CANONICAL = /^\+234[789][01]\d{8}$/;
const INTERNATIONAL_E164 = /^\+[1-9]\d{6,14}$/;

export function normalizeFullName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function extractFirstName(fullName: string): string {
  const cleaned = normalizeFullName(fullName);
  const firstToken = cleaned.split(" ")[0] ?? "Candidate";
  return firstToken.slice(0, 30);
}

/**
 * Normalises Nigerian mobile numbers (080..., 23480..., +23480..., +234080...)
 * to canonical E.164 (+2348012345678), and optionally international E.164 numbers.
 */
export function normalizeWhatsAppNumber(
  raw: string,
  allowInternational = false
): { valid: boolean; canonical: string; error?: string } {
  const stripped = raw.replace(/[\s\-().]/g, "").trim();

  if (!stripped) {
    return {
      valid: false,
      canonical: "",
      error: "Enter your active WhatsApp phone number.",
    };
  }

  let candidate = stripped;

  if (/^0[789][01]\d{8}$/.test(candidate)) {
    candidate = `+234${candidate.slice(1)}`;
  } else if (/^2340[789][01]\d{8}$/.test(candidate)) {
    candidate = `+234${candidate.slice(4)}`;
  } else if (/^234[789][01]\d{8}$/.test(candidate)) {
    candidate = `+${candidate}`;
  } else if (/^\+2340[789][01]\d{8}$/.test(candidate)) {
    candidate = `+234${candidate.slice(5)}`;
  }

  if (candidate.startsWith("+234") || (!candidate.startsWith("+") && !allowInternational)) {
    if (!NIGERIAN_MOBILE_CANONICAL.test(candidate)) {
      return {
        valid: false,
        canonical: candidate,
        error: "Enter a valid 11-digit Nigerian WhatsApp number (e.g. 08012345678 or +2348012345678).",
      };
    }
    return { valid: true, canonical: candidate };
  }

  if (!allowInternational) {
    return {
      valid: false,
      canonical: candidate,
      error:
        "Online registration currently accepts Nigerian mobile numbers (+234). Contact AFOGRADE on WhatsApp for international enquiries.",
    };
  }

  if (!INTERNATIONAL_E164.test(candidate)) {
    return {
      valid: false,
      canonical: candidate,
      error: "Enter a valid international WhatsApp number starting with + and country code.",
    };
  }

  return { valid: true, canonical: candidate };
}

/**
 * Strips at most ONE leading '@' per PRD REG-03.
 */
export function normalizeTelegramUsername(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
}

export function formatUtmeSubjectsLabel(
  electives: readonly ElectiveSubject[]
): string {
  const ordered = ELECTIVE_SUBJECTS.filter((subj) => electives.includes(subj));
  return [COMPULSORY_SUBJECT, ...ordered].join(", ");
}

export interface ValidationOptions {
  availablePlans: readonly PlanOption[];
  allowInternational?: boolean;
  requireTurnstile?: boolean;
}

export function validateSingleField(
  field: keyof RegistrationFormValues,
  values: RegistrationFormValues,
  options: ValidationOptions
): string | undefined {
  const allowInternational = options.allowInternational ?? false;

  switch (field) {
    case "fullName": {
      const normalized = normalizeFullName(values.fullName);
      if (!normalized) {
        return "Enter the candidate's full name.";
      }
      if (normalized.length < 2 || normalized.length > 80) {
        return "Full name must be between 2 and 80 characters.";
      }
      if (!NAME_PATTERN.test(normalized)) {
        return "Full name may only contain letters, spaces, hyphens, and apostrophes.";
      }
      return undefined;
    }

    case "whatsappNumber": {
      const check = normalizeWhatsAppNumber(values.whatsappNumber, allowInternational);
      return check.valid ? undefined : check.error;
    }

    case "telegramUsername": {
      const normalized = normalizeTelegramUsername(values.telegramUsername);
      if (!normalized) return undefined;
      if (!TELEGRAM_PATTERN.test(normalized)) {
        return "Telegram username must be 5–32 characters using letters, numbers, or underscores.";
      }
      return undefined;
    }

    case "email": {
      const trimmed = values.email.trim();
      if (!trimmed) return undefined;
      if (trimmed.length > 254 || !EMAIL_PATTERN.test(trimmed)) {
        return "Enter a valid email address or leave this field blank.";
      }
      return undefined;
    }

    case "stateOfResidence": {
      const val = values.stateOfResidence.trim();
      if (!val) {
        return "Select your state of residence.";
      }
      const allowedStates = allowInternational
        ? [...NIGERIAN_STATES_AND_FCT, "Outside Nigeria"]
        : NIGERIAN_STATES_AND_FCT;
      if (!allowedStates.includes(val)) {
        return "Select a valid state from the list.";
      }
      return undefined;
    }

    case "schoolName": {
      const trimmed = values.schoolName.trim();
      if (!trimmed) return undefined;
      if (trimmed.length > 100) {
        return "School name must be 100 characters or fewer.";
      }
      if (/[<>]/.test(trimmed)) {
        return "School name contains invalid characters.";
      }
      return undefined;
    }

    case "electiveSubjects": {
      const unique = new Set(values.electiveSubjects);
      const allValid = values.electiveSubjects.every((s) =>
        ELECTIVE_SUBJECTS.includes(s)
      );
      if (!allValid || unique.size !== 3 || values.electiveSubjects.length !== 3) {
        return "Select exactly 3 Science subjects alongside Use of English.";
      }
      return undefined;
    }

    case "planId": {
      if (!values.planId) {
        return "Select an available subscription plan.";
      }
      const matched = options.availablePlans.find(
        (p) => p.id === values.planId && p.available
      );
      if (!matched) {
        return "The selected plan is not currently available. Please choose an available plan.";
      }
      return undefined;
    }

    case "privacyAcknowledged": {
      if (!values.privacyAcknowledged) {
        return "Please review and acknowledge the Privacy Notice before submitting.";
      }
      return undefined;
    }

    case "turnstileToken": {
      if (options.requireTurnstile && !values.turnstileToken.trim()) {
        return "Complete the security verification challenge before submitting.";
      }
      return undefined;
    }

    case "honeypot":
      return undefined;
  }
}

export function validateRegistrationForm(
  values: RegistrationFormValues,
  options: ValidationOptions
): { isValid: boolean; errors: FieldValidationErrors } {
  const errors: FieldValidationErrors = {};

  const fieldsToCheck: Array<{
    source: keyof RegistrationFormValues;
    target: keyof FieldValidationErrors;
  }> = [
    { source: "fullName", target: "fullName" },
    { source: "whatsappNumber", target: "whatsappNumber" },
    { source: "telegramUsername", target: "telegramUsername" },
    { source: "email", target: "email" },
    { source: "stateOfResidence", target: "stateOfResidence" },
    { source: "schoolName", target: "schoolName" },
    { source: "electiveSubjects", target: "electiveSubjects" },
    { source: "planId", target: "planId" },
    { source: "privacyAcknowledged", target: "privacyAcknowledged" },
    { source: "turnstileToken", target: "turnstileToken" },
  ];

  for (const { source, target } of fieldsToCheck) {
    const err = validateSingleField(source, values, options);
    if (err) {
      errors[target] = err;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatNaira(amountNgn: number): string {
  return `₦${Math.round(amountNgn).toLocaleString("en-NG")}`;
}

