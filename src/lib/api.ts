/**
 * Google Apps Script Web App Integration Client (PRD Section 9)
 *
 * Key engineering guarantees:
 * 1. Fails closed (`CONFIG_INVALID`) when `NEXT_PUBLIC_APPS_SCRIPT_URL` is not configured.
 *    Never simulates fake registration or payment success (Master Build Instructions Section 7).
 * 2. Sends POST bodies as `text/plain;charset=utf-8` to avoid CORS preflight failures on
 *    Apps Script `302` redirects while validating JSON responses strictly.
 * 3. Treats network timeouts and unreadable responses on `register` as `UNKNOWN`
 *    (ambiguous outcome), preserving the submissionKey and supporting bounded `status` recovery.
 */

import { isAppsScriptConfigured, PUBLIC_ENV } from "../config/env.ts";
import { getVerifiedFallbackBankDetails } from "../config/programme.ts";
import type {
  ApiErrorCode,
  ConfirmedRegistration,
  ConfigResult,
  GalleryCategory,
  PastUtmeScoreItem,
  PlanOption,
  RegisterRequestPayload,
  RegisterResult,
  ServerConfigPayload,
  ServerRegistrationStatus,
  SocialLinksOverrideMap,
  StatusRequestPayload,
  StatusResult,
  StudentTestimonialItem,
  TrackRecordGalleryItem,
  TrackRecordPayload,
} from "../types/registration.ts";
import { isValidRegistrationId } from "./crypto.ts";

const CONFIG_TIMEOUT_MS = 12_000;
const REGISTER_TIMEOUT_MS = 20_000;
const STATUS_TIMEOUT_MS = 12_000;

const VALID_SERVER_STATES = new Set<ServerRegistrationStatus>([
  "NOT_OPEN",
  "OPEN",
  "PAUSED",
  "CLOSED",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "follow",
      credentials: "omit",
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }
}

function parsePlanOption(raw: unknown): PlanOption | null {
  if (!isRecord(raw)) return null;
  const months = Number(raw.months);
  const monthlyPriceNgn = Number(raw.monthlyPriceNgn);
  const totalAmountNgn = Number(raw.totalAmountNgn);

  if (
    typeof raw.id !== "string" ||
    !raw.id.trim() ||
    typeof raw.name !== "string" ||
    !raw.name.trim() ||
    ![1, 2, 3, 4].includes(months) ||
    !Number.isFinite(monthlyPriceNgn) ||
    monthlyPriceNgn <= 0 ||
    !Number.isFinite(totalAmountNgn) ||
    totalAmountNgn <= 0
  ) {
    return null;
  }

  return {
    id: raw.id.trim(),
    name: raw.name.trim(),
    months: months as 1 | 2 | 3 | 4,
    monthlyPriceNgn,
    totalAmountNgn,
    startCycleLabel:
      typeof raw.startCycleLabel === "string" ? raw.startCycleLabel : "Scheduled cycle",
    coveredCyclesLabel:
      typeof raw.coveredCyclesLabel === "string"
        ? raw.coveredCyclesLabel
        : `${months} programme cycle${months > 1 ? "s" : ""}`,
    accessEndLabel:
      typeof raw.accessEndLabel === "string" ? raw.accessEndLabel : "End of covered cycle",
    available: Boolean(raw.available),
    badge: typeof raw.badge === "string" ? raw.badge : undefined,
  };
}

function parseConfirmedRegistration(raw: unknown): ConfirmedRegistration | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.registrationId !== "string" || !isValidRegistrationId(raw.registrationId)) {
    return null;
  }
  const expectedAmountNgn = Number(raw.expectedAmountNgn);
  const months = Number(raw.months);
  if (!Number.isFinite(expectedAmountNgn) || expectedAmountNgn <= 0) {
    return null;
  }

  const fallbackBank = getVerifiedFallbackBankDetails();
  const rawBank = isRecord(raw.bankDetails) ? raw.bankDetails : null;

  return {
    registrationId: raw.registrationId.trim(),
    firstName:
      typeof raw.firstName === "string" && raw.firstName.trim()
        ? raw.firstName.trim().slice(0, 40)
        : "Candidate",
    planId: typeof raw.planId === "string" ? raw.planId : "",
    planName: typeof raw.planName === "string" ? raw.planName : "Mentorship Plan",
    months: Number.isFinite(months) && months >= 1 && months <= 4 ? months : 1,
    coveredCyclesLabel:
      typeof raw.coveredCyclesLabel === "string" ? raw.coveredCyclesLabel : "",
    accessEndLabel: typeof raw.accessEndLabel === "string" ? raw.accessEndLabel : "",
    expectedAmountNgn,
    recordedAtLagos:
      typeof raw.recordedAtLagos === "string" ? raw.recordedAtLagos : "",
    recoveryToken:
      typeof raw.recoveryToken === "string" && raw.recoveryToken.trim()
        ? raw.recoveryToken.trim()
        : undefined,
    bankDetails: {
      bankName:
        rawBank && typeof rawBank.bankName === "string" && rawBank.bankName.trim()
          ? rawBank.bankName.trim()
          : fallbackBank.bankName,
      accountName:
        rawBank && typeof rawBank.accountName === "string" && rawBank.accountName.trim()
          ? rawBank.accountName.trim()
          : fallbackBank.accountName,
      accountNumber:
        rawBank &&
        typeof rawBank.accountNumber === "string" &&
        /^\d{10}$/.test(rawBank.accountNumber.trim())
          ? rawBank.accountNumber.trim()
          : fallbackBank.accountNumber,
    },
  };
}

export async function fetchServerConfig(): Promise<ConfigResult> {
  if (!isAppsScriptConfigured()) {
    return {
      ok: false,
      code: "CONFIG_INVALID",
      message:
        "Online registration service is not yet connected for this deployment. You can reach AFOGRADE directly via the official WhatsApp line.",
    };
  }

  try {
    const separator = PUBLIC_ENV.appsScriptUrl.includes("?") ? "&" : "?";
    const url = `${PUBLIC_ENV.appsScriptUrl}${separator}action=config`;
    const response = await fetchWithTimeout(url, { method: "GET" }, CONFIG_TIMEOUT_MS);

    if (!response.ok) {
      return {
        ok: false,
        code: "SERVER_ERROR",
        message:
          "Registration configuration could not be loaded at the moment. Please try again shortly or enquire via WhatsApp.",
      };
    }

    const parsed: unknown = await response.json();
    if (!isRecord(parsed) || parsed.ok !== true || !isRecord(parsed.data)) {
      const code =
        isRecord(parsed) && typeof parsed.code === "string"
          ? (parsed.code as ApiErrorCode)
          : "CONFIG_INVALID";
      const message =
        isRecord(parsed) && typeof parsed.message === "string"
          ? parsed.message
          : "Registration settings are temporarily unavailable.";
      return { ok: false, code, message };
    }

    const payload = parsed.data;
    const state = payload.registrationState;
    if (typeof state !== "string" || !VALID_SERVER_STATES.has(state as ServerRegistrationStatus)) {
      return {
        ok: false,
        code: "CONFIG_INVALID",
        message: "Server registration state could not be verified.",
      };
    }

    const rawPlans = Array.isArray(payload.plans) ? payload.plans : [];
    const plans = rawPlans
      .map(parsePlanOption)
      .filter((p): p is PlanOption => p !== null);

    if (state === "OPEN" && !plans.some((p) => p.available)) {
      return {
        ok: false,
        code: "CONFIG_INVALID",
        message:
          "No active subscription plans are currently available for online registration. Please contact AFOGRADE on WhatsApp.",
      };
    }

    const rawTrack = isRecord(payload.trackRecord) ? payload.trackRecord : null;
    let trackRecord: TrackRecordPayload | undefined;
    if (rawTrack) {
      const scores: PastUtmeScoreItem[] = Array.isArray(rawTrack.scores)
        ? rawTrack.scores
            .filter(isRecord)
            .map((s, idx) => ({
              id: typeof s.id === "string" ? s.id : `sheet-score-${idx}`,
              score: Number(s.score),
              examYear: typeof s.examYear === "string" ? s.examYear : "2026",
              maxScore: Number(s.maxScore) || 400,
              note: typeof s.note === "string" ? s.note : undefined,
              approved: Boolean(s.approved),
            }))
            .filter((s) => Number.isFinite(s.score) && s.score > 0 && s.approved)
        : [];

      const testimonials: StudentTestimonialItem[] = Array.isArray(rawTrack.testimonials)
        ? rawTrack.testimonials
            .filter(isRecord)
            .map((t, idx) => ({
              id: typeof t.id === "string" ? t.id : `sheet-rev-${idx}`,
              displayName: typeof t.displayName === "string" ? t.displayName.trim() : "",
              photoUrl: typeof t.photoUrl === "string" ? t.photoUrl.trim() : undefined,
              institutionAndCourse:
                typeof t.institutionAndCourse === "string"
                  ? t.institutionAndCourse.trim()
                  : undefined,
              reviewText: typeof t.reviewText === "string" ? t.reviewText.trim() : "",
              feedbackScreenshotUrl:
                typeof t.feedbackScreenshotUrl === "string"
                  ? t.feedbackScreenshotUrl.trim()
                  : undefined,
              consentVerified: Boolean(t.consentVerified),
              approved: Boolean(t.approved),
            }))
            .filter((t) => t.approved && t.consentVerified && t.displayName && t.reviewText)
        : [];

      const validGalleryCategories = new Set<GalleryCategory>([
        "UTME Result",
        "Student Testimonial",
        "WhatsApp Feedback",
        "Admission Success",
        "Achievement",
      ]);

      const gallery: TrackRecordGalleryItem[] = Array.isArray(rawTrack.gallery)
        ? rawTrack.gallery
            .filter(isRecord)
            .map((g, idx) => {
              const cat =
                typeof g.category === "string" &&
                validGalleryCategories.has(g.category as GalleryCategory)
                  ? (g.category as GalleryCategory)
                  : "Achievement";
              return {
                id: typeof g.id === "string" ? g.id : `sheet-gal-${idx}`,
                title: typeof g.title === "string" ? g.title.trim() : "",
                category: cat,
                imageUrl: typeof g.imageUrl === "string" ? g.imageUrl.trim() : "",
                caption: typeof g.caption === "string" ? g.caption.trim() : undefined,
                consentVerified: Boolean(g.consentVerified),
                approved: Boolean(g.approved),
              };
            })
            .filter((g) => g.approved && g.consentVerified && g.title && g.imageUrl)
        : [];

      trackRecord = { scores, testimonials, gallery };
    }

    const rawSocial = isRecord(payload.socialLinks) ? payload.socialLinks : null;
    const socialLinks: SocialLinksOverrideMap | undefined = rawSocial
      ? {
          facebookPage:
            typeof rawSocial.facebookPage === "string" ? rawSocial.facebookPage : undefined,
          facebookCommunity:
            typeof rawSocial.facebookCommunity === "string"
              ? rawSocial.facebookCommunity
              : undefined,
          instagram:
            typeof rawSocial.instagram === "string" ? rawSocial.instagram : undefined,
          whatsapp:
            typeof rawSocial.whatsapp === "string" ? rawSocial.whatsapp : undefined,
          whatsappChannel:
            typeof rawSocial.whatsappChannel === "string"
              ? rawSocial.whatsappChannel
              : undefined,
          telegram:
            typeof rawSocial.telegram === "string" ? rawSocial.telegram : undefined,
          xTwitter:
            typeof rawSocial.xTwitter === "string" ? rawSocial.xTwitter : undefined,
        }
      : undefined;

    const configData: ServerConfigPayload = {
      configVersion:
        typeof payload.configVersion === "string" ? payload.configVersion : "1.0",
      serverTimeIso:
        typeof payload.serverTimeIso === "string" ? payload.serverTimeIso : "",
      registrationState: state as ServerRegistrationStatus,
      stateMessage:
        typeof payload.stateMessage === "string" ? payload.stateMessage : undefined,
      openingDateLabel:
        typeof payload.openingDateLabel === "string"
          ? payload.openingDateLabel
          : undefined,
      closingDateLabel:
        typeof payload.closingDateLabel === "string"
          ? payload.closingDateLabel
          : undefined,
      programmePeriodLabel:
        typeof payload.programmePeriodLabel === "string"
          ? payload.programmePeriodLabel
          : undefined,
      allowInternationalCandidates: Boolean(payload.allowInternationalCandidates),
      plans,
      trackRecord,
      socialLinks,
    };

    return { ok: true, data: configData };
  } catch {
    return {
      ok: false,
      code: "CONFIG_INVALID",
      message:
        "Unable to reach the registration server. Please check your internet connection or contact AFOGRADE on WhatsApp.",
    };
  }
}

export async function submitRegistration(
  payload: RegisterRequestPayload
): Promise<RegisterResult> {
  if (!isAppsScriptConfigured()) {
    return {
      ok: false,
      code: "CONFIG_INVALID",
      message:
        "Online registration endpoint is not configured. Please use the WhatsApp option for assistance.",
    };
  }

  try {
    const response = await fetchWithTimeout(
      PUBLIC_ENV.appsScriptUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      },
      REGISTER_TIMEOUT_MS
    );

    if (!response.ok) {
      return {
        ok: false,
        code: "UNKNOWN",
        message:
          "We could not confirm whether your submission completed because the server returned an unexpected status. Checking registration status safely...",
      };
    }

    const parsed: unknown = await response.json();
    if (!isRecord(parsed)) {
      return {
        ok: false,
        code: "UNKNOWN",
        message: "Received an unreadable response from the registration server.",
      };
    }

    if (parsed.ok === true) {
      const confirmed = parseConfirmedRegistration(parsed.data);
      if (!confirmed) {
        return {
          ok: false,
          code: "SERVER_ERROR",
          message:
            "Server response was missing verified registration details. Please use status recovery.",
        };
      }
      return {
        ok: true,
        data: confirmed,
        idempotentReplay: Boolean(parsed.idempotentReplay),
      };
    }

    const code =
      typeof parsed.code === "string" ? (parsed.code as ApiErrorCode) : "SERVER_ERROR";
    const message =
      typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : "Registration could not be completed. Please review the message and try again.";

    return {
      ok: false,
      code,
      message,
      fieldErrors: isRecord(parsed.fieldErrors)
        ? (parsed.fieldErrors as Record<string, string>)
        : undefined,
    };
  } catch {
    // PRD Section 6 State-machine rule: A timeout or lost connection is an ambiguous outcome, NOT proof of failure.
    return {
      ok: false,
      code: "UNKNOWN",
      message:
        "Your network connection timed out or was interrupted while waiting for confirmation. Your submission key is preserved so we can check whether your registration was recorded without creating a duplicate.",
    };
  }
}

export async function recoverRegistrationStatus(
  query: StatusRequestPayload
): Promise<StatusResult> {
  if (!isAppsScriptConfigured()) {
    return {
      ok: false,
      code: "CONFIG_INVALID",
      message: "Online status recovery is unavailable because the server endpoint is not configured.",
    };
  }

  try {
    const response = await fetchWithTimeout(
      PUBLIC_ENV.appsScriptUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(query),
      },
      STATUS_TIMEOUT_MS
    );

    if (!response.ok) {
      return {
        ok: false,
        code: "UNKNOWN",
        message: "Could not reach the status recovery endpoint right now.",
      };
    }

    const parsed: unknown = await response.json();
    if (!isRecord(parsed)) {
      return {
        ok: false,
        code: "UNKNOWN",
        message: "Unreadable status response.",
      };
    }

    if (parsed.ok === true) {
      const confirmed = parseConfirmedRegistration(parsed.data);
      if (!confirmed) {
        return {
          ok: false,
          code: "SERVER_ERROR",
          message: "Recovered record could not be validated.",
        };
      }
      return { ok: true, data: confirmed };
    }

    const code =
      typeof parsed.code === "string"
        ? (parsed.code as ApiErrorCode)
        : "RECOVERY_NOT_FOUND";
    const message =
      typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : "No matching confirmed registration was found yet.";

    return { ok: false, code, message };
  } catch {
    return {
      ok: false,
      code: "UNKNOWN",
      message: "Network connection interrupted while checking registration status.",
    };
  }
}

const POLL_DELAYS_MS = [1500, 3000, 4500] as const;

export async function pollStatusRecoveryBounded(
  query: StatusRequestPayload
): Promise<StatusResult> {
  for (const delayMs of POLL_DELAYS_MS) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const result = await recoverRegistrationStatus(query);
    if (result.ok || result.code === "CONFIG_INVALID") {
      return result;
    }
  }
  return {
    ok: false,
    code: "UNKNOWN",
    message:
      "We still could not confirm your submission status over the current connection. You can retry safely with the same submission key or reach AFOGRADE on WhatsApp.",
  };
}

