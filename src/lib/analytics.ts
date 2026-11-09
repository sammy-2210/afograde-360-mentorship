/**
 * Privacy-Safe Analytics Event Dispatcher (PRD Section 14)
 *
 * Enforces:
 * 1. Never fires unless GA4 is approved by config AND visitor has granted analytics consent.
 * 2. Only emits the 12 PRD-approved event names.
 * 3. Strictly allowlists non-PII parameter keys and scrubs any accidental PII,
 *    registration IDs (AFO-2027-*), submission keys (sub_*), phone numbers, or emails.
 */

import { isAnalyticsEnabledByConfig } from "../config/env.ts";
import type { AnalyticsEventName } from "../types/registration.ts";

export const ANALYTICS_CONSENT_STORAGE_KEY = "afograde_analytics_consent_v1";

const ALLOWED_EVENTS = new Set<AnalyticsEventName>([
  "register_cta_clicked",
  "registration_form_opened",
  "plan_selected",
  "registration_submit_attempted",
  "registration_recorded",
  "registration_failed",
  "payment_instructions_displayed",
  "send_proof_clicked",
  "whatsapp_cta_clicked",
  "payment_cancelled",
  "registration_session_expired",
  "faq_opened",
]);

const ALLOWED_PARAM_KEYS = new Set([
  "cta_location",
  "plan_id",
  "months",
  "error_code",
  "whatsapp_intent",
  "faq_id",
]);

const FORBIDDEN_VALUE_PATTERNS = [
  /AFO-\d{4}-\d+/i,
  /^sub_[a-z0-9-]+$/i,
  /@/,
  /\+?\d{7,}/,
];

export type SafeEventParams = Partial<{
  cta_location: string;
  plan_id: string;
  months: number;
  error_code: string;
  whatsapp_intent: string;
  faq_id: string;
}>;

export function sanitizeAnalyticsParams(
  rawParams?: Record<string, unknown>
): Record<string, string | number> {
  if (!rawParams) return {};
  const clean: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(rawParams)) {
    if (!ALLOWED_PARAM_KEYS.has(key)) {
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = value;
      continue;
    }
    if (typeof value === "string") {
      const trimmed = value.trim().slice(0, 64);
      if (!trimmed) continue;
      const containsSensitive = FORBIDDEN_VALUE_PATTERNS.some((rx) =>
        rx.test(trimmed)
      );
      if (!containsSensitive) {
        clean[key] = trimmed;
      }
    }
  }

  return clean;
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
}

export function setAnalyticsConsent(decision: "granted" | "declined"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, decision);
    window.dispatchEvent(new CustomEvent("afograde:consent-change", { detail: decision }));
  } catch {
    // Ignore storage unavailability; registration flow never depends on analytics.
  }
}

export function getAnalyticsConsentDecision(): "granted" | "declined" | null {
  if (typeof window === "undefined") return null;
  try {
    const val = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return val === "granted" || val === "declined" ? val : null;
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      target: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(
  eventName: AnalyticsEventName,
  params?: SafeEventParams
): void {
  if (!ALLOWED_EVENTS.has(eventName)) return;
  if (!isAnalyticsEnabledByConfig()) return;
  if (!hasAnalyticsConsent()) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const safeParams = sanitizeAnalyticsParams(params as Record<string, unknown>);
  window.gtag("event", eventName, safeParams);
}

